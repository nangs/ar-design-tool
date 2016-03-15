(function() {
  angular.module('vumixManagerApp.services')
    .factory('modelService', function($http) {
     return{
       
       addModel: function(model_name, userId, file_size, file_extension){
           return $http({
              method: 'POST',
              url: '/api/users/' + userId + '/models',
              data: {
                  name : model_name,
                  file_size : file_size,
                  file_extension : file_extension
              }
           }).then(function(res){
               return res.data.data[0];
           }, function errorCallback(res){
               console.log("error uploading file")
           });  
       },
       
       deleteModel: function(models, userId, id){
           return $http({
               method: 'DELETE',
               url: '/api/users/' + userId + '/models/' + id 
           }).then(function(res){
               for(var i =0; i < models.length; i++){
                   if(id === models[i].id){
                       models.splice(i,1);
                   }
               }
               return models;
           });
       },
       
    //    editModel: function(project_name, company_name, marker_type){
    //        return $http({
    //            method: '',
    //            url: ''
               
    //        }).then(function(res){
               
    //        });
    //    },
       
    //    showAllModel: function(projects, userId){
    //        return $http({
    //            method: 'GET',
    //            url: '/api/users/' + userId + '/models'
    //        }).then (function(res){
    //            console.log("Show all models" + res);
    //        });
    //    }
         
     };
    }); 
})();