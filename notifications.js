var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var amqp = require('amqplib/callback_api');

var url = 'mongodb://localhost:27017/page_monitor';

subscribe();

function subscribe(){

  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      var ex = 'notifications';

      ch.assertExchange(ex, 'fanout', {durable: false});

      ch.assertQueue('', {exclusive: true}, function(err, q) {
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
        ch.bindQueue(q.queue, ex, '');

        ch.consume(q.queue, function(msg) {
          console.log(" [x] %s", msg.content.toString());
          notify(msg.content.toString());
        }, {noAck: true});
      });
    });
  });


}

function notify(item){

	var msg = {
		subject: item.name + ' has Changed!\n',
		body: item.url
	};

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'amiibo.monitor@gmail.com',
			pass: 'amiiboP@$$'
		}
	});

  MongoClient.connect(url, function(err, db){
    process.once('SIGINT', function(){ db.close();});

  	site.notify.forEach(function(username){

  		db.collection('users').find({ name: username }).limit(1).each(function(err, user){

  			if(user === null) return;

  			var mailOptions = {

  				from: 'amiibo.monitor@gmail.com',
  				to: user.text,
  				subject: msg.subject,
  				text: msg.body

  			};

  		console.log('Notified : ' + user.name + ' ' + user.text);

      transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
      });

  		});

  	});

  });
}
