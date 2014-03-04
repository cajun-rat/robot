
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var fs = require('fs');

var logfile = fs.createWriteStream('votes.log', {flags:'a', mode:'644', encoding:null});


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


app.get('/setvote', function (req,res) { 
	var user = req.query.user;
	var vote = req.query.vote;
	var now = new Date();
	console.log('vote ' + now.toISOString() + ' ' + user + ' ' + vote);
	logfile.write(JSON.stringify({time:now.toISOString(), user:user, vote:vote}) + '\n');
	res.end('ok')

}); 




// Routes

app.get('/', routes.index);

app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
