(function() {
  angular.module('vumixManagerApp.services')
    .factory('projectService', function($http) {
     return{
       
       addProject: function(company_name, project_name, marker_type, upload_project, userId){
           return $http({
              method: 'POST',
              url: '/api/users/' + userId + '/projects',
              data: {
                name: project_name,
                company_name: company_name,
                marker_type: marker_type,
                upload_project: upload_project    //this supposed to be vuforia package        
              },
           }).then (function (res){
               return res.data.data[0];
           }, function errorCallback(res){
               console.log("error");
           });  
       },
       
    //    deleteProject: function(projects, userId, id){
    //        return $http({
    //            method: 'DELETE',
    //            url: '/api/users/' + userId + '/projects/' + id      
    //        }).then(function(res){
    //            for(var i = 0; i < projects.length; i++){
    //                if(id === projects[i].id){
    //                    projects.splice(i, 1);
    //                }
    //            }
    //            return projects;
    //        });
    //    },
      
       
    //    showAllProject: function(projects, userId){
    //        return $http({
    //            method: 'GET',
    //            url: '/api/users/' + userId + '/projects'
    //        }).then (function(res){
    //            console.log("Show all project" + res);
    //        });
    //    },
         
     };
    }); 
})();
