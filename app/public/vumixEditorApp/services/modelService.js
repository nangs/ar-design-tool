// this service serves as an API for models available on the server
(function() {
  angular.module('vumixEditorApp.services')
    .factory('modelService', function($rootScope, $http, loaderService, unityMapperService) {  
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
        _models.onAssetBundleIndex = models.length;
        _models.onAssetBundle = angular.copy(models);
        notifyAssetBundleModelChange();
      }
      
      service.addAssetBundleModels = function(serverModels) {
        loaderService.showLoader("Adding Models to Asset Bundle");
        var _modelIds = [];
        var url = '/api/users/' + uid + '/projects/addModels';
        serverModels.forEach(function(model) {
          _modelIds.push(model.file_name);
        });        
        var data = {
          pid: pid,
          ids: _modelIds
        }
        return $http.post(url, data).then(function(res) {
          serverModels.forEach(function(model) {
            var _model = {
              id: _models.onAssetBundleIndex++,
              name: model.name
            }
            _models.onAssetBundle.push(_model);
          });        
          notifyAssetBundleModelChange();
          loaderService.showLoader("Re-importing asset bundles");
          unityMapperService.saveState();
          downloadUserStuff(
            '/storage/' + uid + '/' + pid + '/webglbundles.unity3d',
            '/storage/' + uid + '/' + pid + '/state.dat'
          );   
        });
      }
      
      service.deleteAssetBundleModel = function(model) { 
        var _modelIds = $.map($.grep(_models.onServer, function(_model) {
          return _model.name === model.name;  
        }), function(_model) {
          return _model.file_name;
        });               
        var url = '/api/users/' + uid + '/projects/removeProjModels';
        var data = {
          pid: pid,
          names: _modelIds
        };
        return $http.post(url, data).then(function(res) {
          _models.onAssetBundle.forEach(function(_model, index) {
            if (model.id === _model.id) {
              _models.onAssetBundle.splice(index, 1);
            }
          });
          _models.onServer.forEach(function(_model, index) {
            if (model.name === _model.name) {
              _model.available = false;
            }
          });
          notifyAssetBundleModelChange();
          notifyServerModelChange();
          loaderService.showLoader("Re-importing asset bundles");
          unityMapperService.saveState();          
          downloadUserStuff(
            '/storage/' + uid + '/' + pid + '/webglbundles.unity3d',
            '/storage/' + uid + '/' + pid + '/state.dat'
          );   
        });
      };
      
// ASSETBUNDLES OBJECT APIS END HERE

// SERVER OBJECT APIS START HERE      

      service.getAllServerModels = function() {
        return _models.onServer;
      }
      
      service.insertServerModel = function(file) {
        var url = '/api/users/' + uid + '/models';
        var fileSplit = file.name.split('.');
        var tokenisedName = fileSplit.splice(0, fileSplit.length - 1).join('');
        var tokenisedExt = fileSplit[0].toLowerCase();
        if (
          tokenisedExt !== 'fbx' &&
          tokenisedExt !== 'obj' &&
          tokenisedExt !== '3ds' && 
          tokenisedExt !== 'jpg' &&
          tokenisedExt !== 'png' &&
          tokenisedExt !== 'jpge' 
        ) {
          throw { message:"[ERROR] Invalid file extenstion" };
        }
        _models.onServer.forEach(function(model) {
          if (model.name === tokenisedName) {
            throw { message:"[ERROR] Media with same name exists" };
          }
        });        
        // If pass all the check        
        var fd = new FormData();
        fd.append('file', file);
        fd.append('uid', uid);
        fd.append('model_name', tokenisedName);
        fd.append('file_size', file.size);
        fd.append('file_extension', tokenisedExt);
        loaderService.showLoader("Adding Model to Database");
        return $http.post(url, fd, {
          headers: {'Content-Type': undefined}
        }).then(function(res) {
          loaderService.hideLoader();
          _models.onServer.push(res.data.data[0]);
          notifyServerModelChange();
        });
      }
      
      service.deleteServerModel = function(model) {
        loaderService.showLoader("Removing Model from Server")
        return $http({
          method: 'DELETE',
          url: '/api/users/' + uid + '/models/' + model.id 
        }).then(function(res) {
          loaderService.hideLoader();
          var _model = res.data.data[0];
          _models.onServer.forEach(function(el, index) {
            if (el.id === _model.id) {
              _models.onServer.splice(index, 1);
            }
          });
          notifyServerModelChange();
        });
      }
      
      service.setModelsAvailability = function() {
        var _availableModelNames = [];
        _models.onAssetBundle.forEach(function(model) {
          _availableModelNames.push(model.name);
        });
        _models.onServer.forEach(function(model) {
          if (_availableModelNames.indexOf(model.name) >= 0) {
            model.available = true;
          }
        });  
        notifyServerModelChange();
      }
      
// SERVER OBJECT APIS END HERE         
      
      $http.get('/api/users/'+ uid + '/models').then(function(res) {
        var models = angular.copy(res.data.data);
        models.forEach(function(el, index) {
          el.included = false;
        });
        _models.onServer = models;
        service.setModelsAvailability();
        notifyServerModelChange();
      }).catch(function(err) {
        console.log(err);
      });
      
      return service;
    });
})();