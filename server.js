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

var array_next = ['次','つぎ','tugi','next','Tugi','Next'];
var array_all = ['全部','全て','ぜんぶ','すべて','zennbu','subete','all','Zennbu','Subete','All'];
var array_gateway = array_next.concat(array_all);

// ストックしている結果を表示
dialog.matches(array_gateway, function(session){

	var sendText = '';

	// 返信文字列生成
	var responseText = function(){

		var resultArray = {};

		// userData.stockがある場合にtitleとurlを返信文字列にセット
		if(session.userData.stock){
			if(session.userData.stock.length != 0){
				resultArray = session.userData.stock[0];
				sendText += resultArray.title + "\n\r";

				// urlは無しの場合もある
				if(resultArray.url != ""){
					sendText += resultArray.url + "\n\r";					
				}

				// 取り出し済みのストック(先頭)を消す
				session.userData.stock.shift();
			}
		} else {
			sendText = "ストックがもうありません！";
		}		
	};

	// ループ回数
	var num_loop = 0;

	// n個づつ表示 else if すべて表示
	if (array_next.indexOf(session.message.text) >= 0) {
		num_loop = 10;
	} else if(array_all.indexOf(session.message.text) >= 0) {
		// ストック自体されているか？
		if(session.userData.stock){
			num_loop = session.userData.stock.length;
		} else {
			// ストックが無いむねだけ表示
			num_loop = 1;
		}
	}

	// 回数分表示
	for(var i = 0; i < num_loop; i++){
		responseText();
	}

	// userData.stockの実体がない or 最後の項目までshiftした
	if(session.userData.stock&&session.userData.stock.length == 0){
		session.userData.stock = null;
		sendText += "\n\r以上です！";
	}

	session.send(sendText);

});

// 繰り返しテスト
dialog.matches(['repeat','Repeat'], 
	function(session){
		session.beginDialog('/stock/master');
	}
);

// ループ管理用ダイアログ endDialogしない限りループ＿
bot.add('/stock/master', [
	function(session){
		// promptで処理を質問
		session.beginDialog('/stock/disply');
	},
	function(session){
		// 表示用文字列の取得
		session.beginDialog('/stock/proc');
	},
	function(session){
		if(session.userData.stock_display != '表示しない'){
			// 終了しないかぎりは文字送信のみ
			session.send(session.userData.stock_text);
		} else {
			// 表示をやめる場合はendDialogを呼び出し
			session.send('ストック結果の表示を終了します！');
			session.endDialog();
		}
	}
]);

// ストックしている結果を表示
bot.add('/stock/disply', [
	function(session){
		builder.Prompts.choice(session, "ストックされた結果を表示しますか？", "10件|全件|表示しない");
	},
	function(session, results){
		session.userData.stock_display = results.response.entity;
		session.endDialog();
	}
]);

bot.add('/stock/proc', function(session){
		var sendText = '';

		// 返信文字列生成
		var responseText = function(){

			var resultArray = {};

			// userData.stockがある場合にtitleとurlを返信文字列にセット
			if(session.userData.stock){
				if(session.userData.stock.length != 0){
					resultArray = session.userData.stock[0];
					sendText += resultArray.title + "\n\r";

					// urlは無しの場合もある
					if(resultArray.url != ""){
						sendText += resultArray.url + "\n\r";					
					}

					// 取り出し済みのストック(先頭)を消す
					session.userData.stock.shift();
				}
			} else {
				sendText = "ストックがもうありません！";
			}		
		};

		// ループ回数
		var num_loop = 0;

		var display_type = session.userData.stock_display;

		if (display_type == "10件"){
			num_loop = 10;			
		} else if(display_type == "全件"){
			if(session.userData.stock){
				num_loop = session.userData.stock.length;
			} else {
			// ストックが無いむねだけ表示
				num_loop = 1;
			}
		}

		// // n個づつ表示 else if すべて表示
		// if (array_next.indexOf(session.message.text) >= 0) {
		// 	num_loop = 10;
		// } else if(array_all.indexOf(session.message.text) >= 0) {
		// 	// ストック自体されているか？
		// 	if(session.userData.stock){
		// 		num_loop = session.userData.stock.length;
		// 	} else {
		// 		// ストックが無いむねだけ表示
		// 		num_loop = 1;
		// 	}
		// }

		// 回数分表示
		for(var i = 0; i < num_loop; i++){
			responseText();
		}

		// userData.stockの実体がない or 最後の項目までshiftした
		if(session.userData.stock&&session.userData.stock.length == 0){
			session.userData.stock = null;
			sendText += "\n\r以上です！";
		}

		session.userData.stock_text = sendText;
		session.endDialog();
		// session.send(sendText);
});

dialog.matches('retry', 
	function(session){
		session.beginDialog('/common/retry');
	}
);

bot.add('/common/retry', [
	function(session){
		builder.Prompts.choice(session, "次の結果を表示しますか?", "OK|NG");
	},
	function(session, results){
		if(results.response){
			session.userData.retry = results.response.entity;
			if(results.response.entity != 'OK'){
				session.endDialog;
			}
		}
	},
	function(session, results){
		console.log("Exist!");
		session.replaceDialog('/common/retry');
	}
]);

//　結果ストック用
var responseStorage = function(session, title_text, url_text){
	var response_object = { title:title_text, url:url_text};

	if(session.userData.stock){
		session.userData.stock.push(response_object);
	} else {
		session.userData.stock = [response_object];
	}
}

dialog.matches('ストック数', function(session){

	var response_msg = "";	

	var num_stock =	responseLength(session);

	response_msg = "いま" + num_stock + "件ストックされています！" ;

	session.send(response_msg);
});

var responseLength = function(session){

	var num_stock = 0;

	if(session.userData.stock){
		num_stock = session.userData.stock.length;
	}

	return num_stock;
}

dialog.matches('4gamer',[
	function(session){
		session.beginDialog('/4g/filter');
	},
	function(session){

		var category_name = '';

		if(session.userData.selected_tag){
			category_name = session.userData.selected_tag;
		}

		// 個別の記事へのリンクの親ページ
		var url_base = 'http://www.4gamer.net';

		// 4gamerのトップページへアクセス
		client.fetch('http://www.4gamer.net/',  function (err, $, res) {

		var resultText4gamer = '';

		if(category_name != ''){
			resultText4gamer += "4Gamer・" + category_name + "カテゴリーの新着ニュースは...\n\r";
		} else {
			resultText4gamer += "4Gamerの新着ニュースは...\n\r";
		}

		 resultText4gamer += "---\n\r";

		 var response_msg = "";

		// ストック初期化
		session.userData.stock = null;

		try {
			// 先頭ストック格納 urlは無しでセット
		 	responseStorage(session, resultText4gamer, '');
			 
			// id要素がNEWS_SELECT_DAY_1のdivタグ の divタグ の h2タグ の aタグ
			// $('div#NEWS_SELECT_DAY_1 > div > h2 > a').each(function(){
			// id要素がNEWS_SELECT_DAY_1のdivタグ の divタグ
			$('div#NEWS_SELECT_DAY_1 > div').each(function(){

				// 記事
				var _$a_target = $(this).find('h2').find('a');

				// 記事タイトル
				var titleText = _$a_target.text();

				// 記事リンクURL
				var targetUrl = _$a_target.attr('href');

			 	var titleTXT = titleText + "\n\r";
			 	var urlTXT = url_base + targetUrl + "\n\r" + "---\n\r";;

			 	// フィルターありなら実行
			 	if (session.userData.filter!=''){

				 	// カテゴリー
					var _$div_tag = $(this).find('div.V2_article_tag');

					// 複数のカテゴリー
					var _$a_tag = _$div_tag.find('a');

					_$a_tag.each(function(){

						// カテゴリーそれぞれのhref要素にアクセス
						var _$a_href_tag = $(this).attr('href');

						// choiceで選択したカテゴリーと合致した場合のみストックへプッシュする
						if(_$a_href_tag==session.userData.filter){
							responseStorage(session, titleTXT, urlTXT);
						}
					});
			 	} else {
					responseStorage(session, titleTXT, urlTXT);
			 	}

			});

			// 先頭の説明テキストを除いた件数
			var num_stock = responseLength(session) - 1;

			response_msg = num_stock + "件の記事をストックしました！";

		} catch (e) {
			// ストックを初期化する
			session.userData.stock = null;

			// エラー終了
			response_msg = "検索結果をストックするのに失敗しました...";
		}

		// choceで選択したフィルターの削除
		session.userData.filter = null;
		session.userData.selected_tag = null;

		session.send(response_msg);

		});
	}
]);

// 4gamer検索用choice
bot.add('/4g/filter', [
	function(session){
		builder.Prompts.choice(session, "検索したいカテゴリーを選択してください！", 
			"全て|PS4|PS3|PS Vita|3DS|PC|Android|iPhone|iPad|ARCADE|HARDWARE|紹介記事|連載|攻略");
	},
	function(session, results){

		// デフォルトではフィルターなし(全件検索)の意
		var article_tag = '';
		var name_tag = '';

		// カテゴリー舞のhref要素
		if(results.response){
			switch(results.response.entity){
				case 'PS4':
					article_tag = '/tags/TS/TS024/';
					break;
				case 'PS3':
					article_tag = '/tags/TS/TS007/';
					break;
				case 'PS Vita':
					article_tag = '/tags/TS/TS021/';
					break;
				case '3DS':
					article_tag = '/tags/TS/TS018/';
					break;
				case 'PC':
					article_tag = '/tags/TS/TS001/';
					break;
				case 'Android':
					article_tag = '/tags/TS/TS019/';
					break;
				case 'iPhone':
					article_tag = '/tags/TS/TS013/';
					break;
				case 'iPad':
					article_tag = '/tags/TS/TS014/';
					break;
				case 'ARCADE':
					article_tag = '/tags/TS/TS015/';
					break;
				case 'HARDWARE':
					article_tag = '/tags/TS/TS002/';
					break;
				case '紹介記事':
					article_tag = '/tags/TN/TN017/';
					break;
				case '連載':
					article_tag = '/tags/TN/TN009/';
					break;
				case '攻略':
					article_tag = '/tags/TN/TN010/';
					break;
				default:
					break;
			}

			name_tag = results.response.entity; 

		}

		// userDataに検索用タグをセット
		session.userData.filter = article_tag;
		session.userData.selected_tag = name_tag;
		session.endDialog();
	}
]);

dialog.matches(['nyaa','Nyaa'], [
	function(session){
		session.beginDialog('/ny/search_word');
	},
	function(session){
		session.beginDialog('/ny/filter');
	},
	function(session){

		// 個別の記事へのリンクの親ページ
		// var url_base = 'http://sukebei.nyaa.se/?cats=8_0';

		var url_base = '';

		// 通常と18禁のURL分類
		if(session.userData.selected_tag == 'Nコミック' || session.userData.selected_tag == 'Nアニメ'){
			url_base = 'https://www.nyaa.se';
		} else {
			url_base = 'http://sukebei.nyaa.se';
		}

		// var url_base = 'http://sukebei.nyaa.se';

		// Nyaaに検索ワード込みでアクセスのトップページへアクセス
		client.fetch(url_base, { page:'search', cats:session.userData.filter, filter:'0', term:session.userData.search_word},  function (err, $, res) {

		// ストック先のクリア
		session.userData.stock = null;

		 var resultTextNyaa = "nyaaでの検索結果は...\n\r";
		 resultTextNyaa += "---\n\r";

		 responseStorage(session, resultTextNyaa, '');
		 
		 // id要素がNEWS_SELECT_DAY_1のdivタグ の divタグ の h2タグ の aタグ
		// $('div#NEWS_SELECT_DAY_1 > div > h2 > a').each(function(){
		// $('table.tlist > tr.tlistrow > td.tlistname > a').each(function(){
		$('table.tlist > tr.tlistrow').each(function(){

			var _$td_tlistname = $(this).find('td.tlistname');
			var _$a_tlistname = _$td_tlistname.find('a').text();

			var _$td_tlistdownload = $(this).find('td.tlistdownload');
			var _$a_tlistdownload = _$td_tlistdownload.find('a').attr('href');

			// タイトル リンクURLの順で結果文字列に追加
			// resultTextNyaa += _$a_tlistname + "\n\r";
		 // 	resultTextNyaa += "https:" + _$a_tlistdownload + "\n\r";
		 // 	resultTextNyaa += "---\n\r";

		 	// タイトル
		 	var resultTXT = _$a_tlistname + "\n\r";

		 	// ダウンロードリンク
		 	var urlTXT = "https:" + _$a_tlistdownload + "\n\r" + "---\n\r";

		 	responseStorage(session, resultTXT, urlTXT);

		});

		// ストック数取得
		var num_stock = responseLength(session) - 1;

		session.send(num_stock + "件ストックしました！");		

		 // // 取得終了を発言
		 // resultTextNyaa += "以上です!";

		 // // ユーザへ結果を送信
		 // session.send(resultTextNyaa);

		});
	}
]);

bot.add('/ny/search_word', [
	function(session){
		builder.Prompts.text(session, "検索ワードを入力してください！");
	},
	function(session, results){
		session.userData.search_word = results.response;
		session.endDialog();
	}
]);

bot.add('/ny/filter', [
	function(session){
		builder.Prompts.choice(session, "検索したいカテゴリーを選択してください！", 
			"Nコミック|Nアニメ|Aコミック|Aアニメ|Aゲーム|A実写");
	},
	function(session, results){

		// デフォルトではフィルターなし(全件検索)の意
		var article_tag = '';
		var name_tag = '';

		// カテゴリー舞のhref要素
		if(results.response){
			switch(results.response.entity){
				case 'Nコミック':
					article_tag = '2_0';
					break;
				case 'Nアニメ':
					article_tag = '1_0';
					break;
				case 'Aコミック':
					article_tag = '7_26';
					break;
				case 'Aアニメ':
					article_tag = '7_25';
					break;
				case 'Aゲーム':
					article_tag = '7_27';
					break;
				case 'A実写':
					article_tag = '8_0';
					break;
				default:
					break;
			}

			name_tag = results.response.entity; 

		}

		// userDataに検索用タグをセット
		session.userData.filter = article_tag;
		session.userData.selected_tag = name_tag;
		session.endDialog();
	}
]);

// dialog.matches('nyaa',
// 	function(session){

// 		// 個別の記事へのリンクの親ページ
// 		var url_base = 'http://sukebei.nyaa.se/?cats=8_0';

// 		// 4gamerのトップページへアクセス
// 		client.fetch(url_base,  function (err, $, res) {

// 		session.userData.stock = null;

// 		 var resultTextNyaa = "nyaa_videoの1ページ目は...\n\r";
// 		 resultTextNyaa += "---\n\r";

// 		 responseStorage(session, resultTextNyaa, '');
		 
// 		 // id要素がNEWS_SELECT_DAY_1のdivタグ の divタグ の h2タグ の aタグ
// 		// $('div#NEWS_SELECT_DAY_1 > div > h2 > a').each(function(){
// 		// $('table.tlist > tr.tlistrow > td.tlistname > a').each(function(){
// 		$('table.tlist > tr.tlistrow').each(function(){

// 			var _$td_tlistname = $(this).find('td.tlistname');
// 			var _$a_tlistname = _$td_tlistname.find('a').text();

// 			var _$td_tlistdownload = $(this).find('td.tlistdownload');
// 			var _$a_tlistdownload = _$td_tlistdownload.find('a').attr('href');

// 			// タイトル リンクURLの順で結果文字列に追加
// 			// resultTextNyaa += _$a_tlistname + "\n\r";
// 		 // 	resultTextNyaa += "https:" + _$a_tlistdownload + "\n\r";
// 		 // 	resultTextNyaa += "---\n\r";

// 		 	var resultTXT = _$a_tlistname + "\n\r";
// 		 	var urlTXT = "https:" + _$a_tlistdownload + "\n\r" + "---\n\r";

// 		 	responseStorage(session, resultTXT, urlTXT);

// 		});

// 		var num_stock = responseLength(session) - 1;

// 		session.send(num_stock + "件ストックしました！");		

// 		 // // 取得終了を発言
// 		 // resultTextNyaa += "以上です!";

// 		 // // ユーザへ結果を送信
// 		 // session.send(resultTextNyaa);

// 		});
// 	}
// );

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

bot.add('/talk/replace',
	function(session){
		session.userData.seccond = 'ok';
		session.endDialog();
	}
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

dialog.matches('本', [
	function(session){
		session.beginDialog('/book/search');
	},
	function(session){
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

		// var fmt_full = dt.toFormat('YYYY/MM/DD HH:MI:SS');
		var fmt_full = dt.toFormat('YYYY/MM/DD');

		var boot_type = session.userData.filter;

		session.userData.stock = null;

		// 開始文言設定
		// var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
		var rst_book_text = "本日(" + fmt_full + ")発売の本は...\n\r";
		rst_book_text += "---\n\r";

		responseStorage(session, rst_book_text, '');

		var base_url = '';

		if (session.userData.filter == 'c'|| session.userData.filter == 'b'){
			base_url = 'http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now + session.userData.filter + '.html'
		} else {
			base_url = 'http://www.bookservice.jp/layout/bs/common/html/schedule/' + book_type + '.html';
		}

		// ブックサーチから今月分のページへアクセス
		// client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now + 'c.html',  function (err, $, res) {
		// client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + book_type + '.html',  function (err, $, res) {
		client.fetch(base_url,  function (err, $, res) {

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

				var rst_text = '';

				// 結果文字列をセット
				if(td_date == fmt_today){
					rst_text += "出版社：" + td_publisher;
					rst_text += " / " + "作者：" + td_writeby + "\n\r";
					rst_text += "タイトル：" + td_title + "\n\r";
					rst_text += "---\n\r";
				}

				responseStorage(session, rst_text, '');

			});

		 });

	 	// rst_book_text += "以上です！";

		// HTMLタイトルを表示

		var num_stock = responseLength(session) - 1;

		session.send(num_stock + "件ストックしました！");
		
	}
]);

bot.add('/book/search', [
	function(session){
		builder.Prompts.choice(session, "検索したいカテゴリーを選択してください！", "コミック(最新月)|小説(最新月)|コミック|小説");
	},
	function(session, results){

		// デフォルトではフィルターなし(全件検索)の意
		var article_tag = '';
		var name_tag = '';

		// カテゴリー舞のhref要素
		if(results.response){
			switch(results.response.entity){
				case 'コミック(最新月)':
					article_tag = 'comic_top';
					break;
				case '小説(最新月)':
					article_tag = 'bunko_top';
					break;
				case 'コミック':
					article_tag = 'c';
					break;
				case '小説':
					article_tag = 'b';
					break;
				default:
					break;
			}

			name_tag = results.response.entity; 

		}

		// userDataに検索用タグをセット
		session.userData.filter = article_tag;
		session.userData.selected_tag = name_tag;
		session.endDialog();

	}
]);

// dialog.matches('コミック', function(session){

// 	var dtBase = new Date();

// 	// 北米時間(JST-9)を日本時間に換算
// 	var dt = dtBase.addHours(9);
// 	//var dt = dtBase;

// 	// 年号取得
// 	var	fmt_year = dt.toFormat("YYYY");

// 	// 月を取得
// 	var fmt_month = dt.toFormat("MM");

// 	// 日付を取得
// 	var fmt_day = dt.toFormat("DD");

// 	// URL用年月取得
// 	var url_now = fmt_year.slice(-2) + fmt_month;

// 	// 当日日付取得用
// 	var fmt_today = fmt_month + "/" + fmt_day;

// 	var fmt_full = dt.toFormat('YYYY/MM/DD HH:MI:SS');

// 	// 開始文言設定
// 	// var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
// 	var rst_book_text = "本日(" + fmt_full + ")発売の本は...\n\r";
// 	rst_book_text += "---\n\r";

// 	// ブックサーチから今月分のページへアクセス
// 	// client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now + 'c.html',  function (err, $, res) {
// 	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/comic_top.html',  function (err, $, res) {

// 		_$tBody = $('tBody');

// 	 	$(_$tBody.children()).each(function(){

// 			var _$td = $(this).find('td');

// 			// 出版社
// 			var td_publisher = _$td.eq(0).text();

// 			// 発売日
// 			var td_date = _$td.eq(1).text();

// 			// 作者
// 			var td_writeby = _$td.eq(4).text();

// 			// タイトル
// 			var td_title = _$td.eq(3).text();

// 			// 結果文字列をセット
// 			if(td_date == fmt_today){
// 				rst_book_text += "出版社：" + td_publisher;
// 				rst_book_text += " / " + "作者：" + td_writeby + "\n\r";
// 				rst_book_text += "タイトル：" + td_title + "\n\r";
// 				rst_book_text += "---\n\r";
// 			}

// 		});

// 	 	rst_book_text += "以上です！";

// 		// HTMLタイトルを表示
// 		session.send(rst_book_text);

// 	});
// });

// dialog.matches('小説', function(session){

// 	var dtBase = new Date();

// 	// 北米時間(JST-9)を日本時間に換算
// 	var dt = dtBase.addHours(9);
// 	//var dt = dtBase;

// 	// 年号取得
// 	var	fmt_year = dt.toFormat("YYYY");

// 	// 月を取得
// 	var fmt_month = dt.toFormat("MM");

// 	// 日付を取得
// 	var fmt_day = dt.toFormat("DD");

// 	// URL用年月取得
// 	var url_now = fmt_year.slice(-2) + fmt_month;

// 	// 当日日付取得用
// 	var fmt_today = fmt_month + "/" + fmt_day;

// 	var fmt_full = dt.toFormat('YYYY/MM/DD HH:MI:SS');

// 	// 開始文言設定
// 	// var rst_book_text = "本日(" + fmt_today + ")発売の本は...\n\r";
// 	var rst_book_text = "本日(" + fmt_full + ")発売の本は...\n\r";
// 	rst_book_text += "---\n\r";

// 	// ブックサーチから今月分のページへアクセス
// 	client.fetch('http://www.bookservice.jp/layout/bs/common/html/schedule/' + url_now + 'b.html',  function (err, $, res) {

// 		_$tBody = $('tBody');

// 	 	$(_$tBody.children()).each(function(){

// 			var _$td = $(this).find('td');

// 			// 出版社
// 			var td_publisher = _$td.eq(0).text();

// 			// 発売日
// 			var td_date = _$td.eq(1).text();

// 			// 作者
// 			var td_writeby = _$td.eq(4).text();

// 			// タイトル
// 			var td_title = _$td.eq(3).text();

// 			// 結果文字列をセット
// 			if(td_date == fmt_today){
// 				rst_book_text += "出版社：" + td_publisher;
// 				rst_book_text += " / " + "作者：" + td_writeby + "\n\r";
// 				rst_book_text += "タイトル：" + td_title + "\n\r";
// 				rst_book_text += "---\n\r";
// 			}

// 		});

// 	 	rst_book_text += "以上です！";

// 		// HTMLタイトルを表示
// 		session.send(rst_book_text);

// 	});
// });


bot.add('/', dialog);

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(port, function() {
	console.log('%s listening to %s', server.name, server.url);
});
