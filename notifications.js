var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var amqp = require('amqplib');

var url = 'mongodb://localhost:27017/page_monitor';


subscribe();

function subscribe(){

  MongoClient.connect(url, function(err, db){
    process.once('SIGINT', function(){ db.close();});

    amqp.connect('amqp://localhost').then(function(conn){
      process.once('SIGINT', function(){ conn.close();});

      return conn.createChannel().then(function(ch){

        var ok = ch.assertQueue('email', { durable: false });

        ok = ok.then(function(_qok){
          return ch.consume('email', function(msg){

            var item = JSON.parse(msg.content.toString());

            console.log(" [x] Received '%s'", 'Item: ' + item.item + ' Store: ' + item.store);

            notify(db,item);

          }, {noAck: true});
        });

        return ok.then(function(_consumeOk){
          console.log(' [*] Waiting for messages. To exit press CTRL+C');
        });
      });
    }).then(null, console.warn);

  });

}

function notify(db, site){

	var msg = {
		subject: site.item + ' has Changed!\n',
		body: site.url
	};

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'amiibo.monitor@gmail.com',
			pass: 'amiiboP@$$'
		}
	});

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

		transporter.sendMail(mailOptions);

		});

	});

}
