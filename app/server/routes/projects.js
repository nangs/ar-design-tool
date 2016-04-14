/**
 * @module projectApi
 * @parent VUMIX
 * This is the api for user projects  
 */

var file_paths  = require('../config/file_path'),
    unity       = require('../modules/unity'),
    models      = require('../models'),
    express     = require('express'),
    multer      = require('multer'),
    path        = require('path');

var auth = require('./authentication');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../../'+file_paths.storage_path));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    } 
});

var router = express.Router({mergeParams: true});
var upload = multer({ storage: storage });

/**
 * @module fetchAllProjects
 * @parent projectApi
 * Returns all projects of user with {userid}
 * GET
 * api: /api/users/{userId}/projects
 */
router.get('/', auth.isLoggedIn, function(req, res) {
    models.project.findAll({
        where: {
            uid: req.params.userId
        }
    }).then(function(projects){
        res.json({status: "ok", length: projects.length, data: projects});            
    }).catch(function(err) {
        console.log('caught error in fetch all projects API');
        console.log(err);
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });
});

/**
 * @module fetchOneProject
 * @parent projectApi
 * Returns one project with {id} of user with {userid}
 * GET
 * api: /api/users/{userId}/projects/{id}
 */
router.get('/:id', function(req, res) {
    models.project.find({
        where: {
            uid: req.params.userId,
            id: req.params.id
        }
    }).then(function(project) {
        if(project) {
            res.json({status: "ok", length: 1, data: [project]});
        } else {
            res.json({status: "fail", message: "project not found", length: 0, data: []});
        }
    }).catch(function(err) {
        console.log('caught error in fetch project API');
        console.log(err);
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });
});

/**
 * @module insertProject
 * @parent projectApi
 * @param req.body.userId, req.body.name, req.body.company_name, req.body.marker_type, req.body.project_dat_file, req.body.assetbundle_id
 * create new project owned by user with {userId}
 * POST
 * api: /api/users/{userId}/projects
 */
router.post('/', upload.single('file'), function(req, res) {
    console.log('inserting project:');
    var newProj = {
        uid: req.params.userId,
        name: req.body.name,
        company_name: req.body.company_name,
        marker_type: req.body.marker_type
    };
    var vuforia_pkg = req.file;
    models.project.find({
        where: {
            uid: newProj.uid,
            name: newProj.name
        }
    }).then(function(project) {
        if(project) {
            res.json({status: "fail", message: "project already exists!", length: 0, data: [project]});
        } else {
            createProjectInDB(newProj, vuforia_pkg, function(data) {
                res.json({status: "ok", message: "new project created!", length: 1, data: [data]});
            }, function(err) {
                res.json({status: "fail", message: err.message, length: 0, data: []});
            });            
        }
    }).catch(function(err) {
        console.log('Caught error in insert project API');
        console.log(err);
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });            
});

var createProjectInDB = function(newProj, vuforia_pkg, goodCallback, badCallback) {
    models.project.create(newProj).then(function() {
        return models.project.find({
            where: {
                uid: newProj.uid,
                name: newProj.name
            }
        });
    }).then(function(newproject) {
        unity.createProj(newproject.uid, newproject.id, vuforia_pkg, function() {
            goodCallback(newproject);
        }, function(err) {
            badCallback(err);
        });
    }).catch(function(err) {
        console.log('caught error in createProjectInDB API');
        console.log(err);
        badCallback(err);
    });
    console.log('created project!');
};

/**
 * @module deleteProject
 * @parent projectApi
 * Delete project with {id} owned by user with {userId}
 * DELETE
 * api: /api/users/{userId}/projects/{id}
 */
router.delete('/:id', function(req, res) {
    var uid = req.params.userId;
    var id  = req.params.id;
    var _project;
    models.project.findById(id).then(function(project) {
        if(!project) {
            res.json({status: "fail", message: "project not found", length: 0, data: []});
        } else {
            _project = project;
            deleteProjectDB(uid, id, _project, function(row_deleted, _project) {
                res.json({status: "ok", message: "deleted "+row_deleted+" row(s)", length: 1, data: [_project]});
            }, function(err) {
                res.json({status: "fail", message: err.message, length: 0, data: []});
            });
        }
    }).catch(function(err) {
        console.log('Caught error in delete project API');
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });
});

var deleteProjectDB = function(uid, id, _project, goodCallback, badCallback) {
    models.project.destroy({
        where: {
            id: id
        }
    }).then(function(row_deleted) {
        unity.deleteProj(uid, id);
        goodCallback(row_deleted, _project);
    }).catch(function(err) {
        console.log('Caught error in deleteProjectDB API');
        badCallback(err);
    });
};

/**
 * @module updateProject
 * @parent projectApi
 * @param req.body.name, req.body.company_name, req.body.marker_type, req.body.project_dat_file, req.body.assetbundle_id, req.body.last_published, req.body.thumbnail_loc
 * update project with {id} owned by user with {userId}
 * PUT
 * api: /api/users/{userId}/projects/{id}
 */
router.put('/:id', upload.single('file'), function(req, res) {
    var uid = req.params.userId;
    var id  = req.params.id;
    var pkg = req.file;

    if(pkg) {
        unity.updateVuforia(uid, id, pkg);
    }

    models.project.find({
        where: {
            uid: uid,
            id: id
        }
    }).then(function(project) {
        console.log('found project: ')
        if(!project) {
            res.json({status: "fail", message: "project not found", length: 0, data: []});
        } else {
            updateProjectDB(req, project, id, uid, function(updatedProject) {
                res.json({status: "ok", message: "updated project", length: 1, data: [updatedProject]});
            }, function(err) {
                res.json({status: "fail", message: err.message, length: 0, data: []});
            });
        }
    }).catch(function(err) {
        console.log('error caught in update project API');
        console.log(err.message);
        res.json({status: "fail", message: err.message, length: 0, data: []});
    });
});

var updateProjectDB = function(req, project, id, uid, goodCallback, badCallback) {
    models.project.update({
        name: req.body.name || project.name,
        marker_type: req.body.marker_type || project.marker_type,
        company_name: req.body.company_name || project.company_name,
        last_published: req.body.last_published || project.last_published
    }, {
        where: {
            id: id,
            uid: uid
        }
    }).then(function() {
        return models.project.findById(id);
    }).then(function(updatedProject) {
        goodCallback(updatedProject);
    }).catch(function(err) {
        console.log('caught error in updateProjectDB API function');
        badCallback(err);
    });
};

/**
 * @module addProjModels
 * @parent projectApi
 * @param req.body.ids, req.body.pid, req.params.userId
 * copies models with model names submitted in body owned by user with {userId} to project folder with {pid} and rebuilds assetbundle for that project
 * POST
 * api: /api/users/{userId}/projects/addModels
 */
router.post('/addModels', function(req, res) {
    console.log("adding model into project");
    var modelNames  = req.body.ids;
    var pid         = req.body.pid;
    var uid         = req.params.userId;
 
    var total   = modelNames.length;
    var opCount = 0;
    var errmsg  = [];
    
    if(modelNames.length<=0 || !modelNames) {
        console.log("error, no model names");
        var error = {};
        error.message = "no model names sent";
        failRes(error);
    }

    for(x in modelNames) {
        unity.copyModel(uid, pid, modelNames[x], function() {
            opCount++;
            checkCompleteAddModelOps(uid, pid, opCount, total, errmsg, function(moveErrors) {
                warnRes(moveErrors);
            }, function() {
                goodRes(modelNames);
            }, function(err) {
                failRes(err);
            });
        }, function(modelName, err) {
            console.log('encounter error adding model: '+modelName+' to project: '+pid);
            console.log(err);
            opCount++;
            errmsg.push(modelNames, err);
            checkCompleteAddModelOps(uid, pid, opCount, total, errmsg, function(moveErrors) {
                warnRes(moveErrors);
            }, function() {
                goodRes(modelNames);
            }, function(err) {
                failRes(err);
            });
        });
    }
    function warnRes(moveErrors) {
        res.json({status: "warning", message: "some models were not copied...", length: moveErrors.length, data: [moveErrors]});
    }
    function goodRes(modelNames) {
        res.json({status: "ok", message: "completed adding models to project and rebuild assetbundles", length: modelNames.length, data: [modelNames]});
    }
    function failRes(err) {
        res.json({status: "fail", message: err.message, length: 0, data: []});    
    }
});

var checkCompleteAddModelOps = function(uid, pid, opCount, total, moveErrors, warningCall, goodCall, badCall) {
    if(opCount==total) {
        unity.rebuildAssetBundle(uid, pid, function() {
            if(moveErrors.length>0) {
                warningCall(moveErrors);
            } else {
                goodCall();
            }
        }, function(err) {
            console.log("caught error while rebuilding asset bundles for project: "+pid);
            badCall(err);
        });
    }
};

/**
 * @module removeProjModels
 * @parent projectApi
 * @param req.body.ids, req.body.pid, req.params.userId
 * removes models with ids owned by user with {userId} in project folder with {pid} and rebuilds assetbundle for that project
 * POST
 * api: /api/users/{userId}/projects/removeProjModels
 */
router.post('/removeProjModels', function(req, res) {
    console.log("removing models from project");
    var modelNames  = req.body.ids;
    var pid         = req.body.pid;
    var uid         = req.params.userId;

    var total   = modelNames.length;
    var opCount = 0;
    var errMsg  = [];

    for(i in modelNames) {
        //TODO: unity remove models
        unity.removeProjModel(uid, pid, modelNames[i], function() {
            opCount++;
            checkCompleteRemoveModelOps(uid, pid, opCount, total, errMsg, function(delErrors) {
                warnRes(delErrors);
            }, function() {
                goodRes(modelNames);
            }, function(err) {
                failRes(err);
            });
        }, function(modelName, err) {
            console.log("error in removing model from project");
            opCount++;
            errMsg.push(modelName, err);
            checkCompleteRemoveModelOps(uid, pid, opCount, total, errMsg, function(delErrors) {
                warnRes(delErrors);
            }, function() {
                goodRes(modelNames);
            }, function(err) {
                failRes(err);
            });
        });
    }
    function warnRes(delErrors) {
        res.json({status: "warning", message: "some models were not removed...", length: delErrors.length, data: [delErrors]});
    }
    function goodRes(modelNames) {
        res.json({status: "ok", message: "completed removing models from project and rebuild assetbundles", length: modelNames.length, data: [modelNames]});
    }
    function failRes(err) {
        res.json({status: "fail", message: err.message, length: 0, data: []});    
    }
});

var checkCompleteRemoveModelOps = function(uid, pid, opCount, total, delErrors, warningCall, goodCall, badCall) {
    if(opCount==total) {
        unity.rebuildAssetBundle(uid, pid, function() {
            if(delErrors.length>0) {
                warningCall(delErrors);
            } else {
                goodCall();
            }
        }, function (err) {
            console.log("caught error while rebuilding asset bundles for project: "+pid);
            badCall(err);
        });
    }
};

module.exports = router;