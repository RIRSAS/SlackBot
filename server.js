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
dialog.matches(greetingAry,	function(session){
// dialog.matches(['よう','やあ','やぁ','こんにちわ','ハロー','おっす','こんばんわ','おはよう','ヘイ','hi','ヘロー','hello'],	 function(session){
			session.send(session.message.text);
			session.send(session.message.text);
			// session.send("hi! I'm Bot");
	}
);

/*dialog.matches((['今日発売の本は？']), function(session){

	dt = new Date();
	// 当日発売分の判別用
	formatted = dt.toFormat("MM/DD");

	// 表示開始宣言用
	formatted_full = dt.toFormat("YYYY/MM/DD");

	// 結果用亜配列
	var resultArray = [];

	// ブックサーチの2016/06のコミック検索ページ
	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/1606c.html',  function (err, $, res) {

	  _$tBody = $('tBody');

	  // tBodyの子要素であるtrを指定してeachで回している
	  $(_$tBody.children()).each(function(){

	  	// thisはこの位置ではtrのこと。その中からtd要素を検索している
		_$td = $(this).find('td');

		// 検索したtd要素をテキストにパース
		td = _$td.text();

		// 出版社
		td_publisher = _$td.eq(0).text();

		// 日付
		td_date = _$td.eq(1).text();

		// レーベル
		td_rabel = _$td.eq(2).text();

		// タイトル
		td_title = _$td.eq(3).text();

		// 作者
		td_writeby = _$td.eq(4).text();

		// 値段
		td_value = _$td.eq(5).text();

		// ISBNコード
		td_isbn = _$td.eq(6).text();

		// 出力文字列へ整形
		text_result = "出版社:" + td_publisher
						+ " レーベル:" + td_rabel
						+ " タイトル:" + td_title
						+ " 作者:" + td_writeby;

		// 取得した日付と実行日を比較し、当日発売であればコンソールへ出力
	  	if(td_date==formatted){
	  		// console.log(text_result);
		  	// console.log(td);
  			resultArray.push(text_result);

	  	}

	  	var l = resultArray.length;


	  });
	});

  	session.send('到達!');

  	session.send('以上です');

});
*/
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
