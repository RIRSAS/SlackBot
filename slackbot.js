/*
For Bot Framework with Slack
*/

//var Botkit = require('botkit');
var restify = require('restify');
var builder = require('botbuilder');

var port = process.env.PORT || 8080;

// Create bot
var bot = new builder.BotConnectorBot({
	appId: 'slack-bot-rirsas',
	appSecret: 'slack-bot-rirsas'
});

// Talk Method
bot.add('/', function (session) {
   session.send('Hello World'); 
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(port, function() {
	console.log('%s listening to %s', server.name, server.url);
});
