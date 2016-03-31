// this service serves as an API for models available on the server
(function() {
  angular.module('vumixEditorApp.services')
    .factory('modelService', function($rootScope, $http) {  
      var _models = {};
      _models.onAssetBundle = [];
      _models.onServer = [];
      
      var service = {};
      
      var notifyAssetBundleModelChange = function() {
        $rootScope.$emit('_$assetBundleModelChange');
      }
      
      var notifyServerModelChange = function() {
        $rootScope.$emit('_$serverModelChange');
      }
      
      service.subscribeToAssetBundleModelChange = function($scope, callback) {
        var handler = $rootScope.$on('_$assetBundleModelChange', callback);
        $scope.$on('$destroy', handler);
      }
      
      service.subscribeToServerModelChange = function($scope, callback) {
        var handler = $rootScope.$on('_$serverModelChange', callback);
        $scope.$on('$destroy', handler);
      }
      
// ASSETBUNDLES OBJECT APIS START HERE   

      service.getAllAssetBundleModels = function() {
        return _models.onAssetBundle;
      }
      
      service.setAssetBundleModels = function(models) {
        _models.onAssetBundleIndex = models.size;
        _models.onAssetBundle = angular.copy(models);
        notifyAssetBundleModelChange();
      }
           
// ASSETBUNDLES OBJECT APIS END HERE

// SERVER OBJECT APIS START HERE      

      service.getAllServerModels = function() {
        return _models.onServer;
      }

// SERVER OBJECT APIS END HERE   

      var uid = "0";
      
      var getUid = function() {    
        document.cookie.split(';').forEach(function(el, index) {
          var _el = el.split('=');
          if(_el[0] === "uid") {
            uid = _el[1];
          }
        });
      };
      
      
      $http.get('/api/users/'+ uid + '/models').then(function(res) {
        var models = angular.copy(res.data.data);
        models.forEach(function(el, index) {
          el.included = false;
        });
        _models.onServer = models;
        notifyServerModelChange();
      }).catch(function(err) {
        console.log(err);
      });
      
      return service;
    });
})();