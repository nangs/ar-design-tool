(function() {
  angular.module('vumixEditorApp.services')
    .factory('unityMapperService', function($http) {
      var service = {};
      
      service.setTransformMode = function(val) {
        SendMessage("Facade", "SetTransformMode", val);
      };
      
      service.buildApk = function() {
        $http.post('/buildproject.php');
      };
      
      service.saveState = function(url) {
        SendMessage('Facade', 'SaveProgress', './uploadstate.php');
      };
      
      return service;
    }); 
})();