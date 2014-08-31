/* Global variables */

// Setup api_base
var api_base = '';

if(localStorage['base']){
	// Set api_base if custom settings detected
	api_base = localStorage['base'];
}else{
	// Default api_base
	api_base = 'http://api.pairs.cc';
}

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
        url: api_base + "/my_votes",
        xhrFields: {
                withCredentials: true
            },
        error: function(data){
            // error
            // should get empty array if not logged in
            networkError();
        },
        success: function(data){
            var voted = data['data']['voted'];

            console.log(voted);

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
                    var pair = data['data'];
                    console.log(pair);

                    var fbid_real1 = pair['user1']['fbid_real'],
                        fbid_real2 = pair['user2']['fbid_real'];
                    var name1 = pair['user1']['name'],
                        name2 = pair['user2']['name'];
                    var uid1 = pair['user1']['uid'],
                        uid2 = pair['user2']['uid'];
                    var count = pair['count'];

                    var row_html = '\
                        <tr> \
                            <td class="pair_table_col_thumbnail1"><a href="https://facebook.com/'+fbid_real1+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real1 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                            <td class="pair_table_col_thumbnail2"><a href="https://facebook.com/'+fbid_real2+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real2 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                            \
                            <td class="pair_table_col_nama1"><a href="#search?uid='+uid1+'">'+ name1 +'</a></td> \
                            <td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
                            <td class="pair_table_col_name2"><a href="#search?uid='+uid2+'">'+ name2 +'</a></td> \
                            <td class="pair_table_col_vote_count" id="count_'+pid+'">' + count + '</td> \
                            <td class="pair_table_col_vote_unit">票</td>';

                    /* let's still show the button even the user is not logged in, and popup login modal when clicked */
                    if(voted.indexOf(pid+'') == -1) {
                        row_html += '<td class=""> <button type="button" class="btn btn-danger" id="btn_'+pid+'" onclick="vote(' + pid + ',0, 1)"><img width="30" width="20" src="assets/img/heart.png"/></button></td>';
                    } else {
                        row_html += '<td class=""> <button type="button" class="btn btn-primary" id="btn_'+pid+'" onclick="vote(' + pid + ',1, 1)"><img width="30" width="20" src="assets/img/brokenheart.png"/></button></td>';
                    }
                    row_html += '</tr>';

                    var comment_html = '<div class="fb-comments" data-href="'+api_base+'/'+pid+'" data-numposts="100" data-order-by="time" data-width="100%" data-colorscheme="light"></div>';
                    comment_html += '<div class="row centered"><button type="button" class="btn btn-default" onclick="listAllPairs(logged_in);"><i id="back-home-content" class="fa fa-home"></i></button></div>';

                    console.log(comment_html);

                    // finally
                    $('#loader-single-gif').hide();

                    $('#comment-table').html('');
                    $('#comment-table').append(row_html);
                    $('#comment-div').html('');
                    $('#comment-div').html(comment_html);

                    $('#top-table-outer').hide();
                    $('#comment-table-outer').show();
                    $('#me-table-outer').hide();

                    in_detail = true;
                }
            });
         }
	});
}


function listPairHelper(logged_in, table, voted, data) {
}

/* listAllPairs: clean up the current table, and reload the main table */
function listAllPairs(logged_in){

	$('#comment-table-outer').hide();
	$('#top-table-outer').show();
    if(logged_in)   $('#me-table-outer').show();
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
            // should get empty array if not logged in
            networkError();
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
                    networkError();
				},
				success: function(data){

					// clear table before updating
					$('#top-table').html('');
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
								<td class="pair_table_col_nama1"><a href="#search?uid='+data['user1']['uid']+'">'+ data['user1']['name'] +'</a></td> \
								<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
								<td class="pair_table_col_name2"><a href="#search?uid='+data['user2']['uid']+'">'+ data['user2']['name'] +'</a></td> \
								<td class="pair_table_col_vote_count" id="count_'+data['pid']+'">' + data['count'] + '</td> \
								<td class="pair_table_col_vote_unit">票</td>';

                        // if not voted
                        /* let's still show the button even the user is not logged in, and popup login modal when clicked */
						if(voted.indexOf(data['pid']) == -1) {
							row_html += '<td class=""> <button type="button" class="btn btn-danger" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',0, 0)"><img width="30" width="20" src="assets/img/heart.png"/></button></td>';
						} else {
							row_html += '<td class=""> <button type="button" class="btn btn-primary" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',1, 0)"><img width="30" width="20" src="assets/img/brokenheart.png"/></button></td>';
						}
                        row_html += '<td class=""> <button type="button" class="btn btn-default" onclick="showComment('+ data['pid'] + ');" >&nbsp;<i class="fa fa-chevron-right"></i>&nbsp;</button> </td> </tr>';

                        // finally
						$('#top-table').append(row_html);
					});
				}
			});
		}
	});
}

function logout() {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: api_base + "/logout",
        xhrFields: {
            withCredentials: true
        },
        error: function(data){
            // error
            networkError();
        },
        success: function(data){
            if(data['status'] == 0 && data['result'] == 'ok'){

                // Successfully logged out
                logged_in = false;

                // hide useless button in table option
                $('#btn-showfriends').hide();
                $('#btn-public').hide();
                $('#welcome_msg').show();
                $('#me-table-outer').hide();

                $('#login-modal-button').html('登入');
            }
        }
    });
}

function loginPrompt() {
	if(logged_in == false){
		$('#login_dialog').modal('show');
    }
    else {
        // ignore
    }
}

function loginToggle(){

	if(logged_in == false){
        loginPrompt();
	} else {
        logout();
	}

}

/*
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
			$('#top-table').append(row_html);
		}
	});
}
*/

/* NOTE: this function will only update current table, not won't reload */
function vote(pid, is_retrieve, just_reload){

    if(!logged_in) {
        loginPrompt();
        return;
    }

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
            networkError();
		},
		success: function(data){

			console.log(data);

            if(just_reload) {
                location.reload();
                return;
            }

            if(is_retrieve == 1) {

                var count = parseInt($('#count_'+pid).html());
                $('#count_'+pid).html(count-1);
                $('#btn_'+pid).attr('class','btn btn-danger');
                $('#btn_'+pid).attr('onclick','vote(' + pid + ',0, 0)');
                $('#btn_'+pid).html('<img width="30" width="20" src="assets/img/heart.png"/>');

            } else if(is_retrieve ==0) {

                var count = parseInt($('#count_'+pid).html());
                $('#count_'+pid).html(count+1);
                $('#btn_'+pid).attr('class','btn btn-primary');
                $('#btn_'+pid).attr('onclick','vote(' + pid + ',1, 0)');
                $('#btn_'+pid).html('<img width="30" width="20" src="assets/img/brokenheart.png"/>');

                return data['pid'];
            }
		}
	});
}

/* promoteControllerInit: this is for setting up the popup modal for voting new pairs */
function promoteControllerInit() {

    // NOTE: remove client FB login method (but keep it for future plans)
    // accesstoken = "";

	//Select user
	$('#add-pair-button').click(function(){

        // check if login
		if(logged_in) {
			$('#us-container').modal('show');
        } else {
            loginPrompt();
        }

        // clean up
		$('#user_table1 tr').empty();
		$('#user_table2 tr').empty();

	});

    $("#inputStr1").keyup(function() {
		var input = $("#inputStr1").val();
        FBIdConvertor(input, 0);
    });

    $("#inputStr2").keyup(function() {
		var input = $("#inputStr2").val();
        FBIdConvertor(input, 1);
    });

	//Promote new pair
	$('#confirm-button').on('click', function(){

        if(result[0] == null || result[1] == null) {
			alert("請正確選擇兩位Facebook使用者");
            return;
        }

        var fbid1 = result[0]["id"],
            fbid2 = result[1]["id"];
        console.log("pairing: " + fbid1 + " and " + fbid2);
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
                console.log(data.responseJSON.message);
                networkError();
            },
            success: function(data){
                console.log(data);
                // FIXME: direct to pid's comment page
                if(in_detail){
                    showComment(data['pid']);
                } else {
                    $('#top-table tr').empty();
                    listAllPairs(logged_in);
                }
            }
        });

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
    $('#top-table-outer').hide();
    $('#comment-table-outer').hide();
    $('#main-option').hide();
    $('#me-table-outer').hide();
    $('#tool-bar').hide();
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

    /*
	FB.init({ appId: "547776065350710",
		status: true,
		cookie: true,
		xfbml: true,
		oauth: true
	});
    */

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
            networkError();
		},
		success: function(data){
			if(data['status'] == 1){

				// Logged in
				logged_in = true;
				$('#login-modal-button').html('登出');
				$('#btn-showfriends').show();
				$('#btn-public').show();
                $('#welcome_msg').hide();
                $('#me-table-outer').show();

                console.log("login_status: logged in");

			}else{

				// Not logged in
				logged_in = false;
				$('#login-modal-button').html('登入');
				$('#btn-showfriends').hide();
				$('#btn-public').hide();
                $('#welcome_msg').show();
                $('#me-table-outer').hide();

                console.log("login_status: not logged in");

			}

			$('#login-modal-button').click(loginToggle);

			if(!in_detail){ // in_detail is set in browseByHash
				// List all existing Pairs
				listAllPairs(logged_in);
			}
		}
	});

	$('#login-button').click(function() {
		document.location.href = api_base + '/login';
	});


	//FB SDK get user accesstoken
    /*
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
    */

    promoteControllerInit();
    tableOptionInit();

	$(window).on('hashchange', function() {
		in_detail = true;
		// HTML5 specifieds a hashchange event, supported by most modern browsers
		// http://stackoverflow.com/questions/680785/on-window-location-hash-change
		browseByHash();
	});

});

function networkError() {
    if (confirm('網路連線問題')) {
        location.reload();
    }
    else {
        // do nothing
    }
}

function promptSearchDialog() {
    console.log("search dialog showed");
    $('#search_dialog').modal('show');
}
