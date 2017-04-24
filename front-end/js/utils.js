//This script contains functions and utils for working with REST web-service

//----Functions for working with REST web-service----//

// Function for authorization
// param: data - user login and password
function authorization(data) {
    $.ajax({
        data: data,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        timeout: 10000,
        type: 'POST',
        url: 'http://localhost:8080/taxi-online-service/api/v1/auth/login/'

    }).done(function (data, textStatus, jqXHR) {
        // Need to dave user data
        saveUserData(data);
        // Redirect to account page (passenger or driver)
        var redirectPage = "index.html";
        if (data.data.role === "PASSENGER") {
            redirectPage = "user_profile.html"
        }
        else if (data.data.role === "DRIVER") {
            redirectPage = "driver_profile.html"
        }
        window.location.href = redirectPage;

    }).fail(function (jqXHR, textStatus, errorThrown) {

        $('.alert.danger').html('<span class="closebtn" onclick="toggle()">&times;</span><strong>Ошибочка!</strong> Некорректный логин или пароль!').show();
        //alert('Некорректный логин или пароль!');
    });
}

//Logout function
function logout() {
    if (!!Cookies.get('user-info')) {
        Cookies.remove('user-info');
    }
    window.location.href = 'index.html';
    //Need for <a href="" ...></a> to disable hyperlink
    return false;
}

// Function for taxi booking
// param - data is used for storing user login and passwor
function taxiBooking(data) {
    $.ajax({
        data: data,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        timeout: 10000,
        type: 'POST',
        beforeSend: function(xhr){
            var user = JSON.parse(Cookies.get('user-info'));
            xhr.setRequestHeader("Authorization",
                "Basic " + btoa(user.username + ":" + user.password));
        },
        url: 'http://localhost:8080/taxi-online-service/api/v1/booking/'

    }).done(function (data, textStatus, jqXHR) {
        //TODO message
        window.location.href = "order.html";

    }).fail(function (jqXHR, textStatus, errorThrown) {
        //TODO notification
        alert('error');
        $('.alert.danger').html('<span class="closebtn" onclick="toggle()">&times;</span><strong>Ошибочка!</strong> Нельзя заказать такси!').show();
    });
}

// Function for find active booking for user
// param: data - user login
function findActiveBooking() {
    $.ajax({
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        timeout: 10000,
        type: 'GET',
        beforeSend: function(xhr){
            var user = JSON.parse(Cookies.get('user-info'));
            xhr.setRequestHeader("Authorization",
                "Basic " + btoa(user.username + ":" + user.password));
        },
        url: 'http://localhost:8080/taxi-online-service/api/v1/booking/active/'

    }).done(function (data, textStatus, jqXHR) {
        if(data.status === "0") {
            $('.options__current_order>p').html("Из " + data.data.route.start_address.address + " в " + data.data.route.end_address.address + ". " + data.data.cost + " руб.");
        }

    }).fail(function (jqXHR, textStatus, errorThrown) {
        //TODO notification
        alert('error');
    });
}

//-----Special utils for REST client-----//

//Util which include an authorization header in request
// param:  xhr - XMLHttpRequest
//		   data - JSON account data (get from cookie)
function createAuthorizationHeader(xhr, data) {
    xhr.setRequestHeader("Authorization",
        "Basic " + btoa(data.username + ":" + data.password));
}

// Util for creating JSON login and password data
function createAuthorizationJSONData() {
    var json = {
        'username': $('#username').val(),
        'password': $('#password').val()
    };
    return json;
}

// Util for creating JSON booking data
function createTaxiBookingJSONData() {
    var json = getRouteInformaton();
    json.passenger_username = JSON.parse(Cookies.get('user-info')).username;
    json.number_passengers = $('#numberPassengers').val();
    return json;
}

// Util for saving user-info data into Cookie
// param: data - account information
function saveUserData(data) {
    // Need to save the account data in order to provide basic authorization feature
    data.data.password = createAuthorizationJSONData().password;
    Cookies.set('user-info', JSON.stringify(data.data));
}

//Util for calculation cost of trip
// param: distance - distance of a route in km
//        duration - approximate time im minutes
function calculateTripCost(distance, duration) {

    //Define variables
    var pickUpCost = 4.5;
    var kilometerCost = 0.85;
    var minuteCost = 0.14;

    var costDistance = distance * kilometerCost;
    var costDuration = duration * minuteCost;

    return costDistance + costDuration / 10 + pickUpCost;
}