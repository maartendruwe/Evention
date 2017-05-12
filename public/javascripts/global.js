// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // Username link click
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Add User button click
    $('#btnAddUser').on('click', addUser);

    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

    // Login button click
    $('#btnLogin').on('click', loginRedirect);

    // Logout button click
    $('#btnLogout').on('click', logoutRedirect);

    // Local login
    $("#emailForm").hide();
    $("#divAddEmail").hide();
    $("#nameWarning").hide();
    $("#emailWarning").hide();
    $("#btnLocalLogin").click(function(e) {
        $("#emailForm").show();
	$("#divAddEmail").show();
        $("#btnLocalLogin").hide();
    });

    // Add email button click
    $('#btnAddEmail').on('click', addEmail);
    
    cookieValue = getCookie('viaMeraki');
    $("#btnInternet").show();
    if (cookieValue == 'false') {
        $("#btnInternet").hide();
    };
    // Give access to internet/'redirect to internet'
    $('#btnInternet').on('click', toInternet);
    //$('#userName').append(localStorage.getItem('userName'));

});

// Functions =============================================================

// Read cookies
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
};

function getCookie(name) {
  var regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
  var result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
};

// 'Redirect to internet'
function toInternet() {
    window.location.href = '/auth/tointernet';
    return false;
};
// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {

    // Stick our user data array into a userlist variable in the global object
    userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.name + '">' + this.name + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.name; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.name);
    $('#userInfoEmail').text(thisUserObject.email);
    $('#userInfoProvider').text(thisUserObject.provider);

};


// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'name': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'id': $('#addUser fieldset input#inputUserId').val(),
            'isAdmin': $('#addUser fieldset input#inputUserAdmin').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

// Redirect login button
function loginRedirect(event) {
    window.location.href = '/auth/spark';
    return false;
};

// Redirect logout button
function logoutRedirect(event) {
    window.location.href = '/logout';
    return false;
};


// Add Email
function addEmail(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    mailValid = true;
    nameValid = true;

    if (!isMailValid($('#emailForm input#inputEmail').val())) { 
        mailValid = false; //mail is invalid
    };

    if (!isNameValid($('#emailForm input#inputName').val())) {
        nameValid = false;
    };

    // Check and make sure errorCount's still at zero
    if(nameValid & mailValid) {

        // If it is, compile all user info into one object
        var newUser = {
            'name': $('#emailForm input#inputName').val(),
            'email': $('#emailForm input#inputEmail').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            if (typeof response.redirect == 'string') {

                // Clear the form inputs
                //$('#emailForm input').val('');
                //window.location.href = '/auth/local/callback';
                var nameOfUser = $("#inputName").val();
                //if (Storage !== "undefined") {
                //    localStorage.setItem('userName', nameOfUser);
                //}
                window.location.assign(response.redirect);

            }
            else {

            // If something goes wrong, alert the error message that our service returned
            //alert('Error: ' + response.msg);

            }
        });
    }
    else if (!nameValid & mailValid) { //name is invalid, email is OK
        $("#emailWarning").hide();
        $("#nameWarning").show();
        $("#inputName").removeClass('input--dirty input--valid').addClass('input--dirty input--invalid');
        $("#inputEmail").removeClass('input--dirty input--invalid').addClass('input--dirty input--valid');
        $("emailForm input#inputName").toggleClass('input--invalid');
        return false;
    }
    else if (nameValid & !mailValid) { //name is OK, email is invalid
        $("#nameWarning").hide();
        $("#emailWarning").show();
        $("#inputName").removeClass('input--dirty input--invalid').addClass('input--dirty input--valid');
        $("#inputEmail").removeClass('input--dirty input--valid').addClass('input--dirty input--invalid');
        return false;
    }
    else { //both are invalid
        $("#emailWarning").show();
        $("#inputName").removeClass('input--dirty input--valid').addClass('input--dirty input--invalid');
        $("#inputEmail").removeClass('input--dirty input--valid').addClass('input--dirty input--invalid');
        $("#nameWarning").show();
        return false;
    }
};

//Check email address validity
function isMailValid(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
};

function isNameValid(name_input) {
    nameValid = true;
    if (name_input.length < 2) {
        nameValid = false;
        };
    if (name_input.trim().split(/\s+/).length < 1) {
        nameValid = false;
        };

    return nameValid;
};
