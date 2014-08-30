var EMPTY = -1;

/* Regular Expression Rules */
var numericReg  = /^[0-9]+$/;
var stringReg   = /^[a-zA-Z0-9\.]+$/;
var urlReg      = /((https?:\/\/)?[\w-\.]+)$/;
var nameReg     = /^[^~`!@#$%^&*\/?]+\s?[^~`!@#$%^&*\/?]+$/;

var result = [null, null];  // user1 and user2

/*
 * FBIdConvertor:
 * - input: input string
 * - index: first user or second user
 * result
 * this function will update and select the FB user automatically
 */
function FBIdConvertor(input, index) {
    if(numericReg.test(input) || stringReg.test(input)) {
        getIDfromID(input, index);      // trigger
    } else if(urlReg.test(input)) {
        getIDfromURL(input, index);     // trigger
    }
}

function updateUIResult(index) {
    if(!result[index])  return;

    // get it!
    var id = result[index]["id"], name = result[index]["name"];
    console.log("get id=" + id + ", name=" + name);

    $('#us-img'+index).attr('src', 'http://graph.facebook.com/'+id+'/picture');
    $('#us-name'+index).text(name);
}

function getIDfromID(input, index){
    var weblink = 'http://graph.facebook.com/' + input;  
    $.getJSON(weblink, function(data){
        result[index] = {"id":data.id, "name":data.name};
        updateUIResult(index);
    }).fail(function() {
        // not found user will get 404, just ignore
    });
}

/* NOTE: this function can be improved */
function getIDfromURL(input, index){

    var words = input.split('/');
    var id = words[words.length-1];

    // case: https://www.facebook.com/100002177545908
    if(numericReg.test(id) || stringReg.test(id)){
        getIDfromID(id, index);
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
                getIDfromID(id, index);
            } else {
            }                         
        }
        else {
            // case: https://www.facebook.com/sunwolf.chang?fref=ts
            if(numericReg.test(id_2) || stringReg.test(id_2)) {
                getIDfromID(id_2, index);
            } else {
            }
        }
    }	
}
