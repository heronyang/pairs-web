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
    } else if(page_state == PageState.LOGOUT) {
        $('#login-modal-button').html('登入');
        $('#btn-showfriends').hide();
        $('#btn-public').hide();
        $('#welcome_msg').show();
        $('#me-table-outer').hide();
    } else if(page_state == PageState.LOGIN) {
        $('#login-modal-button').html('登出');
        $('#btn-showfriends').show();
        $('#btn-public').show();
        $('#welcome_msg').hide();
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
    in_detail = false;
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
                            \
                            <td class="pair_table_col_name1"><a href="/?su='+uid1+'">'+ name1 +'</a></td> \
                            <td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
                            <td class="pair_table_col_name2"><a href="/?su='+uid2+'">'+ name2 +'</a></td> \
                            <td class="pair_table_col_vote_count" id="count_'+table_id+pid+'">' + count + '</td> \
                            <td class="pair_table_col_vote_unit">票</td>';

                    /* let's still show the button even the user is not logged in, and popup login modal when clicked */
                    if(voted.indexOf(pid+'') == -1) {
                        row_html += '<td class=""> <button type="button" class="btn btn-danger" id="btn_'+pid+'" onclick="vote(' + pid + ',0, 1, \''+table_id+'\')"><img width="30" width="20" src="assets/img/heart.png"/></button></td>';
                    } else {
                        row_html += '<td class=""> <button type="button" class="btn btn-primary" id="btn_'+pid+'" onclick="vote(' + pid + ',1, 1, \''+table_id+'\')"><img width="30" width="20" src="assets/img/brokenheart.png"/></button></td>';
                    }
                    row_html += '</tr>';

                    var comment_html = '<div class="fb-comments" data-href="'+api_base+'/'+pid+'" data-numposts="100" data-order-by="time" data-width="100%" data-colorscheme="light"></div>';
                    comment_html += '<div class="row centered"><button type="button" class="btn btn-default" onclick="window.location.replace(\'/\');"><i id="back-home-content" class="fa fa-home"></i></button></div>';

                    console.log(comment_html);

                    // finally
                    $('#loader-single-gif').hide();

                    $('#comment-table').html('');
                    $('#comment-table').append(row_html);
                    $('#comment-div').html('');
                    $('#comment-div').html(comment_html);

                    pageLayout(PageState.COMMENT);
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

    data['data'].forEach(function(data){

        var fbid_real1 = data['user1']['fbid_real'],
            fbid_real2 = data['user2']['fbid_real'];
        var name1 = data['user1']['name'],
            name2 = data['user2']['name'];
        var uid1 = data['user1']['uid'],
            uid2 = data['user2']['uid'];
        var count = data['count'];
        var pid = data['pid'];

        var row_html = '\
            <tr> \
                <td class="pair_table_col_thumbnail1"><a href="https://facebook.com/'+fbid_real1+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real1 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                <td class="pair_table_col_thumbnail2"><a href="https://facebook.com/'+fbid_real2+'" target="_blank"><img src="http://graph.facebook.com/'+ fbid_real2 +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></a></td> \
                \
                <td class="pair_table_col_name1"><a href="/?su='+uid1+'">'+ name1 +'</a></td> \
                <td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
                <td class="pair_table_col_name2"><a href="/?su='+uid2+'">'+ name2 +'</a></td> \
                <td class="pair_table_col_vote_count" id="count_'+table_id+pid+'">' + count + '</td> \
                <td class="pair_table_col_vote_unit">票</td>';

        // if not voted
        /* let's still show the button even the user is not logged in, and popup login modal when clicked */
        if(voted.indexOf(pid) == -1) {
            row_html += '<td class=""><button type="button" class="btn btn-danger" id="btn_'+table_id+pid+'" onclick="vote(' + pid + ',0, 0, \''+table_id+'\')"><img width="30" width="20" src="assets/img/heart.png"/></button></td>';
        } else {
            row_html += '<td class=""><button type="button" class="btn btn-primary" id="btn_'+table_id+pid+'" onclick="vote(' + pid + ',1, 0, \''+table_id+'\')"><img width="30" width="20" src="assets/img/brokenheart.png"/></button></td>';
        }
        row_html += '<td class=""> <button type="button" class="btn btn-default" onclick="window.location.replace(\'/?p='+ pid + '\');" >&nbsp;<i class="fa fa-chevron-right"></i>&nbsp;</button> </td> </tr>';

        // finally
        table.append(row_html);
    });

}

function listMePairs(voted) {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: api_base + "/search?uid=" + 1,
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
function vote(pid, is_retrieve, just_reload, table_id){

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

                var count = parseInt($('#count_'+table_id+pid).html());
                $('#count_'+table_id+pid).html(count-1);
                $('#btn_'+table_id+pid).attr('class','btn btn-danger');
                $('#btn_'+table_id+pid).attr('onclick','vote(' + pid + ',0, 0, \''+table_id+'\')');
                $('#btn_'+table_id+pid).html('<img width="30" width="20" src="assets/img/heart.png"/>');

            } else if(is_retrieve ==0) {

                var count = parseInt($('#count_'+table_id+pid).html());
                $('#count_'+table_id+pid).html(count+1);
                $('#btn_'+table_id+pid).attr('class','btn btn-primary');
                $('#btn_'+table_id+pid).attr('onclick','vote(' + pid + ',1, 0, \''+table_id+'\')');
                $('#btn_'+table_id+pid).html('<img width="30" width="20" src="assets/img/brokenheart.png"/>');

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
                    listTopPairs();
                }
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

function searchButtonHelper() {
    var key = $('#input-search').val();
    console.log("key = " + key);
    window.location.replace('/?s=' + key);
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
    } else {
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
				// Logged in
				logged_in = true;
                pageLayout(PageState.LOGIN);
                console.log("login_status: logged in");
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
