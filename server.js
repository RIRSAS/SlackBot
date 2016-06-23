/*
For Bot Framework with Slack
*/

//var Botkit = require('botkit');
var restify = require('restify');
var builder = require('botbuilder');

// Webクローリング用ライブラリ
var client = require('cheerio-httpcli');

// 日付取得用ライブラリ
require('date-utils');

var port = process.env.PORT || 8080;

// Create bot
var bot = new builder.BotConnectorBot({appId:'slack-bot-rirsas', appSecret:'slack-bot-rirsas'});

var dialog = new builder.CommandDialog();

var greetingAry = ['よう','やあ','やぁ','こんにちわ','ハロー','おっす','こんばんわ','おはよう','ヘイ','hi','ヘロー','hello'];

// オウム返しテスト
// dialog.matches(greetingAry,	function(session){

// 		session.send(session.message.text);
// 		// session.send(session.message.text);
// 	}
// );

var fncTellMe = function(session){
		if(!session.userData.first){
			session.beginDialog('/talk/first');

		} else if(! session.userData.seccond){
			session.beginDialog('/talk/seccond');

		} else {
			session.send('I catch ' + session.userData.first + " and " + session.userData.seccond + "!");
		
		}
	};

dialog.matches('会話しよう',[
	function(session){
		fncTellMe(session);		
	}
	, function(session){
		fncTellMe(session);
	}
]);

dialog.matches('resetUserData',function(session){
	session.userData.first = null;
	session.userData.seccond = null;
	session.send("clear userData!");
});

bot.add('/talk/first',[
	function(session){
		builder.Prompts.text(session, 'Plz tell me about first gram!');
	},
	function(session, results) {
		session.userData.first = results.response;
		session.endDialog();
	}
]);

bot.add('/talk/seccond',[
	function(session){
		builder.Prompts.text(session, 'Plz tell me about seccond gram!');
	},
	function(session, results) {
		session.userData.seccond = results.response;
		session.endDialog();
	}
]);


dialog.matches((['今日発売の本は？']), function(session){

	dt = new Date();
	// 当日発売分の判別用
	formatted = dt.toFormat("MM/DD");

	// 表示開始宣言用
	formatted_full = dt.toFormat("YYYY/MM/DD");

	// ブックサーチの2016/06のコミック検索ページ
	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/1606c.html',  function (err, $, res) {

	  // HTMLタイトルを表示
	  session.send($('title').text());

	});
});


	  // _$tBody = $('tBody');

	//   // 冊数を数える
	//   len = _$tBody.children().length;

	//   session.send(formatted_full + "には以下の本が発売されます。");

	//   // tBodyの子要素であるtrを指定してeachで回している
	//   $(_$tBody.children()).each(function(){

	//   	// thisはこの位置ではtrのこと。その中からtd要素を検索している
	// 	_$td = $(this).find('td');

	// 	// 検索したtd要素をテキストにパース
	// 	td = _$td.text();

	// 	// 出版社
	// 	td_publisher = _$td.eq(0).text();

	// 	// 日付
	// 	td_date = _$td.eq(1).text();

	// 	// レーベル
	// 	td_rabel = _$td.eq(2).text();

	// 	// タイトル
	// 	td_title = _$td.eq(3).text();

	// 	// 作者
	// 	td_writeby = _$td.eq(4).text();

	// 	// 値段
	// 	td_value = _$td.eq(5).text();

	// 	// ISBNコード
	// 	td_isbn = _$td.eq(6).text();

	// 	// 出力文字列へ整形
	// 	text_result = "出版社:" + td_publisher
	// 					+ " レーベル:" + td_rabel
	// 					+ " タイトル:" + td_title
	// 					+ " 作者:" + td_writeby;

	// 	// 取得した日付と実行日を比較し、当日発売であればコンソールへ出力
	//   	if(td_date==formatted){
	//   		// console.log(text_result);
	// 	  	// console.log(td);
 
	// 	  	session.send(text_result);

	//   	}

	//   });
	// });

// });

// Talk Method

// bot.add('/', function (session) {
//    session.send('Hello World'); 
// });


bot.add('/', dialog);

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(port, function() {
	console.log('%s listening to %s', server.name, server.url);
});
