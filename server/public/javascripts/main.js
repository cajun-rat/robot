

function decodeAngle(a) {
	if (a.y < -3.0) {
		return 'left';
	} else if (a.y > 3.0) {
		return 'right';
	} else {
		return 'centre';
	}
}

function SendVote() {
	this.lastTurn = 'centre';
	this.lastMotion = 'stop';
	this.lastVote = this.getVote();
	this.user = 'user' + Math.random();
}

SendVote.prototype.getVote = function() {
	return this.lastTurn + '-' + this.lastMotion;
};

SendVote.prototype.newMotion = function(motion) {
	this.lastMotion = motion;
	this.pushUpdate();	
};

SendVote.prototype.newTurn = function(turn) {
	this.lastTurn = turn;
	this.pushUpdate();
};

SendVote.prototype.pushUpdate = function () {
	var newVote = this.getVote();
	if (newVote != this.lastVote) {
		this.lastVote = newVote;
		$.ajax({
			type: 'GET',
			url: '/setvote',
			data: {user:this.user, vote:newVote},
			success: function () {}
		});
	}
}

var sendVote = new SendVote();

window.addEventListener("devicemotion", function (event) {
	var a = event.accelerationIncludingGravity;
	$('.info').text('x:' + a.x.toFixed(3) + ' y:' + a.y.toFixed(3) + ' z:' + a.z.toFixed(3) + ' ' + decodeAngle(a));	
	sendVote.newTurn(decodeAngle(a));
}, true);


$('.forward').on('touchstart', function() { sendVote.newMotion('forward'); });
$('.reverse').on('touchstart', function() { sendVote.newMotion('reverse'); });
$('.forward').on('touchend', function() { sendVote.newMotion('stop'); });
$('.reverse').on('touchend', function() { sendVote.newMotion('stop'); });
$('.forward').on('touchcancel', function() { sendVote.newMotion('stop'); });
$('.reverse').on('touchcancel', function() { sendVote.newMotion('stop'); });

