import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 7071 });

const roomList = {
  sparksfly: '泰裤辣',
  test123gogo: '测试群',
  test123a: '测试群1',
  test123b: '测试群2',
  test123c: '测试群3'
};
const clientRoomMap = {};

wss.on('listening', () => {
  console.log('websocket server begins listening on port 7071');
});

wss.on('connection', function connection(ws, req) {
  const clientIP = req.socket.remoteAddress;
  // console.log('client ip %s connected to server', clientIP);
  // console.log('current client amount: %s', wss.clients.size);
  // broadcast(constructClientSize(wss.clients.size), ws);
  // ws.send('Client IP address ' + clientIP + ' is connected to server');
  // ws.send('「系统消息」欢迎来到聊天室');
  ws.send(constructAuthReq());

  for (const room of Object.keys(clientRoomMap)) {
    clientRoomMap[room]?.forEach(client => {
      broadcast(constructClientSize(wss.clients, room), ws, room, client);
    });
  }

  ws.on('message', function message(data) {
    // console.log(clientRoomMap);
    // console.log('received [%s] from client %s', data, clientIP);

    const parsedMsg = JSON.parse(data);
    // console.log(parsedMsg);

    if (parsedMsg.auth === '2233') {
      switch (parsedMsg.type) {
        case 'system':
          switch (parsedMsg.contentType) {
            case 'auth':
              if (roomList.hasOwnProperty(parsedMsg.content)) {
                const authSuccess = {
                  type: 'system',
                  contentType: 'authSuccess',
                  content: roomList[parsedMsg.content],
                  timestamp: Date.now()
                };
                ws.send(JSON.stringify(authSuccess));
                for (const room of Object.keys(clientRoomMap)) {
                  clientRoomMap[room]?.forEach(client => {
                    broadcast(
                      constructClientSize(wss.clients, room),
                      ws,
                      room,
                      client
                    );
                  });
                }
              } else {
                const authFailed = {
                  type: 'system',
                  contentType: 'authFailed',
                  content: 'authNeeded',
                  timestamp: Date.now()
                };
                ws.send(JSON.stringify(authFailed));
              }
              break;
            case 'registerClient':
              if (!clientRoomMap.hasOwnProperty(parsedMsg.roomID)) {
                clientRoomMap[parsedMsg.roomID] = [];
                clientRoomMap[parsedMsg.roomID].push(parsedMsg.clientID);
              } else {
                clientRoomMap[parsedMsg.roomID].push(parsedMsg.clientID);
              }
              if (ws.roomID?.lenght > 0 || ws.roomID) {
                ws.roomID?.push(parsedMsg.roomID);
              } else {
                ws.roomID = [parsedMsg.roomID];
              }
              ws.id = parsedMsg.clientID;
              for (const room of Object.keys(clientRoomMap)) {
                clientRoomMap[room]?.forEach(client => {
                  broadcast(
                    constructClientSize(wss.clients, room),
                    ws,
                    room,
                    client
                  );
                });
              }
              break;
            case 'reAssignClient':
              ws.id = parsedMsg.clientID;
              if (ws.roomID) {
                ws.roomID.push(parsedMsg.roomID);
              } else {
                ws.roomID = [parsedMsg.roomID];
              }
              for (const room of Object.keys(clientRoomMap)) {
                clientRoomMap[room]?.forEach(client => {
                  broadcast(
                    constructClientSize(wss.clients, room),
                    ws,
                    room,
                    client
                  );
                });
              }
          }
          break;
        case 'message':
          // console.log(parsedMsg);
          const filteredMsg = {
            type: 'message',
            contentType: 'msgBroadcast',
            content: parsedMsg.content,
            senderID: parsedMsg.senderID,
            roomID: parsedMsg.roomID,
            timestamp: parsedMsg.timestamp
          };
          broadcast(
            JSON.stringify(filteredMsg),
            ws,
            parsedMsg.roomID,
            parsedMsg.senderID
          );
          break;
      }
    }

    // if (`${data}` === 'close client connection') {
    //   ws.close();
    // } else if (`${data}` === 'terminate server') {
    //   ws.close();
    //   setTimeout(() => {
    //     console.log('server terminated via client %s', clientIP);
    //     wss.close();
    //   }, 3000);
    // } else {
    //   broadcast(data, ws);
    // }
  });

  ws.on('close', (code, reason) => {
    // console.log('client %s connection closed with code %s', clientIP, code);
    // console.log('reason: %s', reason);
    // console.log('current client amount: %s', wss.clients.size);
    for (const room of Object.keys(clientRoomMap)) {
      clientRoomMap[room]?.forEach(client => {
        broadcast(constructClientSize(wss.clients, room), ws, room, client);
      });
    }
  });

  ws.on('error', error => {
    console.log('error: %s', error);
  });
});

function broadcast(msg, ws, room, clientID) {
  for (const client of wss.clients) {
    // console.log(client.roomID);
    if (
      client.readyState === ws.OPEN &&
      client.roomID?.includes(room) &&
      clientRoomMap[room]?.includes(clientID)
    ) {
      client.send(msg);
    }
  }
}

function constructClientSize(clients, room) {
  let counter = 0;
  for (const client of clients) {
    // console.log('client.roomID: ', client.roomID);
    // console.log('room: ', room);
    client.roomID?.forEach(roomID => {
      if (roomID === room) {
        counter = counter + 1;
      }
    });
  }
  const clientSize = {
    type: 'system',
    contentType: 'clientSize',
    roomID: room,
    size: counter
  };
  return JSON.stringify(clientSize);
}

function constructAuthReq() {
  const authReq = {
    type: 'system',
    contentType: 'authReq',
    content: 'authNeeded'
  };
  return JSON.stringify(authReq);
}
