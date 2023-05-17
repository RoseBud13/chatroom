import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 7071 });

wss.on('listening', () => {
  console.log('websocket server begins listening on port 7071');
});

wss.on('connection', function connection(ws, req) {
  const clientIP = req.socket.remoteAddress;
  console.log('client ip %s connected to server', clientIP);
  console.log('current client amount: %s', wss.clients.size);
  ws.send('Client IP address ' + clientIP + ' is connected to server');

  ws.on('message', function message(data) {
    console.log('received [%s] from client %s', data, clientIP);

    if (`${data}` === 'close client connection') {
      ws.close();
    } else if (`${data}` === 'terminate server') {
      ws.close();
      setTimeout(() => {
        console.log('server terminated via client %s', clientIP);
        wss.close();
      }, 3000);
    } else {
      broadcast(data, ws);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('client %s connection closed with code %s', clientIP, code);
    console.log('reason: %s', reason);
    console.log('current client amount: %s', wss.clients.size);
  });

  ws.on('error', error => {
    console.log('error: %s', error);
  });
});

function broadcast(msg, ws) {
  for (const client of wss.clients) {
    if (client.readyState === ws.OPEN) {
      client.send(msg);
    }
  }
}
