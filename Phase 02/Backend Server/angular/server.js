var express	= require('express'),
	engine	= require('express-dot-engine'),
	path	= require('path');

var app = express();

app.engine('dot', engine.__express);
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'dot');
// app.enable('view cache');

app.use('/partials', express.static(path.join(__dirname, 'views/partials')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/views', express.static(path.join(__dirname, 'views')));

app.get('/', function (req, res) {
	res.render('index');
});

app.listen(3000, function() {
    console.log('listening on *:3000');
});
