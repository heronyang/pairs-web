if(!localStorage['base']){
	localStorage['base'] = prompt('請輸入要使用的 API Base URL (不用結尾斜線)', 'http://api.pairs.cc');
}

//global variables

var api_base = localStorage['base'];
var logged_in = false;

var fbid1 = -1;
var fbid2 = -1;
var fbuser1 = "";
var fbuser2 = "";

var table_id = "";
//gain temporary accesstoken
//https://developers.facebook.com/tools/explorer/145634995501895/?method=GET&path=search%3Ftype%3Duser%26q%3DMaria%20Chao&version=v2.0
var accesstoken = 'CAACEdEose0cBAMmLZCBdFaQ1uCS9BbJJQgrxJLf3eRAZBXlVlPmDDwyx83BJp2hvgG4qUMTiMdAKzcAj6HkwLghlH6JZAb4ADPsxTDkEMr7RYF2qZB9oG6ZA9vyivZC7mGnT40FEmkVbkGZAWzU4miDAmhFRZCFCaZBujZBbl8szeZANHi1s1yryYC2Q3JzmY6bo5YqIFOZA70MEwiFbDSjskk3ILUYn7hSZCu6gZD';

//regular expressions for input string matching

var numericReg = /^[0-9]+$/;
var stringReg = /^[a-zA-Z0-9\.]+$/;
var urlReg = /((https?:\/\/)?[\w-\.]+)$/;
var nameReg = /^[^~`!@#$%^&*\/?]+\s?[^~`!@#$%^&*\/?]+$/;

//split name
var separator = /[\s-._]+/;

var SEARCH_MAX = 30;
var finished_thread_count = 0;

var result = new Array();
var result1 = new Array();
var result2 = new Array();
var result3 = new Array();
var result4 = new Array();


function load_pair_table() {
    var row_html1 = '<tr> <td class="pair_table_col_thumbnail1"><img src="http://www.pehub.com/wp-content/uploads/avatars/11839/9213ed45c2d7ad5d6e7f5742e35ec892-bpthumb.jpg" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> <td class="pair_table_col_thumbnail2"><img src="http://blogs.lincoln.ac.uk/wp-content/blogs.dir/1/files/avatars/7579/a4c2883d335e0436bf141d8eddbae261-bpthumb.jpg" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> <td class="pair_table_col_nama1">katty wang</td> <td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> <td class="pair_table_col_name2">阿明</td> <td class="pair_table_col_vote_count">12,099</td> <td class="pair_table_col_vote_unit">票</td><td class=""> <button type="button" class="btn btn-danger"><img width="30" width="20" src="assets/img/brokenheart.png"/> 分開吧</button> </td> </tr>';
    var row_html2 = '\
                    <tr> \
                        <td class="pair_table_col_thumbnail1"><img src="http://cs407120.vk.me/v407120518/29c7/0ab4IHzDdfc.jpg" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
                        <td class="pair_table_col_thumbnail2"><img src="https://secure.gravatar.com/avatar/2b8c78a329733d8b8c9ac7636a9534a8?d=mm&s=50&r=G" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
						\
                        <td class="pair_table_col_nama1">張大維</td> \
                        <td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
                        <td class="pair_table_col_name2">無名氏</td> \
                        <td class="pair_table_col_vote_count">8,290</td> \
                        <td class="pair_table_col_vote_unit">票</td> \
                        <td class=""> <button type="button" class="btn btn-info"><img width="30" width="20" src="assets/img/heart.png"/> 在一起</button> </td> \
                    </tr>';
    var times = 15;
    while(times--) {
        $('#pair_table').append(row_html1 + row_html2);
    }
}

function listAllPairs(logged_in){
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
				
				var row_html = '\
					<tr> \
						<td class="pair_table_col_thumbnail1"><img src="http://graph.facebook.com/'+ data['user1']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
						<td class="pair_table_col_thumbnail2"><img src="http://graph.facebook.com/'+ data['user2']['fbid_real'] +'/picture" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> \
						\
						<td class="pair_table_col_nama1">'+ data['user1']['name'] +'</td> \
						<td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> \
						<td class="pair_table_col_name2">'+ data['user2']['name'] +'</td> \
						<td class="pair_table_col_vote_count">' + data['count'] + '</td> \
						<td class="pair_table_col_vote_unit">票</td> \
						<td class=""> <button type="button" class="btn btn-info" id="btn_'+data['pid']+'" onclick="vote(' + data['pid'] + ',0)"><img width="30" width="20" src="assets/img/heart.png"/> 在一起</button> </td> \
					</tr>';
				//src="assets/img/brokenheart.png"
				$('#pair_table').append(row_html);
				if(!logged_in)
					$('#btn_'+data['pid']).hide();
			});
		}
	});
}

function changeList(logged_in)
{
	$("#pair_table button").each( function (index,element){
		if(logged_in)
			$('#'+element.id).show();
		else
			$('#'+element.id).hide();
	});
}

function login(){

	if($('#login-button').html() == '登入'){

		// Show login button from API

		$('#login_iframe').attr('src', api_base + '/login');
		$('#login_dialog').modal('show');
		
		logged_in = true;
		$('#btn-showfriends').show();
		changeList(logged_in);
		
		$('#login-button').html('登出');
		
	}else{

		// Call logout url

		$.ajax({
			type: "GET",
			dataType: "json",
			url: api_base + "/logout",
			error: function(data){
				// error
			},
			success: function(data){
				if(data['status'] == 0 && data['result'] == 'ok'){

					// Successfully logged out
					logged_in = false;
					$('#btn-showfriends').hide();
					changeList(logged_in);
					
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

				alert('Retrieved!');

			}else if(is_retrieve ==0){

				var msg = "Supported!";
				if(data['match'] == 1){
					msg += "\nIt's a match!";
				}
				alert(msg);
				return data['pid'];
			}

		}
	});
}

//Facebook User Selector functions
function pickUser(fbid,number)
{
	console.log("fbid=" + fbid);
	if(table_id == "user_table1")
	{
		fbid1 = fbid;
		$("#btn2").show();
		$("#inputStr2").show();
	}
	else
		fbid2 = fbid;
}

function check_if_finish_and_display_result()
{
	var row_html ="";

	console.log("count = "+finished_thread_count);
	if ( finished_thread_count == 3 )
	{
		//No results
		if(result1.length == 0 && result2.length == 0 && result3.length == 0 && result4.length == 0)
		{
			row_html = '\
				<tr> \
					<td >No results.</td> \
				</tr>';
			
			$('#'+table_id).append(row_html);
		}
		else
		{
			if(result1.length != 0)
			{
				row_html = '\
					<tr> \
						<td >(Search by URL)</td> \
					</tr>';	
				$('#'+table_id).append(row_html);
				
				row_html = '\
					<tr>  \
					  <td ><img src = "http://graph.facebook.com/'+result1[0]+'/picture"></img></td> \
					  <td >'+ result1[1] +'</td> \
					  <td ><button onclick="pickUser(' + result1[0] + ',1)">select</button></td>\
					</tr>';
				$('#'+table_id).append(row_html);
			}
			else if(result2.length != 0)
			{
				row_html = '\
					<tr> \
						<td >(Search by ID)</td> \
					</tr>';
				$('#'+table_id).append(row_html);
				
				row_html = '\
					<tr>  \
					  <td ><img src = "http://graph.facebook.com/'+result2[0]+'/picture"></img></td> \
					  <td >'+result2[1]+'</td> \
					  <td ><button onclick="pickUser(' + result2[0] + ',1)">select</button></td>\
					</tr>';
				$('#'+table_id).append(row_html);
			}
			
			//merge results
			result = result1.concat(result2);
			var index = result.length;
			for(var i = 0; i < result3.length; i+=2)
			{
				if(result.indexOf(result3[i]) == -1)
				{
					result = result.concat(result3[i]);		
					result = result.concat(result3[i+1]);
				}
			}
			for(var i=0; i < result4.length; i+=2)
			{
				if(result.indexOf(result4[i]) == -1)
				{
					result = result.concat(result4[i]);	
					result = result.concat(result4[i+1]);
				}
			}
			
			console.log(result);
			
			//print out remained results
			if(result.length != index)
			{
				row_html = '\
					<tr> \
						<td >(Search by name)</td> \
					</tr>';
			
				$('#'+table_id).append(row_html);
			}
			for(var i = index; i < result.length; i += 2)
			{
				row_html = '\
					<tr>  \
					  <td ><img src = "http://graph.facebook.com/'+ result[i] +'/picture"></img></td> \
					  <td >'+ result[i+1] +'</td> \
					  <td ><button onclick="pickUser(' + result[i] + ',1)">select</button></td>\
					</tr>';
				$('#'+table_id).append(row_html);
			
				if(i == 58)
					break;
			}
		}
	}

}

function getIDfromID(input)
{
	console.log("num:"+input);
	var weblink = 'http://graph.facebook.com/'+input;  
	console.log("link:"+weblink);
	
	$.getJSON(weblink, function(data){
		
		result2[result2.length] = data.id;
		result2[result2.length] = data.name;
		
		finished_thread_count++;
		check_if_finish_and_display_result();
		
	}).fail(function() {
		
		finished_thread_count++;
		check_if_finish_and_display_result();
		
		});
	;
}

function getIDfromID_URL(input,id_list)
{
	console.log("num:"+input);
	var weblink = 'http://graph.facebook.com/'+input;  
	console.log("link:"+weblink);
	
	$.getJSON(weblink, function(data){
			
		result1[result1.length] = data.id;
		result1[result1.length] = data.name;
		
		finished_thread_count++;
		check_if_finish_and_display_result();
		
	}).fail(function() {
		
		finished_thread_count++;
		check_if_finish_and_display_result();
		
		});
	;
}

function getIDfromName_FQL(input,id_list)
{

	var weblink = 'https://graph.facebook.com/fql?access_token='+accesstoken+'&q=user&q=SELECT uid,name FROM user WHERE uid IN (SELECT id FROM profile WHERE name="'+input+'")';
	console.log("link:"+weblink);
	
	$.get(weblink, function(data){
		
		var datas = JSON.stringify(data.data);
		
		if( datas.indexOf('{') != -1)
		{
			var words = datas.split("[{");
			datas = words[1];
			words = datas.split("}]");
			datas = words[0];
			words = datas.split("},{");
			console.log(words);
			
			for(var i = 0; i < words.length; i++)
			{
				if( i == SEARCH_MAX )
					break;
				
				var obj = JSON.parse("{"+words[i]+"}");
				result3[result3.length] = obj.uid.toString();
				result3[result3.length] = obj.name;						
			}
			
			finished_thread_count++;
			check_if_finish_and_display_result();
		}
		else
		{
			finished_thread_count++;
			check_if_finish_and_display_result();
		}
		
	}).fail(function() {
		
		finished_thread_count++;
		check_if_finish_and_display_result();
		
		});
	;
	
}


function getIDfromName(input,id_list)
{
	count = 0;
	console.log("name:"+input);

	var weblink = 'https://graph.facebook.com/search?access_token='+accesstoken+'&type=user&q='+input;
	console.log("link:"+weblink);
	
	$.get(weblink, function(data){
		
		var datas = JSON.stringify(data.data);
		
		if( datas.indexOf('{') != -1)
		{
			var words = datas.split("[{");
			datas = words[1];
			words = datas.split("}]");
			datas = words[0];
			words = datas.split("},{");
			
			var matchCount = 0;
			var matchResult = new Array();
			
			
			for(var i = 0; i < words.length; i++)
			{
				var obj = JSON.parse("{"+words[i]+"}");

				var t_match = match(obj.name,input);
				if( t_match == 0 )
				{
					result4[result4.length] = obj.id;
					result4[result4.length] = obj.name;
					
					count ++;
					matchCount ++;
				}
				else if( t_match == 1 )
				{
					count ++;
					matchResult[matchResult.length] = obj.id+"?"+obj.name;
				}

				if(count == 30)
						break;
			}
			
			if(count != 0)
			{
				matchCount++;
				for(var i = 0; i < matchResult.length; i++)
				{
					var m_data = matchResult[i].split("?");
					
					result4[result4.length] = m_data[0];
					result4[result4.length] = m_data[1];
				}
			}

			finished_thread_count++;
			check_if_finish_and_display_result();
			
		}
		else
		{
			finished_thread_count++;
			check_if_finish_and_display_result();
		}	
		
	}).fail(function() {
	
		finished_thread_count++;
		check_if_finish_and_display_result();
		
		});
	;
}

function getIDfromLink(input,id_list)
{
	var words = input.split('/');
	var id = words[words.length-1];
	console.log("URL ID:"+id);
	if(numericReg.test(id) || stringReg.test(id)) //https://www.facebook.com/100002177545908
		getIDfromID_URL(id);
	else
	{
		words = id.split('?');
		var id_2 = words[0];
		if(id_2 == 'profile.php') //https://www.facebook.com/profile.php?id=100002177545908
		{							//https://www.facebook.com/profile.php?id=100001326482055&fref=pb&hc_location=friends_tab
			words = id.split('=');
			id = words[1];
			words = id.split('&');
			id = words[0];
			if(numericReg.test(id) || stringReg.test(id)) 
				getIDfromID_URL(id);
			else
				document.getElementById('url_ID').innerHTML="No results!";                           
		}
		else //https://www.facebook.com/sunwolf.chang?fref=ts
		{
			if(numericReg.test(id_2) || stringReg.test(id_2)) 
				getIDfromID_URL(id_2);
			else
			{
				finished_thread_count++;
				check_if_finish_and_display_result();
			}
		}
	}	
}
function match(Result,Input)
{
	var result = Result.toLowerCase();
	var input = Input.toLowerCase();
	
	var segment = input.split(separator);
	var notmatch = 0;
	for (var i = 0; i < segment.length; i++)
	{
		if(result.indexOf(segment[i]) == -1)
		{
			notmatch ++;
			break;
		}
	}
	segment = result.split(separator);
	for (var i = 0; i < segment.length; i++)
	{
		if(input.indexOf(segment[i]) == -1)
		{
			notmatch ++;
			break;
		}
	}
	return notmatch;
}

function updateTable()
{
	$.ajax({
		type: "GET",
		dataType: "json",
		url: api_base + "/",
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
					<td class=""> <button type="button" class="btn btn-info" id="btn_'+newdata['pid']+'" onclick="vote(' + newdata['pid'] + ',0)"><img width="30" width="20" src="assets/img/heart.png"/> 在一起</button> </td> \
				</tr>';
			$('#pair_table').append(row_html);
		}
	});

}



$(document).ready(function() {
	
	//check login status
	$.ajax({
		type: "GET",
		dataType: "json",
		url: api_base + '/login_status',
		error: function(data){
			// error
		},
		success: function(data){
			if(data['status'] == 1){

				// Logged in
				logged_in = true;
				$('#login-button').html('登出');
				$('#btn-showfriends').show();

			}else{

				// Not logged in
				logged_in = false;	
				$('#login-button').html('登入');
				$('#btn-showfriends').hide();
				
			}

			$('#login-button').on('click', login);

		}
	});


	// List all existing Pairs	 
	listAllPairs(logged_in);
	
	$("#btn2").hide();
	$("#inputStr2").hide();
	$('#promote-button').click(function(){	
		$('#select_dialog1').modal('show');
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
