/**
 * @module passportgoogle
 * @parent Server_Modules
 * This module configures passportjs 
 *
 * @param {{}} passport 
 *	Requires passportjs
 * 
 */
var GoogleStrategy 	= require('passport-google-oauth').OAuth2Strategy;
var models 			= require('../models');
var configAuth		= require('../config/auth');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		// console.log('in serializeUser...')
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		// console.log('in deserializeUser...')
		models.googleUser.find({where: {id: id}}).then(function(user) {
			done(null, user);
		});
	});

	/**
	 * @function passport.use.GoogleStrategy
	 * @parent passportgoogle
	 * This function configures passportjs to use the Google strategy
	 */
	passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			models.googleUser.findOrCreate({where: {'id': profile.id}, 
				defaults: {
					id: profile.id,
					name: profile.displayName,
					token: accessToken,
					email: profile.emails[0].value
				}
			}).spread(function(googleUser, created) {
				console.log(googleUser.get({
					plain: true
				}));
				if(created) {
					console.log('successfully created in db!');
				} else {
					console.log('Did not create in db');
				}
				done(null, profile);
			});
		});
	}));
};	