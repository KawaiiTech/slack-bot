/**
* A Bot for Slack!
*/


/**
* Define a function for initiating a conversation on installation
* With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
*/

function onInstallation(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({user: installer}, function (err, convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say('I am a bot that has just joined your team');
        convo.say('You must now /invite me to a channel so that I can be of use!');
      }
    });
  }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
  var BotkitStorage = require('botkit-storage-mongo');
  config = {
    storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
  };
} else {
  config = {
    json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
  };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
  //Treat this as a custom integration
  var customIntegration = require('./lib/custom_integrations');
  var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
  var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
  //Treat this as an app
  var app = require('./lib/apps');
  var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
  console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
  process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
});

controller.hears('hello', 'direct_message', function (bot, message) {
  bot.reply(message, 'Hello!');
});

var translate = require('node-google-translate-skidz');

controller.hears('\!t ([a-z]{2}) (.*)', ["ambient", "direct_mention", "mention", "direct_message"], function(bot, message) {
  translate({
    text: message.match[2],
    source: message.match[1],
    target: 'ja'
  }, function(result) {
    return bot.reply(message, ':jp: ' + result);
  });
});

controller.hears('open the (.*) doors',['message_received'],function(bot,message) {
  var doorType = message.match[1]; //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
  if (doorType === 'pod bay') {
    return bot.reply(message, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.');
  }
  return bot.reply(message, 'Okay');
});

sys = require('sys')
var exec = require('child_process').exec;

controller.hears('uptime', ['direct_mention', 'mention', 'direct_message'], function (bot, message) {
  function puts(error, stdout, stderr) {
    bot.reply(message, stdout);
  }
  exec("uptime", puts);
});

var FeedMe = require('feedme')
  , parser = new FeedMe()
  , request = require('request');

controller.hears('crunchy', ['direct_mention', 'mention', 'direct_message'], function (bot, message) {
  bot.reply(message, 'Crunchyroll...');
  parser.on('item', function(item) {
    //bot.reply(message, item['crunchyroll:seriestitle']);
    if (item['crunchyroll:seriestitle'] == 'Food Wars! Shokugeki no Soma'
    || item['crunchyroll:seriestitle'] == 'NEW GAME!') {
      //console.log(item['guid'].text);
      bot.reply(message, item.title + ' ' + item['guid'].text);
    }
  });
  request('http://feeds.feedburner.com/crunchyroll/rss/anime?format=xml').pipe(parser);
});

// Writes messages into the Raspberry Pi Unicorn Hat
controller.hears('pi (.*)', 'direct_message', function (bot, message) {
  var text = message.match[1];
  function puts(error, stdout, stderr) {
    bot.reply(message, "ok! " + text + " " + stdout + stderr);
  }
  exec("echo \"" + text + "\" > ../unicorn-phat/sms.txt", puts);
});

/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
