

function doresize() {
	var w = $(window).width();
	var h = $(window).height();
	var c = $('#control');

	var s, t,l;
	if (w < h) {
		s = w;
		t = (h-w)/2;
		l = 0;
	} else {
		s = h;
		l = (w-h)/2;
		t = 0;
	}
	c.width(s);
	c.height(s);
	c.offset({top:t, left:l});
	centredot();
}



function HitTest(x, y, actualw, actualh, nominalw, nominalh) {
	y = actualh - y; // html has an inverted y axis
	this.x = x * nominalw/actualw;
	this.y = y * nominalh/actualh;
}

HitTest.prototype.above = function(x1,y1, x2,y2) {
	return (this.x - x1)*(y2-y1) < (this.y - y1)*(x2-x1);
};

HitTest.prototype.inside = function(x, y, r) {
	return (this.x - x)*(this.x - x) + (this.y - y)*(this.y - y) < r*r;
};

function SendVote() {
	this.lastVote = 'centre-stop';
	this.user = 'user' + Math.random();
}

SendVote.prototype.gotTouch = function(x, y) {
	var p = new HitTest(x, y, $('#control').width(), $('#control').height(), 210, 210);
	incircle = p.inside(105, 105, 30);
	// The dividing lines are numbered in clockwise order, starting from 
	// the one between forward and wheel right
	a1 = p.above(130, 130, 170, 210);
	a2 = p.above(130, 130, 210, 140);
	a3 = p.above(130,  80, 210,  70);
	a4 = p.above(130,  80, 170,   0);
	a5 = p.above( 40,   0,  80,  80);
	a6 = p.above(  0,  70,  80,  80);
	a7 = p.above(  0, 140,  80, 130);
	a8 = p.above( 40, 210,  80, 130);

	forward = a2 && a7;
	reverse = !a3 && !a6;
	left = a5 && !a8;
	right = !a1 && a4;

	var motion, turn;

	if (forward) {
		motion = 'forward';
	} else if (reverse) {
		motion = 'reverse';
	} else {
		motion = 'stop';
	}

	if (left) {
		turn = 'left';
	} else if (right) {
		turn = 'right';
	} else {
		turn = 'centre';
	}


	if (incircle) {
		turn = 'centre';
		motion = 'stop';
	} 

	var vote = turn + '-' + motion;

	// decode
	//
	this.pushUpdate(vote);  
};

SendVote.prototype.noTouch = function () {
	// reset. Hide red dot
	this.pushUpdate('centre-stop');
}

SendVote.prototype.pushUpdate = function (newVote) {
	$('.info').text(newVote);
	if (newVote != this.lastVote) {
		this.lastVote = newVote;
		if (console) {
			console.debug(newVote);
		}
		$.ajax({
			type: 'GET',
			url: '/setvote',
			data: {user:this.user, vote:newVote},
			dataType: 'json',
			success: function () {}
		});
	}
}

var sendVote = new SendVote();

var isdown = false;

var control = $('#control')

control.on('mousemove', function(e) {
       	if(isdown) { 
		var offset = control.offset();
		sendVote.gotTouch(e.pageX - offset.left, e.pageY - offset.top);
	} 
	e.preventDefault();
});
$('#control').on('mousedown', function(e) { 
	isdown = true; 
	var offset = control.offset();
	sendVote.gotTouch(e.pageX - offset.left, e.pageY - offset.top);
	e.preventDefault();
});
$('#control').on('mouseup', function(e) {
       	isdown = false; 
	sendVote.noTouch();
});

function centredot() {
	var w = $(window).width();
	var h = $(window).height();
	$('#dot').offset({left:w/2 - 60, top:h/2 - 60});
}

		
var touchlistener = function (e) {
	e.preventDefault();
	var offset = control.offset();
	var touch = event.touches[0];
	$('#dot').offset({left:touch.pageX - 60, top:touch.pageY - 60});
	//$('.info').text('x:' + touch.pageX + ' x1:' + offset.left + ' y:' + touch.pageY + ' y1:' + offset.top);
	sendVote.gotTouch(touch.pageX - offset.left, touch.pageY - offset.top);
};
document.addEventListener('touchstart', touchlistener); 
document.addEventListener('touchmove', touchlistener); 

document.addEventListener('touchend', function (e) {
	centredot();
	sendVote.noTouch();
});

document.addEventListener('touchcancel', function (e) {
	centredot();
	sendVote.noTouch();
});

doresize();
window.onresize = doresize;

