//const WebSocket = require('ws');
import { WebSocket } from 'ws'

function heartbeat() {
	this.isAlive = true;
console.log('connection isAlive');
}

//live updates for data sample
//const wss = new WebSocket.Server({ port:8080 });
const wss = new WebSocket.Server();

wss.on('connection', function connection(ws, req) {
	const ip = req.socket.remoteAddress;
	//const ip = req.headers['x-forwarded-for'].split(',')[0].trim(); // behind a proxy like NGINX
console.log('ip='+ip);
//console.log('req=',req);
	ws.isAlive = true;
	ws.on('pong', heartbeat);
	ws.on('message', function incoming(message) {
console.log('received: %s', message);
		// save message to DB
		//message = _dummySave(message);
		// send it to all clients
		message = JSON.stringify(JSON.parse(message));
		wss.clients.forEach(function each(client) {
			client.send(message);
		});
	});
});

const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();
		ws.isAlive = false;
		ws.ping();
	});
}, 30000);

////emulate saving to db, where record id usually defined
//function _dummySave(message){
//    message = JSON.parse(message);
//    if (message.operation == "insert"){
//        message.data.id = "s"+ message.data.id;
//    }
//    message = JSON.stringify(message);
//    return message;
//}
