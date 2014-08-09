if(!localStorage['base']){
	localStorage['base'] = prompt('請輸入要使用的 API Base URL (不用結尾斜線)', 'http://api.pairs.cc');
}

//global variables

var api_base = localStorage['base'];
var logged_in = false;

//TODO:show correct comment dialog
function showComment(pid)
{
	var content = '<div class="fb-comments" data-href="http://api.pairs.cc/comments/'+pid+'" data-numposts="5" data-colorscheme="light"></div>';
	
	//content = '<p>'+pid+'</p>';
	
	$('#comment-body').html(content);
	
	$('#comment_dialog').modal('show');

}


function listAllPairs(logged_in){
	
	if(logged_in)
	{
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
					url: api_base + "/",
					error: function(data){
						// error
					},
					success: function(data){
						data['data'].forEach(function(data){			
							console.log(data);
							//TODO:check if the user has voted the pair or not
							var row_html = "";
							if(voted.indexOf(data['pid']) == -1)
							{
								row_html = '\
									<tr onclick="showComment('+ data['pid'] +');"> \
										<td class="pair_table_col_thumbnail1"><img src="http://graph.facebook.com/'+ data['user1']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
										<td class="pair_table_col_thumbnail2"><img src="http://graph.facebook.com/'+ data['user2']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
										\
										<td class="pair_table_col_nama1">'+ data['user1']['name'] +'</td> \
										<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
										<td class="pair_table_col_name2">'+ data['user2']['name'] +'</td> \
										<td class="pair_table_col_vote_count" id="count_'+data['pid']+'">' + data['count'] + '</td> \
										<td class="pair_table_col_vote_unit">票</td> \
										<td class=""> <button type="button" class="btn btn-info" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',0)"><img width="30" width="20" src="assets/img/heart.png"/> 在一起</button> </td> \
									</tr>';
							}
							else
							{
								row_html = '\
									<tr onclick="showComment('+ data['pid'] +');"> \
										<td class="pair_table_col_thumbnail1"><img src="http://graph.facebook.com/'+ data['user1']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
										<td class="pair_table_col_thumbnail2"><img src="http://graph.facebook.com/'+ data['user2']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
										\
										<td class="pair_table_col_nama1">'+ data['user1']['name'] +'</td> \
										<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
										<td class="pair_table_col_name2">'+ data['user2']['name'] +'</td> \
										<td class="pair_table_col_vote_count" id="count_'+data['pid']+'">' + data['count'] + '</td> \
										<td class="pair_table_col_vote_unit">票</td> \
										<td class=""> <button type="button" class="btn btn-danger" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',1)"><img width="30" width="20" src="assets/img/brokenheart.png"/> 分開吧</button> </td> \
									</tr>';
							}
							
							$('#pair_table').append(row_html);
							if(!logged_in)
								$('#btn_'+data['pid']).hide();
						});
					}
				});
			}
		});
	}
	
	else
	{
		$.ajax({
			type: "GET",
			dataType: "json",
			url: api_base + "/",
			error: function(data){
				// error
			},
			success: function(data){
				data['data'].forEach(function(data){			
					console.log(data);
					//TODO:check if the user has voted the pair or not
					var row_html = '\
						<tr onclick="showComment('+ data['pid'] +');"> \
							<td class="pair_table_col_thumbnail1"><img src="http://graph.facebook.com/'+ data['user1']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
							<td class="pair_table_col_thumbnail2"><img src="http://graph.facebook.com/'+ data['user2']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
							\
							<td class="pair_table_col_nama1">'+ data['user1']['name'] +'</td> \
							<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
							<td class="pair_table_col_name2">'+ data['user2']['name'] +'</td> \
							<td class="pair_table_col_vote_count">' + data['count'] + '</td> \
							<td class="pair_table_col_vote_unit">票</td> \
						</tr>';
					
					$('#pair_table').append(row_html);
				});
			}
		});
	}
}

function changeList()
{
	$("#pair_table button").each( function (index,element){
		$('#'+element.id).hide();
	});
}

function login(){

	//TODO:jump to the webpage directly
	if($('#login-button').html() == '登入'){

		// Show login button from API
		$('#login_dialog').modal('show');
		
	}else{

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
					$('#btn-showfriends').hide();
					$('#btn-public').hide();
					changeList();
					
					$('#login-button').html('登入');
				}
			}
		});

	}

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
			alert(data.responseJSON.message);
		},
		success: function(data){
			console.log(data);
			if(is_retrieve == 1){
				var count = parseInt($('#count_'+pid).html());
				$('#count_'+pid).html(count-1);
				$('#btn_'+pid).attr('class','btn btn-info');
				$('#btn_'+pid).attr('onclick','vote(' + pid + ',0)');
				$('#btn_'+pid).html('<img width="30" width="20" src="assets/img/heart.png"/> 在一起');
				
				//alert('Retrieved!');

			}else if(is_retrieve ==0){

				var count = parseInt($('#count_'+pid).html());
				$('#count_'+pid).html(count+1);
				$('#btn_'+pid).attr('class','btn btn-danger');
				$('#btn_'+pid).attr('onclick','vote(' + pid + ',1)');
				$('#btn_'+pid).html('<img width="30" width="20" src="assets/img/brokenheart.png"/> 分開吧');

				var msg = "Supported!";
				if(data['match'] == 1){
					msg += "\nIt's a match!";
				}
				//alert(msg);
				return data['pid'];
			}

		}
	});
}




$(document).ready(function() {
	
	FB.init({ appId: "520188428109474",
		status: true,
		cookie: true,
		xfbml: true,
		oauth: true
	});
	
	//check login status
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
			// List all existing Pairs
			listAllPairs(logged_in);
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
			
		} else if (response.status === "not_authorized") {  // 帳號沒有連結到 Facebook 程式
			alert("請允許授權！");
		} else {    // 帳號沒有登入
			// 在本例子中，此段永遠不會進入...XD
		}
	});

	//Select user
	//FIXME:can only display one user selector at one time
	$("#btn2").hide();
	$("#inputStr2").hide();
	$('#promote-button').click(function(){
		fbid1 = "";
		fbid2 = "";
		$('#user_table1 tr').empty();
		$('#user_table2 tr').empty();
		
		if(logged_in)
			$('#select_dialog1').modal('show');
		else
			$('#login_dialog').modal('show');
	});
	
	$("#btn1").click(function(){
			
		table_id = "user_table1";
		$('#user_table1 tr').empty();
		console.log("clear");
		finished_thread_count = 0;
		result = new Array();
		result1 = new Array();
		result2 = new Array();
		result3 = new Array();
		result4 = new Array();
		
		var input = $("#inputStr1").val();
		if(numericReg.test(input) || stringReg.test(input))
			getIDfromID(input); 
		
		else if(urlReg.test(input))
			getIDfromLink(input);
		else                  
			finished_thread_count++;
			
		if(nameReg.test(input))
		{                  
			getIDfromName_FQL(input);
			getIDfromName(input);
		}
		else
		{
			finished_thread_count += 2;
			check_if_finish_and_display_result();
		}   
	});	
	
	$("#btn2").click(function(){
			
		table_id = "user_table2";
		$('#user_table2 tr').empty();
		console.log("clear");
		finished_thread_count = 0;
		result = new Array();
		result1 = new Array();
		result2 = new Array();
		result3 = new Array();
		result4 = new Array();
		
		var input = $("#inputStr2").val();
		if(numericReg.test(input) || stringReg.test(input))
			getIDfromID(input); 
		
		else if(urlReg.test(input))
			getIDfromLink(input);
		else                  
			finished_thread_count++;
			
		if(nameReg.test(input))
		{                  
			getIDfromName_FQL(input);
			getIDfromName(input);
		}
		else
		{
			finished_thread_count += 2;
			check_if_finish_and_display_result();
		}   
	});	
	
	//promote new pair
	$('#confirm-button').on('click', function(){
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
				//update table
				updateTable();
			}
		});
	});
	

});
