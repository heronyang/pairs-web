if(!localStorage['base']){
	localStorage['base'] = prompt('請輸入要使用的 API Base URL (不用結尾斜線)', 'http://api.pairs.cc');
}

var api_base = localStorage['base'];
var logged_in = false;

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

});
