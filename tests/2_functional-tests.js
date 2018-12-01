/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
var testID;

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {  // new issues
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')  ////////////////////////////////////////// project "test"
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Every field filled in");
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          assert.equal(res.body.open, true);
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          testID = res.body._id;
          console.log(testID); 
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')  ////////////////////////////////////////// project "test"
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "Functional Test - Every field filled in");
          assert.equal(res.body.open, true);
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')  ////////////////////////////////////////// project "test"
        .send({
          issue_title: 'Title',
          created_by: 'Functional Test - Every field filled in'  // issue_text missing so should fail (i.e one of the required fileds)
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "required fields missing");
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {  // updates
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')  ////////////////////////////////////////// project "test"
        .send({
          // no body
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "no id provided");
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')  ////////////////////////////////////////// project "test"
        .send({
          _id: testID,
          issue_title: 'New Title',
          
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          console.log(res.body);
          assert.equal(res.text, "successfully updated");
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')  ////////////////////////////////////////// project "test"
        .send({
          _id: testID,
          issue_text: 'New Text',
          created_by: "Bob",
          assigned_to: "Jim",
          status_text: "Held",
          open: false
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          console.log(res.body);
          assert.equal(res.text, "successfully updated");
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {  // get issues
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({issue_title: "New Title"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].issue_title, "New Title");
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({issue_title: "New Title", issue_text: "New Text"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].issue_title, "New Title");
          assert.equal(res.body[0].issue_text, "New Text");
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() { // delete issues
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "_id error");
            done();
        });
      });
      
      test('Valid _id', function(done) { //
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: testID })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "deleted "+ testID);
            done();
        });
      });
      
    });

});
