/* Global variables */
var PLAY_LIST_MIN_QUOTA = 150;

// Setup api_base
var api_base = '';
var font_base = '';

var MyName = '', MyUid = '';
var PlayList = [];
var CurrentPlayPair;
var isPlayDialogEmpty = true;
var needStartPlay = false;
var lockPlayList = false;

if(localStorage['base']){
	// Set api_base if custom settings detected
	api_base = localStorage['base'];
} else {
	// Default api_base
	api_base = 'http://api.pairs.cc';
}

if(localStorage['front_base']) {
    front_base = localStorage['front_base'];
} else {
    front_base = 'http://www.pairs.cc';
}

// Page State (ENUM)
var PageState = {
    MAIN:    0,
    COMMENT: 1,
    SEARCH:  2,
    PAGE:    3,
    LOGIN:   4,
    LOGOUT:  5
};

// Default: not logged_in, not in_detail (table page)
var logged_in = false;
var in_detail = false; // This indicates if user is currently in a detail page or table page

function pageLayout(page_state) {
    console.log("page_state = " + page_state);
    if(page_state == PageState.MAIN) {
        hideAllLayout();
        $('#tool-bar').show();
        $('#top-table-outer').show();
        if(logged_in) {
            $('#me-table-outer').show();
        }
    } else if(page_state == PageState.COMMENT) {
        hideAllLayout();
        in_detail = true;
        $('#tool-bar').show();
        $('#comment-table-outer').show();
    } else if(page_state == PageState.SEARCH) {
        hideAllLayout();
		in_detail = true;
        $('#tool-bar').show();
        $('#search-table-outer').show();
    } else if(page_state == PageState.PAGE) {
        in_detail = true;
        hideAllLayout();
        window.scrollTo(0, 0);
    } else if(page_state == PageState.LOGOUT) {
        $('#login-modal-button').html('登入');
        $('#btn-showfriends').hide();
        $('#btn-public').hide();
        $('#welcome_msg').show();
        $('#me-table-outer').hide();
        $('#username-li').hide();
    } else if(page_state == PageState.LOGIN) {
        $('#login-modal-button').html('登出');
        $('#btn-showfriends').show();
        $('#btn-public').show();
        $('#welcome_msg').hide();
        $('#username-li').show();
        if(!in_detail)  $('#me-table-outer').show();
    }
}

function hideAllLayout() {
    $('#top-table-outer').hide();
    $('#comment-table-outer').hide();
    $('#main-option').hide();
    $('#me-table-outer').hide();
    $('#search-table-outer').hide();
    $('#tool-bar').hide();
    $('.pages').hide();
}

/* Functions */
function showComment(pid)
{
    /*
	if(!in_detail){
		window.location.hash = '#' + pid;
		// user may be browsing at the bottom of table previously
		window.scrollTo(0, 0);
	}
    */

    pageLayout(PageState.COMMENT);

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
            networkerror();
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
                    listTopPairs();
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

                    var table_id = "comment_";

                    var row_html = '\
                        <tr> \
                            <td class="pair_table_col_thumbnail1"><a href="https://facebook.com/'+fbid_real1+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real1 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                            <td class="pair_table_col_thumbnail2"><a href="https://facebook.com/'+fbid_real2+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real2 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                            <td class="pair_table_col_name1"><a href="/?su='+uid1+'">'+ name1 +'</a></td>;';


                    // heart button
                    if(voted.indexOf(pid+'') == -1) {
                        row_html += '<td class=""> <button type="button" class="btn btn-default" id="btn_'+pid+'" onclick="vote(' + pid + ',0, 1, \''+table_id+'\')"><img width="30" width="20" src="assets/img/heart-unpressed.png"/></button></td>';
                    } else {
                        row_html += '<td class=""> <button type="button" class="btn btn-default" id="btn_'+pid+'" onclick="vote(' + pid + ',1, 1, \''+table_id+'\')"><img width="30" width="20" src="assets/img/heart-pressed.png"/></button></td>';
                    }

                    row_html += '\
                            <td class="pair_table_col_name2"><a href="/?su='+uid2+'">'+ name2 +'</a></td> \
                            <td class="pair_table_col_vote_count" id="count_'+table_id+pid+'">' + count + '</td> \
                            <td class="pair_table_col_vote_unit">票</td>';

                    row_html += '</tr>';

                    $('div.fb-comments').attr('data-href', front_base + '/?p=' + pid);
                    $('button.share-button').click(function() {
                        shareComment(pid);
                    });

                    (function(d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) return;
                        js = d.createElement(s); js.id = id;
                        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=520188428109474&version=v2.0&status=1";
                        fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                    // FB.XFBML.parse();

                    // finally
                    $('#loader-single-gif').hide();
                    $('#comment-loader-gif').hide();

                    $('#comment-table').html('');
                    $('#comment-table').append(row_html);

                    $('div.fb-comments').show();
                }
            });
         }
	});
}

/* This helper do the layout for top-table, me-table, search-table, etc */
function listPairHelper(table, voted, data, loader) {

    // clean up
    table.html('');
    loader.hide();

    var table_id = table.attr('id')+'_';
    var data_content = data['data'];
    var data_sorted = data_content.sort(function (a, b) {
        return (parseInt(b['count']) - parseInt(a['count']));
    });

    if(data_sorted.length <= 0) {
        table.append('<h4>無資料</h4>');
    }

    data_sorted.forEach(function(data_s){

        var fbid_real1 = data_s['user1']['fbid_real'],
            fbid_real2 = data_s['user2']['fbid_real'];
        var name1 = data_s['user1']['name'],
            name2 = data_s['user2']['name'];
        var uid1 = data_s['user1']['uid'],
            uid2 = data_s['user2']['uid'];
        var count = data_s['count'];
        var pid = data_s['pid'];

        var row_html = '\
            <tr> \
                <td class="pair_table_col_thumbnail1"><a href="https://facebook.com/'+fbid_real1+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real1 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                <td class="pair_table_col_thumbnail2"><a href="https://facebook.com/'+fbid_real2+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real2 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                <td class="pair_table_col_name1"><a href="/?su='+uid1+'">'+ name1 +'</a></td>';

        // if not voted
        /* let's still show the button even the user is not logged in, and popup login modal when clicked */
        if(voted.indexOf(pid) == -1) {
            row_html += '<td class=""><button type="button" class="btn btn-default" id="btn_'+table_id+pid+'" onclick="vote(' + pid + ',0, 0, \''+table_id+'\')"><img width="30" width="20" src="assets/img/heart-unpressed.png"/></button></td>';
        } else {
            row_html += '<td class=""><button type="button" class="btn btn-default" id="btn_'+table_id+pid+'" onclick="vote(' + pid + ',1, 0, \''+table_id+'\')"><img width="30" width="20" src="assets/img/heart-pressed.png"/></button></td>';
        }

        row_html += '\
                <td class="pair_table_col_name2"><a href="/?su='+uid2+'">'+ name2 +'</a></td> \
                <td class="pair_table_col_vote_count" id="count_'+table_id+pid+'">' + count + '</td> \
                <td class="pair_table_col_vote_unit">票</td>';

        row_html += '<td class=""> <button type="button" class="btn btn-default" onclick="window.location.replace(\'/?p='+ pid + '\');" >&nbsp;<i class="fa fa-chevron-right"></i>&nbsp;</button> </td> </tr>';

        // finally
        table.append(row_html);
    });

}

function listMePairs(voted) {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: api_base + "/search?uid=" + MyUid,
        xhrFields: {
            withCredentials: true
        },
        error: function(data){
            // error
            networkError();
        },
        success: function(data){
            listPairHelper($('#me-table'), voted, data, $('#me-loader-gif'));
        }
    });
}

function listSearchPairs(key, is_uid) {

    console.log("key = " + key);

    var api = (is_uid) ? "/search?uid=" : "/search?q=";
    pageLayout(PageState.SEARCH);

    var encoded_key = encodeURI(key);

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
                url: api_base + api + key,
                xhrFields: {
                    withCredentials: true
                },
                error: function(data){
                    // error
                    networkError();
                },
                success: function(data){
                    listPairHelper($('#search-table'), voted, data, $('#search-loader-gif'));
                }
            });
        }
    });
}

/* listTopPairs: clean up the current table, and reload the main table */
function listTopPairs(){

    pageLayout(PageState.MAIN);

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
            if(logged_in) {
                listMePairs(voted);
            }
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
                    listPairHelper($('#top-table'), voted, data, $('#loader-gif'));
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
                pageLayout(PageState.LOGOUT);
                window.location.replace('');
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

/* NOTE: this function will only update current table, not won't reload */
function vote(pid, is_retrieve, go_redirect, table_id){

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
            if( data['status'] == 401 ) {
                $('#login_dialog').modal('show');
            } else {
                networkError();
            }
		},
		success: function(data){

			console.log(data);

            if(go_redirect) {
                window.location.replace("/?p="+pid);
                return;
            }

            if(is_retrieve == 1) {

                var count = parseInt($('#count_'+table_id+pid).html());
                $('#count_'+table_id+pid).html(count-1);
                $('#btn_'+table_id+pid).attr('class','btn btn-default');
                $('#btn_'+table_id+pid).attr('onclick','vote(' + pid + ',0, 0, \''+table_id+'\')');
                $('#btn_'+table_id+pid).html('<img width="30" width="20" src="assets/img/heart-unpressed.png"/>');

                console.log("retrieved: " + pid + "; table: " + table_id);

            } else if(is_retrieve ==0) {

                var count = parseInt($('#count_'+table_id+pid).html());
                $('#count_'+table_id+pid).html(count+1);
                $('#btn_'+table_id+pid).attr('class','btn btn-default');
                $('#btn_'+table_id+pid).attr('onclick','vote(' + pid + ',1, 0, \''+table_id+'\')');
                $('#btn_'+table_id+pid).html('<img width="30" width="20" src="assets/img/heart-pressed.png"/>');

            }
		}
	});
}

/* promoteControllerInit: this is for setting up the popup modal for voting new pairs */
function promoteControllerInit() {

    // NOTE: remove client FB login method (but keep it for future plans)
    // accesstoken = "";
	$('#usage-a').click(function(){
        $('#usage-container').modal('show');
        console.log('clicked!!!');
    });

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
                if( data['status'] == 401 ) {
                    $('#login_dialog').modal('show');
                } else {
                    networkError();
                }
            },
            success: function(data){
                console.log(data);
                var pid = data['pid'];
                window.location.replace("/?p="+pid);
            }
        });

	});
}

/* tableOptionInit: setup the controllers in table option */
function tableOptionInit() {

	$('#search-submit').click(function(){
		listTopPairs();
	});

    // filter applies when <select> changes
    $('.selectpicker').change(function() {
		listTopPairs();
    });

	$('.selectpicker').selectpicker();

}

/* searchButtonInit: setup search button in popup modal */
function searchButtonInit() {
    $('#btn-search').click(function() {
        searchButtonHelper();
    });
    $('#input-search').keypress(function (e) {
        if (e.which == 13) {
            searchButtonHelper();
            return false;
        }
    });
}

function playButtonInit() {
    $('#play-button').click(function() {
        startPlay();
    });
    $('#play-submit').click(function() {
        //$('#play-dialog').modal('hide');
        $('div.play-user-container').animate({ opacity: 0 }, 100, function() {
            // animation complete
            playDialogPutDefaultThumbnail();
            submitPlayPost();
            fillPlayDialog();
            setTimeout(function() { $('div.play-user-container').animate({ opacity: 1 }); }, 200);
        });
        
    });
    $('#play-cancel').click(function() {
        //$('#play-dialog').modal('hide');
        $('div.play-user-container').animate({ opacity: 0 }, 100, function() {
            playDialogPutDefaultThumbnail();
            fillPlayDialog();
            setTimeout(function() { $('div.play-user-container').animate({ opacity: 1 }); }, 200);
        });
    });
}

function loginDialogInit() {
	$('#privacy-a').click(function(){
        window.location.replace('/#privacy');
    });
	$('#term-a').click(function(){
        window.location.replace('/#term');
    });
}

function playDialogPutDefaultThumbnail() {
    $('#play-img0').attr('src', "assets/img/user.png");
    $('#play-img1').attr('src', "assets/img/user.png");
}

function startPlay() {
    if(isPlayDialogEmpty) {
        // first time fill
        fillPlayDialog();
    }
    $('#play-dialog').modal('show');
}

function submitPlayPost() {

    console.log(CurrentPlayPair);

    if(!logged_in) {
        loginPrompt();
        return;
    }

    var type1 = CurrentPlayPair[0]['type'],
        type2 = CurrentPlayPair[1]['type'],
        id1 = CurrentPlayPair[0]['id'],
        id2 = CurrentPlayPair[1]['id'];

	$.ajax({
		type: "POST",
		dataType: "json",
		url: api_base + "/",
		data: 'type1=' + type1 + '&type2=' + type2 + '&id1=' + id1 + '&id2=' + id2,
		xhrFields: {
			withCredentials: true
		},
		error: function(data){
			console.log(data);
            if( data['status'] == 401 ) {
                $('#login_dialog').modal('show');
            } else if ( data['status'] == 400 ) {
                console.log("not accepable photo id");
            } else {
                networkError();
            }
		},
		success: function(data){
			console.log(data);
            // do nothing
		}
	});
}

function fillPlayDialog() {

    fillPlayList(); // it will detect if needed

    var pair = PlayList.shift();
    CurrentPlayPair = pair;
    $('#play-name0').text(pair[0]['name']);
    $('#play-name1').text(pair[1]['name']);
    $('#play-img0').attr('src', pair[0]['photo_url']);
    $('#play-img1').attr('src', pair[1]['photo_url']);
    $('#play-link0').attr('href', 'https://www.facebook.com/search/results/?q=' + pair[0]['name']);
    $('#play-link1').attr('href', 'https://www.facebook.com/search/results/?q=' + pair[1]['name']);

    console.log("update done");

    if(PlayList.length > 0) isPlayDialogEmpty = false;
}

function searchButtonHelper() {
    var key = $('#input-search').val();
    console.log("key = " + key);

    // parse if it's URL
    key = parseIDfromURL(key);
    console.log("parsed key = " + key);

    window.location.replace('/?s=' + key);
}

function parseIDfromURL(input) {
    var words = input.split('/');
    var id = words[words.length-1];

    // case: https://www.facebook.com/100002177545908
    if(numericReg.test(id) || stringReg.test(id)){
        return id;
    }

    words = id.split('?');
    var id_2 = words[0];

    // case: https://www.facebook.com/profile.php?id=100002177545908
    if(id_2 == 'profile.php')
    {							
        //case: https://www.facebook.com/profile.php?id=100001326482055&fref=pb&hc_location=friends_tab
        words = id.split('=');
        id = words[1];
        words = id.split('&');
        id = words[0];
        if(numericReg.test(id) || stringReg.test(id)) {
            return id;
        }
    }
    // case: https://www.facebook.com/sunwolf.chang?fref=ts
    if(numericReg.test(id_2) || stringReg.test(id_2)) {
        return id_2;
    }
    return input;
}

/* browseByHash: routing by using hash tag in request URL */
function browseByHash(){
	console.log(window.location.hash);
	var hash_arg = window.location.hash.replace('#','');
	if(parseInt(hash_arg) != NaN && parseInt(hash_arg) == hash_arg){
        /*
		in_detail = true;
		showComment(parseInt(hash_arg));
        */
	} else if(hash_arg == 'about') {
        pageLayout(PageState.PAGE);
        $('#page_about').show();
    } else if(hash_arg == 'sponsor') {
        pageLayout(PageState.PAGE);
        $('#page_sponsor').show();
    } else if(hash_arg == 'privacy') {
        pageLayout(PageState.PAGE);
        $('#page_privacy').show();
    } else if(hash_arg == 'term') {
        pageLayout(PageState.PAGE);
        $('#page_term').show();
    } else {
        // ignore
    }
}

function getURLVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/* main function */
$(document).ready(function() {

	// check if user came with # or not
	if(window.location.hash){
        browseByHash();
	}

    var URLVars = getURLVars();
    if(URLVars[0] == 's') {
        // search
        listSearchPairs(URLVars['s'], 0);
    } else if (URLVars[0] == 'su') {
        listSearchPairs(URLVars['su'], 1);
    } else if(URLVars[0] == 'p') {
        // comment
		showComment(parseInt(URLVars['p']));
    } else if(URLVars[0] == 'play'){
        needStartPlay = true;
    }
    console.log(URLVars);

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

				logged_in = true;
                pageLayout(PageState.LOGIN);

                // update global variables
                MyName = data['data']['name'];
                MyUid = data['data']['uid'];

                // update top username display
                $('#username-a').text(MyName);

                // get play_list
                fillPlayList();

			}else{
				// Not logged in
				logged_in = false;
                pageLayout(PageState.LOGOUT);
                console.log("login_status: not logged in");
			}

			$('#login-modal-button').click(loginToggle);
            if(!in_detail)  listTopPairs();
		}
	});

	$('#login-button').click(function() {
		document.location.href = api_base + '/login';
	});

    promoteControllerInit();
    tableOptionInit();
    searchButtonInit();
    playButtonInit();

    setupFacebookCommentCustomCSS();

	$(window).on('hashchange', function() {
		in_detail = true;
		// HTML5 specifieds a hashchange event, supported by most modern browsers
		// http://stackoverflow.com/questions/680785/on-window-location-hash-change
		browseByHash();
	});

    // minor task
    loginDialogInit();

});

function networkError() {
    if (confirm('網路連線問題, 難免呀...')) {
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

function  setupFacebookCommentCustomCSS() {
    var css_filepath = 'pairs-view-facebook-comment.css';
    $("iframe.fb_ltr").contents().find('head').append('<link href="pairs-view.css" rel="stylesheet">')
}

function shareComment(pid) {
    console.log("about to comment pid: " + pid);
    FB.ui({
            method: 'feed',
            name: 'Facebook Dialogs',
            link: 'https://developers.facebook.com/docs/dialogs/',
            picture: 'http://fbrell.com/f8.jpg',
            caption: 'Reference Documentation',
            description: 'We are using Fake Data now for testing purpose.'
        },
            function(response) {
            if (response && response.post_id) {
                alert('Post was published.');
            } else {
                alert('Post was not published.');
            }
        }
     );
}

function fillPlayList () {

    console.log("length: " + PlayList.length);
    
    // no need to refill
    if(PlayList.length >= PLAY_LIST_MIN_QUOTA)  return;

    if(lockPlayList)    return;
    lockPlayList = true;

    $.ajax({
        type: "GET",
        dataType: "json",
        url: api_base + "/play_list",
        xhrFields: { withCredentials: true },
        error: function(data){
            console.log(data);
            if( data['status'] == 401 ) {
                $('#login_dialog').modal('show');
            } else {
                networkError();
            }
            lockPlayList = false;
        },
        success: function(data){
            var data_content = data['data'];
            data_content.forEach(function(data_pair){
                PlayList.push(data_pair);
                if(needStartPlay) {
                    startPlay();
                    needStartPlay = false;
                }
            });
            lockPlayList = false;
        }
    });

    if (window.location.hash && window.location.hash == '#_=_') {
        window.location.hash = '';
    }

}
