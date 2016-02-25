var express = require('express'),
    stubApi = require('../config/stubApi');

var router = express.Router({mergeParams: true});

// fetchAll
// GET
// api: /api/users/{userId}/projects
router.get('/', function(req, res) {
    var projects = [];
    stubApi.projects.forEach(function(e,i) {
       if (e.userId.toString() === req.params.userId) {
           projects.push(e);
       } 
    });
    res.json({status: "ok", length: projects.length, data: projects});
});

// fetchOne
// GET
// api: /api/users/{userId}/projects/{id}
router.get('/:id', function(req, res) {
    var projects = [];
    stubApi.projects.forEach(function(e,i) {
       if (e.userId.toString() === req.params.userId) {
           projects.push(e);
       } 
    });
    var project = (function(el) {
        var index = -1;
        el.forEach(function(e,i) {
            if (e.id.toString() === req.params.id) {
                index = i;
            } 
        });
        return index < 0 ? undefined : el[index];
    })(projects);
    if (project) {
        res.json({status: "ok", length: 1, data: [project]});
    } else {
        res.json({status: "fail", message: "project is not found", length: 0, data: []});
    }
});

// insert
// POST
// api: /api/users/{userId}/projects
// required body param: name
router.post('/', function(req, res) {
    var project = {
        id: 99,
        userId: req.params.userId,
        name: req.body.name
    };
    stubApi.projects.push(project);
    res.json({status: "ok", length: 1, data: [project]});
});

// delete
// DELETE
// api: /api/users/{userId}/projects/{id}
router.delete('/:id', function(req, res) {
    var project = (function(el) {
        var index = -1;
        el.forEach(function(e,i) {
            if (e.id.toString() === req.params.id && e.userId.toString() === req.params.userId) {
                index = i;                
            } 
        });
        return index < 0 ? undefined : el.splice(index,1)[0];
    })(stubApi.projects);
    if (project) {
        res.json({status: "ok", length: 1, data: [project]});
    } else {
        res.json({status: "fail", message: "project is not found", length: 0, data: []});
    }
});

// edit
// PUT
// api: /api/users/{userId}/projects/{id}
// body param: name
router.put('/:id', function(req, res) {
    var project = (function(el) {
        var index = -1;
        el.forEach(function(e,i) {
            if (e.id.toString() === req.params.id && e.userId.toString() === req.params.userId) {
                index = i;                
            } 
        });
        return index < 0 ? undefined : el[index];
    })(stubApi.projects);
    if (project) {
        project.name = req.body.name || project.name;
        res.json({status: "ok", length: 1, data: [project]});
    } else {
        res.json({status: "fail", message: "project is not found", length: 0, data: []});
    }
});

module.exports = router;