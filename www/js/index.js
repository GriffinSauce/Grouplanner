var socket = io();

socket.emit('hello', {}, function(msg) {
	console.log('Server said: '+msg);
});
