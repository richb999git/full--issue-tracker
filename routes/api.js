/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
var db;
// used mongodb directly rather than Mongoose because it was easier to deal with projects

module.exports = function (app) {
  
  MongoClient.connect(CONNECTION_STRING, function(err, dbase) {
    if (err) {
      console.log("databse connection error");
    } else {
      console.log("database connection ok");
      db = dbase;
     }
  }); 


      app.route('/api/issues/:project')

        .get(function (req, res){
          var project = req.params.project;
          console.log("[get]" + project);
          var queryObj = {};
          if (req.query.issue_title) { queryObj.issue_title = req.query.issue_title; }
          if (req.query.issue_text) { queryObj.issue_text = req.query.issue_text; }
          if (req.query.status_text) { queryObj.status_text = req.query.status_text; }
          if (req.query.created_by) { queryObj.created_by = req.query.created_by; }
          if (req.query.assigned_to) { queryObj.assigned_to = req.query.assigned_to; }
          if (req.query.created_on) { queryObj.created_on = req.query.created_on; }
          if (req.query.updated_on) { queryObj.updated_on = req.query.updated_on; }
          if (req.query.open) { queryObj.open = req.query.open; }
        
          try {
            
            if (req.query._id) { queryObj._id = ObjectId(req.query._id); }
          
            db.collection(project).find(queryObj).toArray(function(err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error finding issues"});
              } else {
                  res.json(data.sort((obj1, obj2) => obj2.updated_on - obj1.updated_on));
              }
            });
          
          } catch (e) {
              console.log(e);
              res.send("could not find " + req.query._id);
            }

        })
  
        
        // need to sort out error testing
        .post(function (req, res){
          var project = req.params.project;
          var issue_title = req.body.issue_title || "";
          var issue_text = req.body.issue_text || "";
          var created_by = req.body.created_by || "";
        
          if (issue_title === "" || issue_text === "" || created_by === "") {
            console.log("required fields missing");
            res.send("required fields missing");
          } else {
              var status_text = req.body.status_text || "";
              var assigned_to = req.body.assigned_to || "";
              var created_on = new Date();
              var updated_on = created_on;
              var doc = {issue_title: issue_title, issue_text: issue_text, created_by: created_by, assigned_to: assigned_to, status_text: status_text, created_on: created_on, updated_on: updated_on, open: true};
              console.log("[post]" + project);
              db.collection(project).insertOne(doc, function (err, data) {
                if (err) {
                  console.log(err);
                  res.json({error: "Error posting issue"});
                } else {
                    //console.log("--", doc._id); //the _id of the doc is set immediatley and is available immediately
                    //console.log("------", data.insertedId); // insertedId is a special property equivalent to the above
                    //console.log("--", data.ops[0]._id);  // ops is the returned object
                    //console.log(data.ops[0]);
                    res.json(data.ops[0])
                }
              });
            
            }
        })


  
        .put(function (req, res){
          var project = req.params.project;
          console.log("[put]" + project);
          var id = req.body._id || "";
          if (id !== "") {
            // test for any other body parameters . if none then return 'no updated field sent' - no update_on change
            var updateObj = {};
            if (req.body.open) { 
              updateObj.open = req.body.open; 
            } else {
              updateObj.issue_title = req.body.issue_title;
              updateObj.issue_text = req.body.issue_text;
              updateObj.status_text = req.body.status_text;
              updateObj.created_by = req.body.created_by;
              updateObj.assigned_to = req.body.assigned_to;
            }
            
            
              if (Object.keys(updateObj) !== 0) {  // not a valid check since using the form differently 
                updateObj.updated_on = new Date();
                var objToUpdate = { $set: updateObj };

                try {
                  db.collection(project).updateOne({_id: ObjectId(id)}, objToUpdate, function(err, data) {
                        console.log("modified: ", data.modifiedCount);
                        if (err) {
                          console.log("error");
                          res.send("error");
                        } else  if (data.modifiedCount === 1) {                
                             console.log("successfully updated");
                             res.send("successfully updated");
                           } else {
                             console.log("could not update " + id);
                             res.send("could not update " + id);
                           }
                  });
                } catch (e) {
                  console.log(e);
                  res.send("could not update " + id);
                }

              } else {
                console.log("no updated field sent");
                res.send("no updated field sent");
              }
            
          } else {
            console.log("no id provided");
            res.send("no id provided");
          }
          
        })

  
        .delete(function (req, res){
          var project = req.params.project;
          console.log("[delete]" + project);
          var id = req.body._id;
          // If no _id is sent return '_id error', success: 'deleted '+_id, failed: 'could not delete '+_id.
          if (id) {
            
            try {
               db.collection(project).deleteOne( { _id: ObjectId(id)} , function(err, data) {
                 
                 if (err) {
                   console.log(err);
                   res.send("could not delete " + id);
                 } else if (data.deletedCount === 1) {                
                     console.log("deleted "+ id);
                     res.send("deleted "+ id);
                   } else {
                     console.log("could not delete " + id);
                     res.send("could not delete " + id);
                   }
               });
             
            } catch (e) {
                console.log(e);
                res.send("could not delete " + id);
              }

              
          } else {
            console.log("_id error");
            res.send("_id error");
          }
            
          

        });
      

        
        // get the projects and add a project
        app.route('/api/projects') 
          
          // get the projects
          .get(function (req, res) {    
            console.log("[projects get]");  
              try {
                db.collection("__projects").findOne({}, function(err, data) {
                  if (err) {
                    console.log(err);
                    res.json({error: "Error finding project"});
                  } else {
                      // need to loop through each project (db collection) that is in the __projects collection
                      var openCount = [];
                      var closedCount = [];
                      var latestUpdateDate = [];
                      var projDetails = [];
                      var i = 0;
                      data.projects.forEach(function(el) {                  
                        db.collection(el).find().toArray(function(err, proj) {
                            // get all data for each project (db collection) and find how many are open/close and the latest update date                    
                            openCount.push(0);
                            closedCount.push(0);
                            latestUpdateDate.push(0);
                            proj.forEach(function(issue) {
                                if (issue.open === true) {++openCount[i];}
                                else {++closedCount[i];}
                                if (issue.updated_on > latestUpdateDate[i]) {latestUpdateDate[i] = issue.updated_on;}
                            });
                            var obj = {proj: el, openCount: openCount[i], closedCount: closedCount[i], latestUpdateDate: latestUpdateDate[i]};
                            projDetails.push(obj);
                            i++;
                            // break out and send sorted data at end of project list
                            if (i == data.projects.length) {res.json(projDetails.sort((obj1, obj2) => obj2.latestUpdateDate - obj1.latestUpdateDate));}
                        });
                        
                      });

                  }
                });

              } catch (e) {
                  console.log(e);
                  console.log("could not find projects");
                  res.send("could not find projects");
                }
          
          })
  
          
          // add a project
          .post(function (req, res) {
            var projectToAdd = req.body.newProject;
            console.log("[projects post] " + projectToAdd);  
            if (projectToAdd === "" || projectToAdd === undefined || projectToAdd === "__projects") {
              console.log("invalid projects provided");
              res.redirect("/");
            } else {

              // get projects and then check if submitted project exists. If not then push it on
                db.collection("__projects").findOne({}, function (err, data) {
                    if (err) {
                      console.log(err);
                      res.json({error: "Error posting projects"});
                    } else {
                        var found = data.projects.indexOf(projectToAdd) !== -1;
                        if (!found) {
                          db.collection("__projects").updateOne({ _id: ObjectId("5bf886d8ea587d14fe4f1603") }, { $push: { projects: projectToAdd } }, function (err, data) {
                              if (err) {
                                console.log(err);
                                res.json({error: "Error posting projects"});
                              } else {
                                  console.log("project added");
                                  res.redirect("/" + projectToAdd + "/");
                              }
                          });
                        } else {
                          console.log("Project already exists");
                          //res.send("Project already exists");
                          res.redirect("/");
                        }
                    }
                });  
            }
          
        });

};

