var socket = io();

socket.emit('helloServer', {}, function(msg) {
	console.log('Server said: '+msg);
});
