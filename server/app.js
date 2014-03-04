
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var fs = require('fs');

var logfile = fs.createWriteStream('votes.log', {flags:'a', mode:'644', encoding:null});

function VoteCounter() {
	this.votes = {};
	this.winner = 'centre-stop';
	this.runningtimer = false;
}

VoteCounter.prototype.setVote = function(user,vote) {
	this.votes[user] = {vote:vote, time:Date.now()};
	this.recalculate();
};

VoteCounter.prototype.recalculate = function () {
	var expirytime = Date.now() - (1000*10); // 10s vote timeout
	var goodvotes = {};
	var outcome = {};
	var oldestvote = 0;

	for (var k in this.votes) {
		if (!this.votes.hasOwnProperty(k)) {
			continue;
		}
		var vote = this.votes[k];
		if (vote.time < expirytime) {
			continue;
		}
		if (oldestvote < vote.time) {
			oldestvote = vote.time;
		}
		goodvotes[k] = vote;
		if (outcome[vote.vote]) {
			outcome[vote.vote]++;
		} else {
			outcome[vote.vote] = 1;
		}
	}

	this.votes = goodvotes;

	console.log(outcome);
	logfile.write(JSON.stringify({time:Date.now(), totals:outcome}) + '\n');
	
	outcome['centre-stop'] = 0;
	
	var winner = 'centre-stop';
	var winnervotes = 0;
	for (var k in outcome) {
		if (!outcome.hasOwnProperty(k)) {
			continue;
		}
		if (winnervotes < outcome[k]) {
			winner = k;
			winnervotes = outcome[k];
		}
	}

	console.log('winner: ' + winner);

	clearTimeout(this.runningtimer);		
	if (0 < oldestvote) {
		var that = this;
		this.runningtimer = setTimeout(function() {that.recalculate();}, oldestvote + 10*1000 - Date.now());
	}
};


var votes = new VoteCounter();

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
	votes.setVote(user, vote);
	res.end('ok')

}); 




// Routes

app.get('/', routes.index);

app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
