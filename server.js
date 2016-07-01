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

// var importTest = require('./croring.js');
// var testModule = importTest.test();
// var yit = importTest.yahooIT();

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

// // 呼び出しテスト
// dialog.matches('test',	function(session){

// 		session.send(yit);
// 		// session.send(session.message.text);
// 	}
// );

// yahooニュースITカテゴリの先頭ページのテキストとリンクを表示
dialog.matches('ニュース',
	function(session){
		// yahooのIT・科学ニュースの1ページ目へアクセス
		client.fetch('http://news.yahoo.co.jp/hl?c=c_sci&p=1',  function (err, $, res) {

		 var resultText = "Yahoo Japan IT・科学の新着ニュースは...\n\r";
		 resultText += "---\n\r";
		 
		// listBdクラスを持つul要素 の li要素
		$('ul.listBd > li').each(function(){

			var _$p_ttl = $(this).find('p.ttl');
			var _$a = _$p_ttl.find('a');

			var _$p_source = $(this).find('p.source');
			var _$span_cp = _$p_source.find('span.cp');

		 	// ニュースタイトル
			var ttlText = _$a.text();

			// ニュースソース
			var sourceText = _$span_cp.text();

			// a要素に設定されたリンクURL取得
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

// ストックしている結果を表示
dialog.matches(['次','tugi','つぎ','next'], function(session){

	var sendText = '';

	// 返信文字列生成
	var responseText = function(){

		var resultArray = {};

		// userData.stockがある場合にtitleとurlを取得
		if(session.userData.stock){
			if(session.userData.stock.length != 0){
				resultArray = session.userData.stock[0];
				sendText += resultArray.title + "\n\r";

				if(resultArray.url != ""){
					sendText += resultArray.url + "\n\r";					
				}

				session.userData.stock.shift();
			}
		} else {
			sendText = "ストックしている結果がありません！";
		}		
	};

	// いちどに5記事読み込み
	for(var i = 0; i < 5; i++){
		responseText();
	}

	// userData.stockの実体がない or 最後の項目までshiftした
	if(session.userData.stock&&session.userData.stock.length == 0){
		session.userData.stock = null;
		sendText += "\n\r以上です！";
	}

	session.send(sendText);

});

// ストックしている結果を表示(すべて)
dialog.matches(['全部','ぜんぶ','all'], function(session){

	var sendText = '';

	// 返信文字列生成
	var responseText = function(){

		var resultArray = {};

		// userData.stockがある場合にtitleとurlを取得
		if(session.userData.stock){
			if(session.userData.stock.length != 0){
				resultArray = session.userData.stock[0];
				sendText += resultArray.title + "\n\r";

				if(resultArray.url != ""){
					sendText += resultArray.url + "\n\r";					
				}

				session.userData.stock.shift();
			}
		} else {
			sendText = "ストックしている結果がありません！";
		}		
	};

	// いちどに5記事読み込み
	for(var i = 0; i < 5; i++){
		responseText();
	}

	// userData.stockの実体がない or 最後の項目までshiftした
	if(session.userData.stock&&session.userData.stock.length == 0){
		session.userData.stock = null;
		sendText += "\n\r以上です！";
	}

	session.send(sendText);

});

//　結果ストック用
var responseStorage = function(session, title_text, url_text){
	var response_object = { title:title_text, url:url_text};

	if(session.userData.stock){
		session.userData.stock.push(response_object);
	} else {
		session.userData.stock = [response_object];
	}
}

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

		 	var titleTXT = titleText + "\n\r";
		 	var urlTXT = url_base + targetUrl + "\n\r" + "---\n\r";;

		 	responseStorage(session, titleTXT, urlTXT);

		});

		 // 取得終了を発言
		 resultText4gamer += "以上です!"

		 // ユーザへ結果を送信
		 session.send(resultText4gamer);

		});
	}
);

dialog.matches('nyaa',
	function(session){

		// 個別の記事へのリンクの親ページ
		var url_base = 'http://sukebei.nyaa.se/?cats=8_0';

		// 4gamerのトップページへアクセス
		client.fetch(url_base,  function (err, $, res) {

		 var resultTextNyaa = "nyaa_videoの1ページ目は...\n\r";
		 resultTextNyaa += "---\n\r";

		 responseStorage(session, resultsTextNyaa, '');
		 
		 // id要素がNEWS_SELECT_DAY_1のdivタグ の divタグ の h2タグ の aタグ
		// $('div#NEWS_SELECT_DAY_1 > div > h2 > a').each(function(){
		// $('table.tlist > tr.tlistrow > td.tlistname > a').each(function(){
		$('table.tlist > tr.tlistrow').each(function(){

			var _$td_tlistname = $(this).find('td.tlistname');
			var _$a_tlistname = _$td_tlistname.find('a').text();

			var _$td_tlistdownload = $(this).find('td.tlistdownload');
			var _$a_tlistdownload = _$td_tlistdownload.find('a').attr('href');

			// タイトル リンクURLの順で結果文字列に追加
			resultTextNyaa += _$a_tlistname + "\n\r";
		 	resultTextNyaa += "https:" + _$a_tlistdownload + "\n\r";
		 	resultTextNyaa += "---\n\r";

		 	var resultTXT = _$a_tlistname + "\n\r";
		 	var urlTXT = "https:" + _$a_tlistdownload + "\n\r";

		});

		 // 取得終了を発言
		 resultTextNyaa += "以上です!";

		 // ユーザへ結果を送信
		 session.send(resultTextNyaa);

		});
	}
);

dialog.matches('会話',
	// function(session){
	// 	session.beginDialog('/talk/replace');		
	// }
	[
	function(session){
		// fncTellMe();
		builder.Prompts.choice(session, 'select!','ok|no');
	},
	function(session, results){
		// fncTellMe();
		if(result.response&&(results.response.entity != 1)){
			session.beginDialog('/talk/replace');
			// session.userData.seccond = results.response;
		} else {
			// session.endDialog();
			session.send(sessiom.userData.entity);
		}
	},
	function(session, results){
		// if(!session.userData.seccond){
		// 	session.replaceDialog('/talk/replace');
		// } else {
		// 	session.endDialog();
		// }
		session.replaceDialog('/talk/replace');

	}
]
);

bot.add('/talk/replace',//[
	function(session){
		session.userData.seccond = 'ok';
		session.endDialog();
	}
	// function(session){
	// 	// fncTellMe();
	// 	builder.Prompts.text(session, 'Plz tell me about seccond gram!');
	// }
	// ,function(session, results){
	// 	// fncTellMe();
	// 	if(results.response == "ok"){
	// 		session.userData.seccond = results.response;
	// 	} else {
	// 		// session.endDialog();
	// 		session.send(sessiom.userData.seccond);
	// 	}
	// }
	// ,function(session, results){
	// 	// if(!session.userData.seccond){
	// 	// 	session.replaceDialog('/talk/replace');
	// 	// } else {
	// 	// 	session.endDialog();
	// 	// }
	// 	session.replaceDialog('/talk/replace');

	// }
// ]
);

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

var fncTellMe = function(session){
		if(!session.userData.first){
			session.beginDialog('/talk/first');

		} else if(! session.userData.seccond){
			session.beginDialog('/talk/seccond');

		} else {
			session.send('I catch ' + session.userData.first + " and " + session.userData.seccond + "!");
		
		}
	};

dialog.matches('choice', [
	function(session){
		session.beginDialog('/choicetest');
	},
	function(session){
		session.send(session.userData.choice);
	}
]);

bot.add('/choicetest', [
	function(session){
		builder.Prompts.choice(session, "select","red|blue|green");
	},
	function(session, results){
		session.userData.choice = results.response.entity;
		session.endDialog();
	}	
]);

dialog.matches('今何時', function(session){
	var dt = new Date();

	var fmt_date = dt.toFormat("YYYY/MM/DD HH:MI:SS");

	session.send(fmt_date);
});

dialog.matches('book', [
	function(session){
		session.beginDialog('/book/select');
	},
	function(session){
		if(session.userData.book == 'comic'){
			session.userData.booktype = 'c';
			// session.send(session.userData.booktype);
		} else if(session.userData.book == 'novel') {
			session.userData.booktype = 'b';
		}
	},
	function(session, results){
		session.beginDialog('/book/search');
	}
]);

bot.add('/book/select', [
	function(session){
		// builder.Prompts.choice(session, "select menu", "comic|novel");
		builder.Prompts.text(session, "select menu comic|novel");
	},
	function(session, results){
		session.userData.book = results.response;
		session.endDialog();
	}
]);

bot.add('/book/search', function(session){

	var dtBase = new Date();

	// 北米時間(JST-9)を日本時間に換算
	var dt = dtBase.addHours(9);
	//var dt = dtBase;

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

	var fmt_full = dt.toFormat('YYYY/MM/DD HH:MI:SS');

	// c:comic b:novel
	var book_type = session.userData.booktype;

	// 開始文言設定
	// var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
	var rst_book_text = "本日(" + fmt_full + ")発売の本は...\n\r";
	rst_book_text += "---\n\r";

	// ブックサーチから今月分のページへアクセス
	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now +'b.html',  function (err, $, res) {

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

dialog.matches('コミック', function(session){

	var dtBase = new Date();

	// 北米時間(JST-9)を日本時間に換算
	var dt = dtBase.addHours(9);
	//var dt = dtBase;

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

	var fmt_full = dt.toFormat('YYYY/MM/DD HH:MI:SS');

	// 開始文言設定
	// var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
	var rst_book_text = "本日(" + fmt_full + ")発売の本は...\n\r";
	rst_book_text += "---\n\r";

	// ブックサーチから今月分のページへアクセス
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

dialog.matches('小説', function(session){

	var dtBase = new Date();

	// 北米時間(JST-9)を日本時間に換算
	var dt = dtBase.addHours(9);
	//var dt = dtBase;

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

	var fmt_full = dt.toFormat('YYYY/MM/DD HH:MI:SS');

	// 開始文言設定
	// var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
	var rst_book_text = "本日(" + fmt_full + ")発売の本は...\n\r";
	rst_book_text += "---\n\r";

	// ブックサーチから今月分のページへアクセス
	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now + 'b.html',  function (err, $, res) {

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


bot.add('/', dialog);

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(port, function() {
	console.log('%s listening to %s', server.name, server.url);
});
