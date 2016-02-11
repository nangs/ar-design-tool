var express 	= require('express'),
	passport 	= require('passport');

var router 	= express.Router();

router.get('/', isLoggedIn, function (req, res) {
	res.render('index');
});

router.get('/login', function (req, res) {
	console.log(req.cookies);
	console.log('===============')
	console.log(req.session);

	res.render('login');
});

router.get('/auth/google/', passport.authenticate('google', {
	scope: ['profile', 'email']
}));

router.get('/auth/google/callback', passport.authenticate('google', { 
	successRedirect: '/', 
	failureRedirect: '/login' 
}));

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;