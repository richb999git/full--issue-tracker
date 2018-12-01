$(function() {
        var currentProject = window.location.pathname.replace(/\//g, "");;
        var url = "/api/issues/"+currentProject;
        currentProject = currentProject.replace(/%20/g, " ");
        $('#projectTitle').text('All issues for project: ' + currentProject)
        $.ajax({
          type: "GET",
          url: url,
          success: function(data)
          {
            var issues= [];
            data.forEach(function(ele) {
              var openstatus;
              ele.open === true ? openstatus = 'open' : openstatus = 'closed';
              ele.created_on === 0 ? ele.created_on = "None" : ele.created_on = new Date(ele.created_on).toLocaleString();
              ele.updated_on === 0 ? ele.updated_on = "None" : ele.updated_on = new Date(ele.updated_on).toLocaleString();
              var single = [
                '<div class="issue '+openstatus+'">',
                '<div class="issueDetails">',
                '<h3 class="updateIssue" id="'+ele._id+'">' + ele.issue_title + '</h3><span class="status">' + openstatus +'</span>',
                '<br>',
                '<b>'+ele.issue_text+'</b>',
                '<p>'+ele.status_text+'</p>',
                '<br><div class="bot"',
                '<p>Created by: '+ele.created_by + '</p>',
                '<p>Assigned to: '+ele.assigned_to + '</p>',
                '<p class="id">Created on: '+ele.created_on + '</p>',  
                '<p class="id">Last updated: '+ele.updated_on + '</p>',
                '<br><a href="#" class="closeIssue" id="'+ele._id+'">close</a> <a href="#" class="deleteIssue" id="'+ele._id+'">delete</a>',
                '<a href="#" class="editIssue" id="'+ele._id+'">edit</a>',
                '</div></div></div>'               
              ];
              issues.push(single.join(''));
            });
            $('#issueDisplay').html(issues.join(''));
          }
        });
        
        $('#newIssue').submit(function(e){
          e.preventDefault();
          $(this).attr('action', "/api/issues/" + currentProject);
          $.ajax({
            type: "POST",
            url: url,
            data: $(this).serialize(),
            success: function(data) { window.location.reload(true); }
          });
        });
        
        $('#issueDisplay').on('click','.closeIssue', function(e) {
          var url = "/api/issues/"+currentProject;
          $.ajax({
            type: "PUT",
            url: url,
            data: {_id: $(this).attr('id'), open: false},
            success: function(data) { alert(data); window.location.reload(true); }
          });
          e.preventDefault();
        });
  
        $('#issueDisplay').on('click','.deleteIssue', function(e) {
          var url = "/api/issues/"+currentProject;
          $.ajax({
            type: "DELETE",
            url: url,
            data: {_id: $(this).attr('id')},
            success: function(data) { alert(data); window.location.reload(true); }
          });
          e.preventDefault();
        });
        
  
    
        function showUpdateBox(currentId) {
          var url = "/api/issues/"+currentProject;
          var a = document.getElementById(currentId);
          document.getElementById("iss_title").value = a.textContent;
          document.getElementById("iss_text").value = a.parentElement.childNodes[3].textContent;
          document.getElementById("cby").value = a.parentElement.childNodes[6].childNodes[0].textContent.substring(12);
          document.getElementById("ass").value = a.parentElement.childNodes[6].childNodes[2].textContent.substring(13);;
          document.getElementById("stat").value = a.parentElement.childNodes[4].textContent;
          document.getElementById("currentId").value = currentId;
          toggleModal();
        }
  
        $('#issueDisplay').on('click','.updateIssue', function(e) {  // clicking title
          showUpdateBox($(this).attr('id'));
        });
  
        $('#issueDisplay').on('click','.editIssue', function(e) {  // clicking button
          showUpdateBox($(this).attr('id'));
        });
  

  

        document.getElementById("editIssue").addEventListener("submit", function(e){
          var url = "/api/issues/"+currentProject;
          $(this).attr('action', "/api/issues/" + currentProject);
          var obj = $(this).serialize() + "&_id=" + document.getElementById("currentId").value;
          toggleModal();
          $.ajax({
            type: "PUT",
            url: url,
            data: obj,
            success: function(data) { alert(data); window.location.reload(true); }
          });
          e.preventDefault();        
        });
  
  
        function toggleModal() {
          document.querySelector(".modal").classList.toggle("show-modal");
        }
  
        // clicking off modal to close
        function windowOnClick(event) {
          if (event.target === document.querySelector(".modal")) {
            toggleModal();
          }
        }
  
        window.addEventListener("click", windowOnClick); // clicking off modal to close
        document.querySelector(".close-button").addEventListener("click", toggleModal);
  
      });