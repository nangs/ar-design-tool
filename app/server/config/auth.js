/**
 * @module auth
 * @parent Config
 * This auth config file stores the google auth key configs related to the Vumix app
 * To use, require module from /server/config/auth 
 */
module.exports = {
	'googleAuth': {
		'clientID': '820283688096-9i8dushckbn1ps9045s4q3eqm72es2sd.apps.googleusercontent.com',
		'clientSecret': '5aKe6eprQiYtyO6Amwz_Esos',
		'callbackURL': 'http://localhost:3000/auth/google/callback'
	}
};
