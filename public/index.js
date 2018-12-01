
$(function() {
  
  // get database of boards here through AJAX - see api.js
  
  var currentBoard = window.location.pathname.slice(3,-1);
        var url = "/api/projects";
        $('#projectTitle').text('Issue Tracker')
        $.ajax({
          type: "GET",
          url: url,
          success: function(data)
          {
            var issueProjects= [];
            //
            // THIS ARRAY SET UP IS FOR CODE READABILITIES AND TESTING!
            // THIS IS NOT WHAT IT WOULD LOOK LIKE TO GO LIVE
            //
 
            data.forEach(function(ele) {
              var projects = ['<div class="project">'];
              projects.push('<div class="title"><a class="projectButton" href="/' + ele.proj + '/">' + ele.proj + '</a></div>');
              projects.push('<div class="openI"><span>' + ele.openCount + ' Open</span>');
              projects.push('<span class="rightC">' + ele.closedCount + ' Closed</span></div>');
              ele.latestUpdateDate === 0 ? ele.latestUpdateDate = "None" : ele.latestUpdateDate = new Date(ele.latestUpdateDate).toLocaleString();
              projects.push('<div class="lastUpdate">Last updated: ' + ele.latestUpdateDate + '</div>');
              projects.push('</div>');
              issueProjects.push(projects.join(''));
            });
            $('#projectDisplay').html(issueProjects.join(''));
          }
        });
  

  
 

});