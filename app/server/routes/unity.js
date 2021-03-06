/**
 * @module UnityAPI
 * @parent Routes
 * All unity apis goes here
 * To use, require module from /server/routes/unity    
 */
var file_paths  = require('../config/file_path'),
    auth        = require('./authentication'),
    unity       = require('../modules/unity');
    
var express = require('express'),
    multer  = require('multer'),
    path    = require('path');

var router = express.Router();

//settings for storing the saved file
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, path.join(__dirname, '../../'+file_paths.storage_path));
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	} 
});

var upload = multer({ storage:storage });

/**
 * @module POST/users/:uid/projects/:pid/uploadstate
 * @parent UnityAPI
 * @param req.file
 * state.dat file
 * @body
 * POST uploades state.dat file to the server
 */
router.post('/users/:uid/projects/:pid/uploadstate', auth.isLoggedIn, upload.single('binary'), function(req, res, next) {
    console.log('saving state.dat file');
    var uid = req.params.uid;
    var pid = req.params.pid;
    var stateDat = req.file;
    unity.copyStateDat(uid, pid, function() {
        unity.moveStateFile(uid, pid, stateDat, function() {
            console.log("Save state.dat ok");
            res.json({ status:"ok", message: "saved state dat file", data: [stateDat]});
        }, function(err) {
            console.log("Caught error in saving state dat..");
            console.log(err.message);
            res.json({ status:"fail", message: err.message, data: [err]});
        });
    }, function(err) {
        res.json({ status:"fail", message: err.message, data: [err]});
    });
});

/**
 * @module POST/saveproject
 * @parent UnityAPI
 * @param req.body.uid
 * User id
 * @param req.body.pid
 * Project id
 * @param req.body.json
 * JSON object containing state data.
 * @body
 * POST sends state JSON file to be saved as a JSON file on server.
 */
router.post('/saveproject', auth.isLoggedIn, function(req, res) {
    console.log('saving json state file');
    unity.saveStateJson(req.body.uid, req.body.pid, req.body.json, function() {
        console.log('save state json file ok');
        res.json({ status: "ok", message: "saved state json", data: [stateJson]});    
    }, function (err) {
        console.log('Error while saving state json file');
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });
});

/**
 * @module GET/users/:uid/projects/:pid/buildproject
 * @parent UnityAPI
 * @body
 * GET Build apk for a specified project, a download of the apk file is receive.
 */
router.get('/users/:uid/projects/:pid/buildproject', auth.isLoggedIn, function(req, res, next) {
    unity.buildApk(req.params.uid, req.params.pid, function(down_path) {
        console.log("down path is: " + down_path);
        res.download(down_path);
    }, function (err) {
        console.log("caught error in buildapk");
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });
});

router.use(function(err, req, res, next) {
    if (err.status == 404) {
        res.statusCode = 404;
        res.send('Cannot find the file');
    } else {
        next(err);
    }
});

module.exports = router;