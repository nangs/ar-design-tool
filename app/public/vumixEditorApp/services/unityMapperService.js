(function() {
  angular.module('vumixEditorApp.services')
    .factory('unityMapper', function() {
      return {
        setTransformMode: function(val) {
          SendMessage("Control Scripts", "SetTransformMode", val);
        }
      };
    }); 
})();