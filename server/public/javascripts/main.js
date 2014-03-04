

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
	this.lastDirection = 'none';
	this.user = 'user' + Math.random();
}

SendVote.prototype.newVote = function(direction) {
	if (direction != this.lastDirection) {
		this.lastDirection = direction;
		$.ajax({
			type: 'GET',
			url: '/setvote',
			data: {user:this.user, dir:direction},
			success: function () {}
		});
	}
};

var sendVote = new SendVote();

window.addEventListener("devicemotion", function (event) {
	var a = event.accelerationIncludingGravity;
	$('.info').text('x:' + a.x.toFixed(3) + ' y:' + a.y.toFixed(3) + ' z:' + a.z.toFixed(3) + ' ' + decodeAngle(a));	
	sendVote.newVote(decodeAngle(a));
}, true);
