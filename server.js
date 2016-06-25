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



// yahooニュースITカテゴリの先頭ページのテキストとリンクを表示
dialog.matches('ニュース',
	function(session){
		// yahooニュースのITカテゴリへアクセス
		// client.fetch('http://news.yahoo.co.jp/list/?c=computer',  function (err, $, res) {
		// yahooのIT・科学ニュースの1ページ目へアクセス
		client.fetch('http://news.yahoo.co.jp/hl?c=c_sci&p=1',  function (err, $, res) {

		 var resultText = "Yahoo Japan IT・科学の新着ニュースは...\n\r";
		 resultText += "---\n\r";
		 
		 // listクラスを持つul要素 の li要素 の a要素を対象としてeachを実行
		 // $('ul.list > li > a').each(function(){
		 // $('ul.listBd > li > p.ttl > a').each(function(){
		// listクラスを持つul要素 の li要素
		$('ul.listBd > li').each(function(){

			var _$p_ttl = $(this).find('p.ttl');
			var _$a = _$p_ttl.find('a');

			var _$p_source = $(this).find('p.source');
			var _$span_cp = _$p_source.find('span.cp');

		 	// ニュースタイトル
			//var ttlText = $(this).find('span.ttl').text();
			// var ttlText = $(this).text();
			var ttlText = _$a.text();

			// ニュースソース
			var sourceText = _$span_cp.text();

			// a要素に設定されたリンクURL取得
			// var linkUrl = $(this).attr('href');
			var linkUrl = _$a.attr('href');

			// ニュースタイトル ソース リンクURLの順で結果文字列に追加
		 	resultText += ttlText + "(from:" + sourceText + ")" + "\n\r"
		 	resultText += linkUrl + "\n\r";
		 	resultText += "---\n\r";

		});

		 // 取得終了を発言
		 resultText += "\n\r以上です!"

		 // ユーザへ結果を送信
		 session.send(resultText);

		});
	}
);

dialog.matches('4gamer',
	function(session){

		// 個別の記事へのリンクの親ページ
		var url_base = 'http://www.4gamer.net';

		// 4gamerのトップページへアクセス
		client.fetch('http://www.4gamer.net/',  function (err, $, res) {

		 var resultText4gamer = "4Gamerの新着ニュースは...\n\r";
		 resultText4gamer += "---\n\r";
		 
		 // id要素がNEWS_SELECT_DAY_1のdivタグ の divタグ の h2タグ の aタグ
		$('div#NEWS_SELECT_DAY_1 > div > h2 > a').each(function(){

			var titleText = $(this).text();
			var targetUrl = $(this).attr('href');

			// タイトル リンクURLの順で結果文字列に追加
			resultText4gamer += titleText + "\n\r";
		 	resultText4gamer += url_base + targetUrl + "\n\r";
		 	resultText4gamer += "---\n\r";

		});

		 // 取得終了を発言
		 resultText4gamer += "以上です!"

		 // ユーザへ結果を送信
		 session.send(resultText4gamer);

		});
	}
);

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


dialog.matches((['本']), function(session){

	dt = new Date();

	// 年号取得
	var	fmt_year = dt.toFormat("YYYY");

	// 月を取得
	var fmt_month = dt.toFormat("MM");

	// 日付を取得
	var fmt_day = dt.toFormat("DD");

	// URL用年月取得
	var url_now = fmt_year.slice(-2) + fmt_month;

	// 当日日付取得用
	var fmt_today = fmt_month + "/" + fmt_day;

	// 開始文言設定
	var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
	rst_book_text += "---\n\r";

	// ブックサーチから今月分のページへアクセス
	// client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/1606c.html',  function (err, $, res) {
	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now + 'c.html',  function (err, $, res) {

		_$tBody = $('tBody');

	 	$(_$tBody.children()).each(function(){

			var _$td = $(this).find('td');

			// 出版社
			var td_publisher = _$td.eq(0).text();

			// 発売日
			var td_date = _$td.eq(1).text();

			// 作者
			var td_writeby = _$td.eq(4).text();

			// タイトル
			var td_title = _$td.eq(3).text();

			// 結果文字列をセット
			if(td_date == fmt_today){
				rst_book_text += "出版社：" + td_publisher;
				rst_book_text += " / " + "作者：" + td_writeby + "\n\r";
				rst_book_text += "タイトル：" + td_title + "\n\r";
				rst_book_text += "---\n\r";
			}

		});

	 	rst_book_text += "以上です！";

		// HTMLタイトルを表示
		session.send(rst_book_text);

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
