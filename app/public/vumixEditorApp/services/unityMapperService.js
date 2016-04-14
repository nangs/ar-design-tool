(function() {
  angular.module('vumixEditorApp.services')
    .factory('unityMapperService', function($http, $interval) {      
      var service = {};
      var q;
            
      service.setTransformMode = function(val) {
        SendMessage('Facade', 'SetTransformMode', val);
      };
      
      service.scaleUpModel = function() {
        q = $interval(function() {
          console.log("up");
        });
      };
      
      service.scaleDownModel = function() {
        q = $interval(function() {
          console.log("down");
        });
      };
      
      service.cancelPromise = function() {
        $interval.cancel(q);
      };
      
      service.openPreview = function() {
        console.log("open preview");
      };
      
      service.closePreview = function() {
        console.log("close preview");
      };
      
      // TODO: change name
      service.saveState = function(url) {
        SendMessage('Facade', 'SaveProgress', '/uploadstate.php');
      };
      
      // subsequent functions will operate on the specified state id
      service.setTargetState = function(stateId) {
        SendMessage('Facade', 'SetTargetState', stateId);
      };
      
      // subsequent functions will operate on the specified object id belongs to specified id above 
      service.setTargetStateObject = function(instanceObjectId) {
        SendMessage('Facade', 'SetTargetStateObject', instanceObjectId);
      };
      
      service.displayState = function() {
        SendMessage('Facade', 'DisplayState');
      };
      
      service.deleteState = function() {
        SendMessage('Facade', 'DeleteState');
      };
      
      service.createState = function() {
        SendMessage('Facade', 'AddNewState');
      };
      
      service.createInstanceObject = function(modelId) {
        SendMessage('Facade', 'SpawnObject', modelId);  
      };
      
      service.removeInstanceObject = function() {
        SendMessage('Facade', 'DeleteGameObject');
      }
      service.createText = function(input) {
        SendMessage('Facade', 'SpawnText', input);  
      };
      
      service.setTransitionId = function(stateId) {
        SendMessage('Facade', 'SetTransitionId', stateId);
      };
      
      service.unsetTransitionId = function() {
        SendMessage('Facade', 'UnSetTransitionId');
      };
      
      service.setActiveGameObject = function() {
        SendMessage('Facade', 'SetActiveGameObject');
      };
      
      return service;
    }); 
})();