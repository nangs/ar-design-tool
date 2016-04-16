/**
 * @module Unity
 * @parent Modules
 * @body
 * This module includes all the functions that are related to unity projects 
 */
var file_paths 	= require('../config/file_path'),
	utils 		= require('../modules/utils'),
	path 		= require('path'),
	fs 			= require('fs');

const exec		= require('child_process').exec;

var unity_path 		= '/unity/';
var model_path 		= '/models/';
var state_dat_file 	= 'state.dat';
var copy_state_name = 'copyState.dat';
var vuforia_name 	= "marker.unitypackage";
var assetbundle_name = '/webglbundles.unity3d';

/**
 * @function rebuildVuforiaPackage
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {String} vuforia_path
 * The path to the vuforia marker
 * @body
 * This function runs the command line unity command to rebuild the vuforia package located at vuforia_path.
 */
var rebuildVuforiaPackage = function(uid, pid, vuforia_path) {
	console.log('rebuilding vuforia package...');
	var project_path 	= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+'/');
	var rebuild_cmd 	= '"'+file_paths.unity+'" ' + '-projectPath "'+project_path+'" -importPackage "'+vuforia_path+'" -quit -batchmode';
		
	console.log('running: ' + rebuild_cmd);
	const rebuild = exec(rebuild_cmd, function(error, stdout, stderr) {
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);	
		if (error !== null) {
			console.log("exec error: " + error);
		}
	});
	rebuild.on('exit', function(code) {
		console.log('Rebuild Vuforia pkg child process exited with code ' + code);
	});
};

/**
 * @function moveVuforia
 * @parent Unity
 * @param {String} location
 * The destination path to copy the vuforia marker to. 
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {String} fileName
 * The name of the vuforia package.
 * @body
 * moveVuforia moves the vuforia location from one location to the destination path which is vuforia_path
 */
var moveVuforia = function(location, uid, pid, fileName) {
	console.log('in moveVuforia');
	var project_path = path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid);
	var vuforia_path = project_path+file_paths.vuforia+fileName;
	utils.moveFileToDest(location, vuforia_path, function() {
		rebuildVuforiaPackage(uid, pid, vuforia_path);
	});
};

/**
 * @function updateVuforia
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {File} vuforia_pkg
 * The vuforia package file.
 * @body
 * updateVuforia calls moveVuforia which moves the vuforia package to the project folder and calls the rebuild vuforia pkg command
 */
var updateVuforia = function(uid, pid, vuforia_pkg) {
	console.log('Updating Vuforia pkg');
	moveVuforia(vuforia_pkg.path, uid, pid, vuforia_name);
};

/**
 * @function createProj
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {File} vuforia_pkg
 * The vuforia package file.
 * @param {function} callback
 * callback() is called when project creation is completed
 * @param {function} failCallback
 * failCallback() is called when errors are thrown during project creation
 * @body
 * createProj creates a unity project and stores the files in the server storage. 
 * The project location is server/storage/uid/unity/pid/. Firstly, the project location is checked whether it exists, if not, it will be created.
 * Afterwhich, the unity command line is run to create the project files in that directory. AFter the project files are created, the vuforia package is moved inside
 * and the rebuild vuforia pkg function is called. Default state files and assetbundles are made available to the frontend by copying them to the public storage folder.
 * The public storage folder has the following route: /public/storage/uid/pid/
 */
var createProj = function(uid, pid, vuforia_pkg, callback, failCallback) {
	var public_project_path = path.join(__dirname, '../../'+file_paths.public_path+uid+'/'+pid+'/');
	var project_path 		= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+'/');
	var unity_cmd 			= '"'+file_paths.unity+'" -createProject "'+project_path+'" -importPackage "'+path.join(__dirname, '../../'+file_paths.app_builder)+'" -quit -batchmode';

	utils.checkExistsIfNotCreate(project_path);
	utils.checkExistsIfNotCreate(public_project_path);
	
	console.log('running: ' + unity_cmd);
	const unity	= exec(unity_cmd, function(error, stdout, stderr) {
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);	
		if (error !== null) {
			console.log("exec error: " + error);
			failCallback(error);
		}
	});
	unity.on('exit', function(code) {
		if(code==0) {
			moveVuforia(vuforia_pkg.path, uid, pid, vuforia_name);
			copyDefaultState(uid, pid);
			copyAssetBundle(uid, pid);
			console.log("Creating new project child process exited with code " + code);
			callback();
		}
	});
};

/**
 * @function deleteProj
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @body
 * deleteProj deletes all project files belonging to the project with pid in the server storage folder. 
 * The corresponding project files in the public storage are also deleted. 
 */
var deleteProj = function(uid, pid) {
	var public_project_path = path.join(__dirname, '../../'+file_paths.public_path+uid+'/'+pid+'/');
	var project_path 		= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+'/');
	console.log('Deleting public project dir: ' + public_project_path);
	utils.deleteDir(public_project_path);
	console.log('Deleting project dir: ' + project_path);
	utils.deleteDir(project_path);
};

/**
 * @function moveModel
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {String} fileName
 * The name of the model.
 * @param {String} destName
 * Name of the saved model file.
 * @body
 * moveModel moves the uploaded model from the temporary location /server/storage/modelName to the user's model library located in the server.
 * /server/storage/uid/models/
 */
var moveModel = function(uid, fileName, destName) {
	console.log('moving model into model library');
	var dest_path 	= path.join(__dirname, '../../'+file_paths.storage_path+uid+model_path);
	var tmp_path 	= path.join(__dirname, '../../'+file_paths.storage_path+'/'+fileName);
	utils.checkExistsIfNotCreate(dest_path, function() {
		console.log('completed dir check');
		console.log('moving model to model library');
		utils.moveFileToDest(tmp_path, dest_path+destName);
	});
};

/**
 * @function deleteModel
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {String} fileName
 * The name of the model.
 * @body
 * deleteModel removes the model with fileName from the user's library in the server storage.
 */
var deleteModel = function(uid, fileName) {
	var modelFile_path = path.join(__dirname, '../../'+file_paths.storage_path+uid+model_path+fileName);
	utils.deleteFile(modelFile_path);
};

/**
 * @function copyModel
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {String} fileName
 * The name of the model.
 * @param {Function} goodcallback
 * When copying of the model is completed, goodcallback() is called.
 * @param {Function} badcallback
 * When an error occurs during the copying of the model, badcallback() is called.
 * @body
 * copyModel copies a model with name fileName to into a project folder's model folder. 
 */
var copyModel = function(uid, pid, fileName, goodcallback, badcallback) {
	console.log('copying model into project '+pid+' dir');
	var file = path.join(__dirname, '../../'+file_paths.storage_path+uid+model_path+fileName);
	var dest = path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+file_paths.models+fileName);

	utils.copyFile(file, dest, function() {
		goodcallback();
	}, function(err) {
		console.log("error found in copyModel");
		badcallback(fileName, err);
	});
};

/**
 * @function removeProjModel
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {String} fileName
 * The name of the model.
 * @param {Function} goodcallback
 * When removing of the model is completed, goodcallback() is called.
 * @param {Function} badcallback
 * When an error occurs during the removal of the model, badcallback() is called.
 * @body
 * removeProjModel removes models from the project's, with pid, model folder. 
 */
var removeProjModel = function(uid, pid, fileName, goodcallback, badcallback) {
	console.log('removing model from project '+pid+' dir');
	var file = path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+file_paths.models+fileName);

	utils.deleteFile(file, function() {
		goodcallback();
	}, function(err) {
		console.log("error found in removeProjModel");
		badcallback(fileName, err);
	});
};

/**
 * @function copyAssetBundle
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {Function} goodcallback
 * When copying of the assetbundle is completed, goodcallback() is called.
 * @param {Function} badcallback
 * When an error occurs during the copying of the assetbundle, badcallback() is called.
 * @body
 * copyAssetBundle copies the asset bundle from the project folder with pid into the user's public storage folder for access from the frontend. 
 */
var copyAssetBundle = function(uid, pid, goodcallback, badcallback) {
	console.log("copying default asset bundle");
	var assetPath = path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+file_paths.assetbundle);
	var dest = path.join(__dirname, '../../'+file_paths.public_path+uid+'/'+pid+assetbundle_name);

	utils.copyFile(assetPath, dest, function() {
		console.log("completed copying assetbundle to public folders");
		if(goodcallback)
			goodcallback();
	}, function(err) {
		console.log("error copying assetbundle to public folders");
		if(badcallback)
			badcallback(err);
	});
};

/**
 * @function rebuildAssetBundle
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {Function} goodcallback
 * When rebuilding of the assetbundle is completed, goodcallback() is called.
 * @param {Function} badcallback
 * When an error occurs during the rebuilding of the assetbundle, badcallback() is called.
 * @body
 * rebuildAssetBundle runs the unity command line to rebuild the assetbundle of a specific project with pid. Upon completetion, it copies the assetbundles to the public storage.
 */
var rebuildAssetBundle = function(uid, pid, goodcallback, badcallback) {
	console.log('rebuilding assetbundle...');
	var project_path 	= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+'/');
	var rebuild_cmd 	= '"'+file_paths.unity+'" ' + '-projectPath "'+project_path+'" -executeMethod CreateAssetBundles.BuildAllAssetBundles -quit -batchmode';
	// places webglbundles.unity3d inside Assets folder of unity project
	console.log('running: ' + rebuild_cmd);
	const rebuild = exec(rebuild_cmd, function(error, stdout, stderr) {
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);	
		if (error !== null) {
			console.log("exec error: " + error);
			badcallback(error);			
		}
	});
	rebuild.on('exit', function(code, signal) {
		if(code==0) {
			console.log("Rebuilding Assetbundle child process exited with code " + code);
			copyAssetBundle(uid, pid, function(){
				goodcallback();
			}, function(err) {
				badcallback(err);
			});	
		}
	});
};

/**
 * @function buildApk
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {Function} goodcallback
 * When building the apk of a unity project is completed, goodcallback() is called.
 * @param {Function} badcallback
 * When an error occurs during the building the apk of a unity project, badcallback() is called.
 * @body
 * buildApk runs the unity command line to build the apk of a specific project. A download path will be passed back to the goodcallback();
 */
var buildApk = function(uid, pid, goodcallback, failcallback) {
	console.log('building apk for projectid: ' + pid);
	var project_path = path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+'/');
	var down_path 	 = project_path+file_paths.download;
	var buildApkCmd	 = '"'+file_paths.unity+'" ' + '-projectPath "'+project_path+'" -executeMethod BuildProject.BuildAndroid2D';

	console.log('running: ' + buildApkCmd);
	const buildAPK = exec(buildApkCmd, function(error, stdout, stderr) {
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);	
		if (error !== null) {
			console.log("exec error: " + error);
			failcallback(error);
		}
	});
	buildAPK.on('exit', function(code) {
		if(code==0) {
			console.log("buildAPK child process exited with code " + code);
			goodcallback(down_path);	
		}
	});
};

/**
 * @function moveStateFile
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {File} stateFile
 * The state.dat file
 * @param {Function} goodcall
 * When moving the state file is completed, goodcallback() is called.
 * @param {Function} badcall
 * When an error occurs during the moving of the state file, badcallback() is called.
 * @body
 * moveStateFile moves the state.dat file from the temporary upload location /server/storage/ to the corresponding project file in the public storage 
 */
var moveStateFile = function(uid, pid, stateFile, goodcall, badcall) {
	console.log('saving state file');
	dest_path = path.join(__dirname, '../../'+file_paths.public_path+uid+'/'+pid+'/'+state_dat_file);
	utils.moveFileToDest(stateFile.path, dest_path, function() {
		goodcall();
	}, function(err) {
		badcall(err);
	});	
};

/**
 * @function moveCopyState
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {Function} goodcall
 * When moving the copy state file is completed, goodcallback() is called.
 * @param {Function} badcall
 * When an error occurs during the moving of the copy state file, badcallback() is called.
 * @body
 * moveCopyState moves the copied state file from the temp upload location to the corresponding project directory in the public storage.
 */
var moveCopyState = function(uid, pid, goodcall, badcall) {
	console.log('saving state file');
	tmp 		= path.join(__dirname, '../../'+file_paths.storage_path+copy_state_name);
	dest_path 	= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+file_paths.state+state_dat_file);
	utils.moveFileToDest(tmp, dest_path, function() {
		goodcall();
	}, function(err) {
		badcall(err);
	});		
};

/**
 * @function copyDefaultState
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @body
 * copyDefaultState copies the default state.dat located in the project directory in the server storage to the corresponding project directory in the public storage.
 */
var copyDefaultState = function(uid, pid) {
	console.log('copying default state dat...');
	var state_dat_loc 	= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+file_paths.state+state_dat_file);
	var state_dest 		= path.join(__dirname, '../../'+file_paths.public_path+uid+'/'+pid+'/'+state_dat_file);
	utils.copyFile(state_dat_loc, state_dest);
};

/**
 * @function copyStateDat
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {Function} callback
 * When creating a copy of the state.dat is completed, callback() is called.
 * @param {Function} badcall
 * When an error occurs during the copying of the state.dat, badcall() is called.
 * @body
 * copyStateDat creates a copy of the state.dat which is copied to the public storage location. 
 */
var copyStateDat = function(uid, pid, callback, badcall) {
	console.log('copying state dat to server...');
	var state_dat_loc 	= path.join(__dirname, '../../'+file_paths.storage_path+state_dat_file);
	var state_dest 		= path.join(__dirname, '../../'+file_paths.storage_path+uid+unity_path+pid+file_paths.state+state_dat_file);
	utils.copyFile(state_dat_loc, state_dest, function() {
		callback();
	}, function(err) {
		badcall(err);
	});	
};

/**
 * @function saveStateJson
 * @parent Unity
 * @param {num} uid
 * User id number
 * @param {num} pid
 * Project id number
 * @param {JSON} json
 * JSON object to be saved.
 * @param {Function} goodcall
 * When creation of a .json file from a json object is completed, goodcall() is called.
 * @param {Function} badcall
 * When an error occurs during the creation of a json file, badcall() is called.
 * @body
 * saveStateJson creates a JSON file and saves the json object in it. 
 */
var saveStateJson = function(uid, pid, json, goodcall, badcall) {
	console.log('saving state json');
	var stateJsonDir = 'state.json';
	var dest = path.join(__dirname, '../../'+file_paths.public_path+uid+'/'+pid+'/'+stateJsonDir);
	utils.writeJson(dest, json, function() {
		goodcall();
	}, function(err) {
		badcall(err);
	});
};

module.exports.rebuildAssetBundle 	= rebuildAssetBundle;
module.exports.updateVuforia 		= updateVuforia;

module.exports.moveStateFile		= moveStateFile;
module.exports.moveCopyState		= moveCopyState;
module.exports.saveStateJson 		= saveStateJson;
module.exports.copyStateDat			= copyStateDat;

module.exports.createProj 			= createProj;
module.exports.deleteProj 			= deleteProj;

module.exports.removeProjModel 		= removeProjModel;		
module.exports.deleteModel 			= deleteModel;
module.exports.moveModel 			= moveModel;
module.exports.copyModel 			= copyModel;

module.exports.buildApk				= buildApk;