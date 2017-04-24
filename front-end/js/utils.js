//This script contains functions and utils for working with REST web-service

//----Functions for working with REST web-service----//

// Function for authorization
// param - data is used for storing user login and password
function authorization(data){
    $.ajax({
        data: data,
	    dataType: 'json',
 		contentType: "application/json; charset=utf-8",
        timeout: 10000,
        type: 'POST',
        url: 'http://localhost:8080/taxi-online-service/api/v1/auth/login/'
 
    }).done(function(data, textStatus, jqXHR) {
        //Need to dave user data
        saveUserData(data);
        //TO-DO Redirect to user page (passenger or driver)
        var redirectPage = "index.html";
        if(data.data.role == "PASSENGER") {
           redirectPage = "user_profile.html"
        }
        else if(data.data.role == "DRIVER"){
            redirectPage = "user_profile.html"
        }
        window.location.href = redirectPage;
 
    }).fail(function(jqXHR, textStatus, errorThrown) {
    	//TO-DO   Add some special futures here
        alert('Некорректный логин или пароль!');
    });	
}

//-----Special utils for REST client-----//

//Util which include an authorization header in request
// param:  xhr - XMLHttpRequest
//		   data - JSON account data (get from cookie)
function makeAuthorizationHeader(xhr, data) {
    xhr.setRequestHeader("Authorization", 
        "Basic " + btoa(data.username + ":" + data.password));
}

//Util for creating JSON login and password data
function createAuthorizationJSONData(){
	var json = {
		'username': $('#username').val(), 
		'password': $('#password').val()
	}; 
	return json;
}

//Util for saving user-info data into Cookie
// param: data - account information
function saveUserData(data){
    // Need to save the account data in order to provide basic authorization feature
    data.data.password = createAuthorizationJSONData().password;
    Cookies.set('user-info', JSON.stringify(data.data));
}