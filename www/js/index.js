var socket = io('http://127.0.0.1:8000');

socket.emit('helloServer', {});
socket.on('helloClient', function (data) {
	console.log('Server said hello back, yay!');
});