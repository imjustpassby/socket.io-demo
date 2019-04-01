var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
// 服务端监听连接状态：io的connection事件表示客户端与服务端成功建立连接，它接收一个回调函数，回调函数会接收一个socket参数。
io.on('connection', function (socket) {
  console.log(socket.id + " joined the room")

  // 当某用户连上聊天室socket服务时，给他打个招呼
  sendToSingle(socket, {
    event: 'greet_from_server',
    data: `你好 ${socket.id}`
  })

  // 对其他用户给出通知：某某某加入了聊天室
  broadcastExceptSelf(socket, {
    event: 'new_user_join',
    data: {
      user: socket.id
    }
  })

  // 与客户端对应的接收指定的消息
  socket.on('chat message', function (msg) {
    // io.emit()方法用于向服务端发送消息，参数1表示自定义的数据名，参数2表示需要配合事件传入的参数
    io.emit('chat message', {
      msg: msg,
      user: socket.id
    });
  });

  // 监听断开连接状态：socket的disconnect事件表示客户端与服务端断开连接
  socket.on('disconnect', (reason) => {
    // 广播给其他用户：某某某退出了聊天室
    broadcastExceptSelf(socket, {
      event: 'someone_exit',
      data: {
        user: socket.id
      }
    })
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});

// 给当前socket连接单独发消息
function sendToSingle(socket, param) {
  socket.emit('singleMsg', param);
}

// 对所有socket连接发消息
function broadcastAll(param) {
  io.emit('broadcastAll', param)
}

// socket.broadcast.emit()表示向除了自己以外的客户端发送消息
// 对除当前socket连接的其他所有socket连接发消息
function broadcastExceptSelf(socket, param) {
  socket.broadcast.emit('broadcast', param);
}