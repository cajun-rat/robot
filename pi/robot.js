
var dgram = require('dgram');

var address = process.env.ROBOTSERVER || '54.217.204.70';
var port = process.env.ROBOTPORT || 8088;


var socket = dgram.createSocket('udp4');
socket.bind();
socket.on('message', function (data, rinfo) {
	console.log('Got message:' + data);
});


function sendlocation() {
	var m = new Buffer('hello');
	socket.send(m, 0, m.length, port, address);
}

setInterval(sendlocation, 10000);

sendlocation();

