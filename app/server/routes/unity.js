var express = require('express');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var router = express.Router();

//settings for storing the saved file
var storage = multer.diskStorage({

	destination: function(req, file, cb) {
		cb(null, path.join(__dirname, '../../'+file_paths.public_path));
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	} 

});
var upload = multer({ storage:storage });

router.post('/uploadstate.php', upload.single('binary'), function(req, res, next) {
    var stateDat = req.binary;
    unity.moveStateFile(req.body.uid, req.body.pid, stateDat);
    res.json({ status:"ok", message: "saved state dat file", data: req.binary});
});

router.post('/saveproject', upload.single('json'), function(req, res) {
    var stateJson = req.json;
    unity.moveStateFile(req.body.uid, req.body.pid, stateJson);
    res.json({ status: "ok", message: "saved state json", data: req.json});
});

router.get('/buildproject.php', function(req, res, next) {
  var unityPath = '"' + process.env['UNITY_HOME'] + '\\Unity.exe"';
  var mode = " -quit ";
  var projectPath = ' -projectPath "D:/workspace/cs3284/ar-design-tool/WZ_BACKEND/AssetBundle test" ';
  var buildMethod = ' -executeMethod  BuildProject.BuildAndroid2D ';
  var command = unityPath + mode + projectPath + buildMethod;
  exec(command, function(err, stdout, stderr) {  
  }).on('close', function(code) {
    var filePath = "../WZ_BACKEND/AssetBundle test/Assets/AndroidBuilds.apk";
    res.download(filePath);
  });
});

router.use(function(err, req, res, next) {
  if (err.status == 404)
  {
    res.statusCode = 404;
    res.send('Cannot find the file');
  }
  else
  {
    next(err);
  }
});

module.exports = router;