var rimraf 	= require('rimraf'),
	fs 		= require('fs');

var checkExistsIfNotCreate = function(dirpath, callback) {
	var dirs 	= dirpath.split('\\');	
	var newdir 	= "";
	for(var i=0; i<dirs.length; i++) {
		newdir += dirs[i]+'/';
		try {
			fs.statSync(newdir);
		} catch(e) {
			try {
				fs.mkdirSync(newdir);
			} catch(e) {
				console.log(e);
				if (e.code == 'EEXIST') {
					console.log('path already exists');
				}
			}
		}
	}
	if(callback)
		callback();
};

var moveFileToDest = function(location, destination, callback) {
	console.log('location: ' + location)
	console.log('destination: ' + destination)
	fs.rename(location, destination, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log('Successfully moved file from ' + location + ' to ' + destination);
		}
	});
	if(callback)
		callback();
};

var saveFileToDest = function(file, dest) {
	fs.writeFile(dest, file, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('Saved file ' + dest);
		}
	});
};

var deleteDir = function(deleteDest) {
	rimraf(deleteDest, function(err) {
		if(err) {
			console.log(err);
		}
		else {
			console.log('Successfully deleted: ' + deleteDest);
		}
	});
};

var deleteFile = function(deleteFile) {
	fs.unlink(deleteFile, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log('Successfully deleted: ' + deleteFile);
		}
	})
};

module.exports.checkExistsIfNotCreate = checkExistsIfNotCreate;
module.exports.saveFileToDest = saveFileToDest;
module.exports.moveFileToDest = moveFileToDest;
module.exports.deleteFile = deleteFile;
module.exports.deleteDir = deleteDir;