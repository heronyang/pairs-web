localStorage['base'] = 'http://api.pairs.cc';

/* Global variables */

var api_base = localStorage['base'];

// Default: not logged_in, not in_detail (table page)
var logged_in = false;
var in_detail = false; // This indicates if user is currently in a detail page or table page

/* Functions */
function showComment(pid)
{
	if(!in_detail){
		window.location.hash = '#' + pid;
		// user may be browsing at the bottom of table previously
		window.scrollTo(0, 0);
	}
	$.ajax({
		type: "GET",
		dataType: "json",
		url: api_base + "/p/" + pid,
		xhrFields: {
				withCredentials: true
			},
		error: function(data){
			// error, pid could be invalid
			console.log('invalid pid requested');
			window.location.hash = '';
			listAllPairs(logged_in);
		},
		success: function(data){
			// TODO: Determine if is voted, waiting for backend update
			var pair = data['data'];
			console.log(pair);

            // TODO: UI update, it may be better the HTML code is already in index.html,
            // but toggle hide/show and fill contents
			var content = '<button class="btn btn-success" onclick="listAllPairs(logged_in)">返回列表</button><br><br><img src="http://graph.facebook.com/' + pair['user1']['fbid_real'] + '/picture">' + pair['user1']['name'] + ' x \
			<img src="http://graph.facebook.com/' + pair['user2']['fbid_real'] + '/picture">' + pair['user2']['name'] + '<br>\
			票數：' + pair['count'] + '<br>\
 			<div class="fb-comments" data-href="http://api.pairs.cc/#'+pid+'" data-numposts="5" data-colorscheme="light"></fb:comments>';

			$('#main-table').hide();
			$('#main-detail').show();
			$('#main-detail').html(content);

			var commentDiv = document.getElementById('main-detail');
			FB.XFBML.parse(commentDiv);

			in_detail = true;
		}
	});
}


/* listAllPairs: clean up the current table, and reload the main table */
function listAllPairs(logged_in){

	$('#main-detail').hide();
	$('#main-table').show();
	in_detail = false;

	$.ajax({
		type: "GET",
		dataType: "json",
		url: api_base + "/my_votes",
		xhrFields: {
				withCredentials: true
			},
		error: function(data){
			// error
		},
		success: function(data){
			var voted = data['data']['voted'];
			$.ajax({
				type: "GET",
				dataType: "json",
				url: api_base + "/?interval=" + $('#filter_time').val() + "&sort=" + $('#filter_sort').val(),
				xhrFields: {
                    withCredentials: true
                },
				error: function(data){
					// error
				},
				success: function(data){

					// clear table before updating
					$('#pair_table').html('');
                    $('#loader-gif').hide();        // remove loading animation

					data['data'].forEach(function(data){
						console.log(data);

                        var fbid_real1 = data['user1']['fbid_real'];
                        var fbid_real2 = data['user2']['fbid_real'];

						var row_html = '\
							<tr> \
								<td class="pair_table_col_thumbnail1"><a href="https://facebook.com/'+fbid_real1+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real1 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
								<td class="pair_table_col_thumbnail2"><a href="https://facebook.com/'+fbid_real2+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real2 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
								\
								<td class="pair_table_col_nama1"><a href="search?fbid='+fbid_real1+'">'+ data['user1']['name'] +'</a></td> \
								<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
								<td class="pair_table_col_name2"><a href="search?fbid='+fbid_real2+'">'+ data['user2']['name'] +'</a></td> \
								<td class="pair_table_col_vote_count" id="count_'+data['pid']+'">' + data['count'] + '</td> \
								<td class="pair_table_col_vote_unit">票</td>';

                        // if not voted
                        /* let's still show the button even the user is not logged in, and popup login modal when clicked */
						if(voted.indexOf(data['pid']) == -1) {
							row_html +='<td class=""> <button type="button" class="btn btn-primary" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',0)"><img width="30" width="20" src="assets/img/heart.png"/></button></td>';
						} else {
							row_html += '<td class=""> <button type="button" class="btn btn-danger" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',1)"><img width="30" width="20" src="assets/img/brokenheart.png"/></button></td>';
						}
                        row_html += '<td class=""> <button type="button" class="btn btn-info" onclick="showComment('+ data['pid'] + ');" >&nbsp;<i class="fa fa-chevron-right"></i>&nbsp;</button> </td> </tr>';

                        // finally
						$('#pair_table').append(row_html);
					});
				}
			});
		}
	});
}

function login(){   // FIXME: it should be loginToggle(), which may imply both login/logout

	// TODO: jump to the webpage directly
    // FIXME: shouldn't it be considered with variable (logged_in) instead of string comparison?
    // should it be: 'if(logged_in)' ?
	if($('#login-button').html() == '登入'){

		// Show login button from API
		$('#login_dialog').modal('show');

	} else {

		// Call logout url
		$.ajax({
			type: "GET",
			dataType: "json",
			url: api_base + "/logout",
			xhrFields: {
				withCredentials: true
			},
			error: function(data){
				// error
			},
			success: function(data){
				if(data['status'] == 0 && data['result'] == 'ok'){

					// Successfully logged out
					logged_in = false;

                    // hide useless button in table option
					$('#btn-showfriends').hide();
					$('#btn-public').hide();

					$('#login-button').html('登入');
				}
			}
		});
	}

}

//after promoting a new pair, update the table
//TODO: integrate this function, who is only used in one place, back to where it was called
//FIXME: refresh the whole page if better, so no two same HTML code in this js file
function updateTable()
{
	$.ajax({
		type: "GET",
		dataType: "json",
		url: api_base + "/",
		xhrFields: {
				withCredentials: true
			},
		error: function(data){
			// error
		},
		success: function(data){
			//get new-inserted data
			var newdata = data['data'][data['data'].length-1];
			var row_html = '\
				<tr> \
					<td class="pair_table_col_thumbnail1"><img src="http://graph.facebook.com/'+ newdata['user1']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
					<td class="pair_table_col_thumbnail2"><img src="http://graph.facebook.com/'+ newdata['user2']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
					\
					<td class="pair_table_col_nama1">'+ newdata['user1']['name'] +'</td> \
					<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
					<td class="pair_table_col_name2">'+ newdata['user2']['name'] +'</td> \
					<td class="pair_table_col_vote_count">' + newdata['count'] + '</td> \
					<td class="pair_table_col_vote_unit">票</td> \
					<td class=""> <button type="button" class="btn btn-danger" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',1)"><img width="30" width="20" src="assets/img/brokenheart.png"/> 分開吧</button> </td> \
				</tr>';
			$('#pair_table').append(row_html);
		}
	});
}

function vote(pid, is_retrieve){

	$.ajax({
		type: "POST",
		dataType: "json",
		url: api_base + "/",
		data: 'pid=' + pid + '&is_retrieve=' + is_retrieve,
		xhrFields: {
			withCredentials: true
		},
		error: function(data){
			console.log(data);
			console.log(data.responseJSON.message);
            alert("系統連線問題，請確定網路連線後再試試！");
		},
		success: function(data){
			console.log(data);
			if(is_retrieve == 1){

                // FIXME: just refresh the table, don't do "delta-calculations" (that will be troublesome)

				var count = parseInt($('#count_'+pid).html());
				$('#count_'+pid).html(count-1);
				$('#btn_'+pid).attr('class','btn btn-info');
				$('#btn_'+pid).attr('onclick','vote(' + pid + ',0)');
				$('#btn_'+pid).html('<img width="30" width="20" src="assets/img/heart.png"/> 在一起');

			}else if(is_retrieve ==0){

				//refresh the table
				$('#pair_table tr').empty();
				listAllPairs(logged_in);

				/*var count = parseInt($('#count_'+pid).html());
				$('#count_'+pid).html(count+1);
				$('#btn_'+pid).attr('class','btn btn-danger');
				$('#btn_'+pid).attr('onclick','vote(' + pid + ',1)');
				$('#btn_'+pid).html('<img width="30" width="20" src="assets/img/brokenheart.png"/> 分開吧');*/

				return data['pid'];
			}
		}
	});
}

/* promoteControllerInit: this is for setting up the popup modal for voting new pairs */
function promoteControllerInit() {

	//Select user
	$('#promote-button').click(function(){
		fbid1 = -1;
		fbid2 = -1;

		$('#user_table1 tr').empty();
		$('#user_table2 tr').empty();

		if(logged_in) {
			$('#select_dialog1').modal('show');
        } else {
			$('#login_dialog').modal('show');
        }
	});

	$("#btn1").click(function(){

		fbid1 = -1;
		$('#user_table1 tr').empty();
		var input = $("#inputStr1").val();
		var obj = new newSearch(input,"user_table1",accesstoken);
		obj.getResult();

	});

	$("#btn2").click(function(){

		fbid2 = -1;
		$('#user_table2 tr').empty();
		var input = $("#inputStr2").val();
		var obj = new newSearch(input,"user_table2",accesstoken);
		obj.getResult();

	});

	//Promote new pair
	$('#confirm-button').on('click', function(){
		if( fbid1 != -1 && fbid2 != -1 )
		{
			$.ajax({
				type: "POST",
				dataType: "json",
				url: api_base + "/",
				xhrFields: {
					withCredentials: true
				},
				data: 'fbid1=' + fbid1 + '&fbid2=' + fbid2,
				error: function(data){
					console.log(data);
					alert(data.responseJSON.message);
				},
				success: function(data){
					console.log(data);
					if(in_detail){
						showComment(data['pid']);
					}else{
                        /*
                         * FIXME: can it be refreshing whole page instead? bugs may raise if updating, like:
                         * $('#pair_table tr').empty();
                         * listAllPairs(logged_in);
                         */
						updateTable();
					}
				}
			});
		}
		else {
			alert("請正確選擇兩位Facebook使用者");
        }
	});
}

/* tableOptionInit: setup the controllers in table option */
function tableOptionInit() {

	$('#search-submit').click(function(){
		listAllPairs(logged_in);
	});

    // filter applies when <select> changes
    $('.selectpicker').change(function() {
		listAllPairs(logged_in);
    });

	$('.selectpicker').selectpicker();

}

/* cleanForPages: use hashtags in request URL, we should like to show some pages
 * instead of the table, call this function to clean up for the pages */
function cleanForPages() {
    in_detail = true;
    $('#main-table').hide();
    $('#main-detail').hide();
    $('#main-option').hide();
    $('.pages').hide();
}

/* browseByHash: routing by using hash tag in request URL */
function browseByHash(){
	console.log(window.location.hash);
	var hash_arg = window.location.hash.replace('#','');
	if(parseInt(hash_arg) != NaN && parseInt(hash_arg) == hash_arg){
		in_detail = true;
		showComment(parseInt(hash_arg));
	} else if(hash_arg == 'about') {
        cleanForPages();
        $('#page_about').show();
    } else if(hash_arg == 'idea') {
        cleanForPages();
        $('#page_idea').show();
        document.location.href = 'https://pairs.hunchbuzz.com/challenge/1570/';
    } else if(hash_arg == 'sponsor') {
        cleanForPages();
        $('#page_sponsor').show();
    } else if(hash_arg == 'privacy') {
        cleanForPages();
        $('#page_privacy').show();
    } else if(hash_arg == 'term') {
        cleanForPages();
        $('#page_term').show();
    } else {
        // ignore
    }
}

/* main function */
$(document).ready(function() {

	FB.init({ appId: "520188428109474",
		status: true,
		cookie: true,
		xfbml: true,
		oauth: true
	});

	// check if user came with # or not

	if(window.location.hash){
		browseByHash();
	}

	// check login status and display table
	$.ajax({
		type: "GET",
		dataType: "json",
		url: api_base + '/login_status',
		xhrFields: {
				withCredentials: true
			},
		error: function(data){
			// error
		},
		success: function(data){
			if(data['status'] == 1){

				// Logged in
				logged_in = true;
				$('#login-button').html('登出');
				$('#btn-showfriends').show();
				$('#btn-public').show();

			}else{

				// Not logged in
				logged_in = false;
				$('#login-button').html('登入');
				$('#btn-showfriends').hide();
				$('#btn-public').hide();

			}

			$('#login-button').on('click', login);

			if(!in_detail){ // in_detail is set in browseByHash
				// List all existing Pairs
				listAllPairs(logged_in);
			}
		}
	});

	$('#login-facebook-button').click(function() {
		$.ajax({
			type: "GET",
			dataType: "json",
			url: api_base + '/login',
			xhrFields: {
					withCredentials: true
				},
			error: function(data){
				// error
			},
			success: function(data){
				if(data['login_url'] != null)
					document.location.href = data['login_url'];
			}
		})

	});


	//FB SDK get user accesstoken
	FB.getLoginStatus(function (response) {
		if (response.status === "connected") {  // 程式有連結到 Facebook 帳號
			//var uid = response.authResponse.userID; // 取得 UID
			accesstoken = response.authResponse.accessToken; // 取得 accessTokent
			console.log("token = "+ accesstoken);

		} else if (response.status === "not_authorized") {  // 帳號沒有連結到 Facebook 程式
			alert("請允許授權才能開始投票哦！");
		} else {    // 帳號沒有登入
			// 在本例子中，此段永遠不會進入...XD
		}
	});

    promoteControllerInit();
    tableOptionInit();

	$(window).on('hashchange', function() {
		in_detail = true;
		// HTML5 specifieds a hashchange event, supported by most modern browsers
		// http://stackoverflow.com/questions/680785/on-window-location-hash-change
		browseByHash();
	});

});
