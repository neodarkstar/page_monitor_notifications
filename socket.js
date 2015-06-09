var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user conneected');

  io.emit('check', {name: 'Dark Pit', store: 'Target', available: false, time: moment().format('MMMM Do YYYY, h:mm:ss a')});

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
