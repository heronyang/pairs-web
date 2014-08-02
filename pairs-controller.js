function load_pair_table() {
    var row_html1 = '<tr> <td class="pair_table_col_thumbnail1"><img src="http://www.pehub.com/wp-content/uploads/avatars/11839/9213ed45c2d7ad5d6e7f5742e35ec892-bpthumb.jpg" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> <td class="pair_table_col_thumbnail2"><img src="http://blogs.lincoln.ac.uk/wp-content/blogs.dir/1/files/avatars/7579/a4c2883d335e0436bf141d8eddbae261-bpthumb.jpg" class="img-responsive img-circle" alt="Thumbnail Image" ></img></td> <td class="pair_table_col_nama1">katty wang</td> <td class="pair_table_col_heart"><i class="glyphicon glyphicon-heart heartc"></i></td> <td class="pair_table_col_name2">阿明</td> <td class="pair_table_col_vote_count">12,099</td> <td class="pair_table_col_vote_unit">票</td> </tr>';
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
                    </tr>';
    var times = 15;
    while(times--) {
        $('#pair_table').append(row_html1 + row_html2);
    }
}

$(document).ready(function() {
    // load table, just for template testing
    load_pair_table();
});
