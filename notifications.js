var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/page_monitor';

function notify(db, site){

	var msg = {
		subject: site.item + ' has Changed!\n',
		body:'http://' + site.requestOptions.host + site.requestOptions.path
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

		console.log('Notified : ' + user.name + ' @' + user.text);

		transporter.sendMail(mailOptions);

		});

	});

}
