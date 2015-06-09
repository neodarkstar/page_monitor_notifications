var nodemailer = require('nodemailer');
var amqp = require('amqplib');
var Feed = require('feed');

var feed = new Feed({

  title: 'Amiibo Monitor',
  description: 'Live Feed into Amiibo Availability',
  link: 'http://www.alertclickbuy.com',
  copyright: 'NA',
  author: {
    name: 'John',
    email: 'john',
    link: 'http://www.alertclickbuy.com'
  }

});

subscribe(feed);

feed.render('rss-2.0');

function subscribe(){

    amqp.connect('amqp://localhost').then(function(conn){
      process.once('SIGINT', function(){ conn.close();});

      return conn.createChannel().then(function(ch){

        var ok = ch.assertQueue('feed', { durable: false });

        ok = ok.then(function(_qok){
          return ch.consume('feed', function(msg){

            var item = JSON.parse(msg.content.toString());

            console.log(" [x] Received '%s'", 'Item: ' + item.item + ' Store: ' + item.store);

            feed.item({

              title: item.item + ' Available!',
              link: item.url,
              description: item.item + ' is available at ' + item.store

            });

          }, {noAck: true});
        });

        return ok.then(function(_consumeOk){
          console.log(' [*] Waiting for messages. To exit press CTRL+C');
        });
      });
    }).then(null, console.warn);


}
