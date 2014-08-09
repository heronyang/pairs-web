//gain temporary accesstoken
//https://developers.facebook.com/tools/explorer/145634995501895/?method=GET&path=search%3Ftype%3Duser%26q%3DMaria%20Chao&version=v2.0
var accesstoken = 'CAAHZAG855RqIBADWcUZBonRMpCwXlQNgUsKOMWMrl4xa2DdK1qfzKLVqJYKZAjO7qYKFri2PIUPSinTJn7kGr7D7hepjOwt9Wb2fkKFOiy2jlFHUygkV5XyjOIBZBj9sKpnqFuhD9FU4NeiU4UvCCMWBnwFiGwdEFn1JjZBRlIdpJHjzL7A8KzPZB5x8VjyVmrqUL0RsTMM8B3G3Mf2LAxq61frKh1lkMZD';

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

var fbid1 = -1;
var fbid2 = -1;
var table_id = "";



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
					<td class=""> <button type="button" class="btn btn-info" id="btn_'+newdata['pid']+'" onclick="vote(' + newdata['pid'] + ',0)"><img width="30" width="20" src="assets/img/heart.png"/> 在一起</button> </td> \
				</tr>';
			$('#pair_table').append(row_html);
		}
	});

}
