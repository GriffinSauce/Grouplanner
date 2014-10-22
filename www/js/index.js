var socket = io();

socket.emit('helloServer', {});
socket.on('helloClient', function (data) {
	console.log('Server said hello back, yay!');
});
