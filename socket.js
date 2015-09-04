var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var moment = require('moment');
var amqp = require('amqplib/callback_api');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket){
  console.log('a user conneected');



});

http.listen(9137, function(){
  console.log('listening on *:9137');

  subscribe(io);
});


function subscribe(io){

  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      var ex = 'notifications';

      ch.assertExchange(ex, 'topic', {durable: false});

      ch.assertQueue('', {exclusive: true}, function(err, q) {
        console.log(' [*] Waiting for logs. To exit press CTRL+C');

        ch.bindQueue(q.queue, ex, 'notifications.*');

        ch.consume(q.queue, function(msg) {
          var item = JSON.parse(msg.content.toString());

          io.emit('check', item);

          console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
        }, {noAck: true});
      });
    });
  });

}
