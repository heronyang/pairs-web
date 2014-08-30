var SEARCH_MAX = 30;

var fbid1 = -1;
var fbid2 = -1;

var accesstoken = "";

//regular expressions for input string matching

var numericReg = /^[0-9]+$/;
var stringReg = /^[a-zA-Z0-9\.]+$/;
var urlReg = /((https?:\/\/)?[\w-\.]+)$/;
var nameReg = /^[^~`!@#$%^&*\/?]+\s?[^~`!@#$%^&*\/?]+$/;

//split name
var separator = /[\s-._]+/;

function pickUser1(id) {
	fbid1 = id;
}

function pickUser2(id) {
	fbid2 = id;
}

function newSearch(input, table, token){
	
	//private variables
	var input = input;
	var table_id = table;
	var accessToken = token;
	var finished_thread_count = 0;

	var result = new Array();
	var result1 = new Array();
	var result2 = new Array();
	var result3 = new Array();
	var result4 = new Array();

	//public function
	
	this.getResult =
	function (){
	
		if(numericReg.test(input) || stringReg.test(input))
			getIDfromID();

		else if(urlReg.test(input))
			getIDfromLink();
		else
			finished_thread_count++;

		if(nameReg.test(input))
		{
            // NOTE: don't do client-side FB login at this point
			// getIDfromName_FQL();
			// getIDfromName();
		}
		else
		{
			finished_thread_count += 2;
			check_if_finish_and_display_result();
		}
	}
	
	//private functions
	
	var getIDfromID =
	function (){
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
	
	var getIDfromLink =
	function (){
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
				{
					finished_thread_count++;
					check_if_finish_and_display_result();
				}                         
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
	
	var getIDfromID_URL =
	function (input_id){
		console.log("num:"+input_id);
		var weblink = 'http://graph.facebook.com/'+input_id;  
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
	
    /*
	var getIDfromName_FQL =
	function getIDfromName_FQL(){

		var weblink = 'https://graph.facebook.com/fql?access_token='+accessToken+'&q=user&q=SELECT uid,name FROM user WHERE uid IN (SELECT id FROM profile WHERE name="'+input+'")';
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
    */

    /*
	var getIDfromName =
	function (){
		count = 0;
		console.log("name:"+input);

		var weblink = 'https://graph.facebook.com/search?access_token='+accessToken+'&type=user&q='+input;
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
    */
	
	var match =
	function (Result,Input){
	
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
	
	var check_if_finish_and_display_result = 
	function(){
	
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
						  <td >'+ result1[1] +'</td>';
					if(table_id == "user_table1")			
						row_html += '<td ><button onclick="pickUser1(' + result1[0] + ')">select</button></td></tr>';
					else if(table_id == "user_table2")
						row_html += '<td ><button onclick="pickUser2(' + result1[0] + ')">select</button></td></tr>';
				
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
						  <td >'+result2[1]+'</td>';
					if(table_id == "user_table1")			
						row_html += '<td ><button onclick="pickUser1(' + result2[0] + ')">select</button></td></tr>';
					else if(table_id == "user_table2")
						row_html += '<td ><button onclick="pickUser2(' + result2[0] + ')">select</button></td></tr>';
					
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
						  <td >'+ result[i+1] +'</td>';
					if(table_id == "user_table1")			
						row_html += '<td ><button onclick="pickUser1(' + result[i] + ')">select</button></td></tr>';
					else if(table_id == "user_table2")
						row_html += '<td ><button onclick="pickUser2(' + result[i] + ')">select</button></td></tr>';
					
					$('#'+table_id).append(row_html);
				
					if(i == 58)
						break;
				}
			}
		}
	}
}


