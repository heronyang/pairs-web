var SEARCH_MAX = 30;
var EMPTY = -1;

var fbid1 = EMPTY;
var fbid2 = EMPTY;

var accesstoken = "";

// regular expressions for input string matching

var numericReg  = /^[0-9]+$/;
var stringReg   = /^[a-zA-Z0-9\.]+$/;
var urlReg      = /((https?:\/\/)?[\w-\.]+)$/;
var nameReg     = /^[^~`!@#$%^&*\/?]+\s?[^~`!@#$%^&*\/?]+$/;

// split name
var separator = /[\s-._]+/;

function pickUser1(id) {
	fbid1 = id;
}

function pickUser2(id) {
	fbid2 = id;
}

function newSearch(input, table, token){
	
	/* Private */
	var input = input;
	var table_id = table;
	var accessToken = token;
	var finished_thread_count = 0;

	var result = new Array();
	var result1 = new Array();
	var result2 = new Array();
	var result3 = new Array();
	var result4 = new Array();

	/* Public */
	this.getResult =
	function (){
	
		if(numericReg.test(input) || stringReg.test(input)) {
			getIDfromID();
        } else if(urlReg.test(input)) {
			getIDfromLink();
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
	}
	
	var getIDfromLink =
	function (){
		var words = input.split('/');
		var id = words[words.length-1];
		console.log("URL ID:"+id);

        // case: https://www.facebook.com/100002177545908
		if(numericReg.test(id) || stringReg.test(id)){
			getIDfromID_URL(id);
        } else {
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
					getIDfromID_URL(id);
                } else {
					finished_thread_count++;
					check_if_finish_and_display_result();
				}                         
			}
			else {
                // case: https://www.facebook.com/sunwolf.chang?fref=ts
				if(numericReg.test(id_2) || stringReg.test(id_2)) {
					getIDfromID_URL(id_2);
                } else {
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
	}

	var check_if_finish_and_display_result = 
	function(){
	
		var row_html ="";

		console.log("count = "+finished_thread_count);
		if ( finished_thread_count == 1 )
		{
			//No results
			//if(result1.length == 0 && result2.length == 0 && result3.length == 0 && result4.length == 0)
			if(result1.length == 0 && result2.length == 0)
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
