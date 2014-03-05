
var dgram = require('dgram');
var fs = require('fs');

var address = process.env.ROBOTSERVER || '54.217.204.70';
var port = process.env.ROBOTPORT || 8088;

var gpioroot = '/sys/class/gpio';

function Gpio(pin) {
	this.valuepath = gpioroot + '/gpio' + pin + '/value';
	try {
		fs.writeFileSync(gpioroot + '/export', pin);
	} catch (e) {}
	fs.writeFileSync(gpioroot + '/gpio' + pin + '/direction', 'out');
}

Gpio.prototype.write = function(value) { 
	fs.writeFileSync(this.valuepath, value);
};

var leftA = new Gpio(14);
var leftB = new Gpio(15);
var rightA = new Gpio(18);
var rightB = new Gpio(23);

var controls = {
	"centre-stop":[0,0,0,0],
	"centre-forward":[0,1,0,1],
	"centre-reverse":[1,0,1,0],
	"left-stop":[1,0,0,1],
	"left-forward":[0,0,0,1],
	"left-reverse":[0,0,1,0],
	"right-stop":[0,1,1,0],
	"right-forward":[0,1,0,0],
	"right-reverse":[1,0,0,0]
};


var socket = dgram.createSocket('udp4');
socket.bind();
socket.on('message', function (data, rinfo) {
	var msg = '' + data;
	console.log('Got message:' + msg);
	var op = controls[msg];
	if (op === undefined) {
		console.log('unknown message ' + msg);
	} else {
		leftA.write(op[0]);
		leftB.write(op[1]);
		rightA.write(op[2]);
		rightB.write(op[3]);
	}
});


function sendlocation() {
	var m = new Buffer('hello');
	socket.send(m, 0, m.length, port, address);
}

setInterval(sendlocation, 10000);

sendlocation();

