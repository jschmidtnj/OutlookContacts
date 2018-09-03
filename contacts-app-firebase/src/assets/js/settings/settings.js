var jQuery = require("jquery");
require('jquery-validation');
require("popper.js");
require("bootstrap");
window.$ = window.jQuery = jQuery;

require('datatables.net-bs4');
require('datatables.net-responsive-bs4');
require('datatables.net-select-bs4');
require('datatables.net-bs4/css/dataTables.bootstrap4.min.css');
require('datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css');
require('datatables.net-select-bs4/css/select.bootstrap4.min.css');

var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
var config = require('../../../config/config.json');
firebase.initializeApp(config.firebase);

function handleError(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    //console.log(errorCode, errorMessage);
    var customMessage = "";
    if (errorCode == "auth/notsignedin") {
        customMessage = errorMessage;
    }
    if (error.code !== "" && error.message !== "") {
        if (customMessage !== "") {
            $('#error-info').text(customMessage);
        } else {
            $('#error-info').text("Error: " + errorMessage + " Code: " + errorCode);
        }
    } else {
        $('#error-info').text("No Error code found.");
    }
    $('#alertsignoutfailure').fadeIn();
    setTimeout(function () {
        $('#alertsignoutfailure').fadeOut();
    }, config.other.alerttimeout);
}

var tableInitialized = false;

function createLocationTable() {
    var ranonce = false;

    if (tableInitialized) {
        $('#locationlist').DataTable().destroy();
        tableInitialized = false;
    }

    function generateDatatable() {
        if (!(ranonce)) {
            $("#nolocationswarning").removeClass("collapse");
            $("#locationlistcollapse").addClass("collapse");
            $("#selectactions").addClass("collapse");
        } else {
            if (!(tableInitialized)) {
                $('#locationlist').DataTable({
                    responsive: true,
                    select: {
                        style: 'multi'
                    }
                });
                tableInitialized = true;
            }
        }
    }
    firebase.database().ref('locations').limitToLast(config.other.locationviewmax).once('value').then(function (locations) {
        var numlocations = locations.numChildren();
        var countlocations = 0;
        locations.forEach(function (location) {
            countlocations++;
            var locationId = location.key;
            //console.log(formId);
            var locationData = location.val();
            var locationName = locationData.name;
            var utctime = new Date(locationData.lastdownloaddate);
            var lastdownloaddate = utctime.toString();
            var numcontacts = locationData.numcontacts;
            $('#locationdata').append("<tr><td>" + locationName + "</td><td>" + lastdownloaddate +
                "</td><td>" + numcontacts + "</td><td><button value=\"" + locationId +
                "\" class=\"locationDelete btn btn-primary btn-block onclick=\"" +
                "void(0)\"\">Delete</button></td></tr>");
            if (!(ranonce)) {
                ranonce = true;
                $("#nolocationswarning").addClass("collapse");
                $("#locationlistcollapse").removeClass("collapse");
                $("#selectactions").removeClass("collapse");
            }
            if (countlocations == numlocations) {
                generateDatatable();
            }
        });
        setTimeout(function () {
            generateDatatable();
        }, config.other.datatimeout);
    }).catch(function (error) {
        handleError(error);
    });
}

function getInitialValues() {
    firebase.database().ref('users/' + window.userId).once('value').then(function (userData) {
        var userDataVal = userData.val();
        //console.log(userDataVal);
        var name = userDataVal.name;
        $("#fullname").val(name);
        var username = userDataVal.username;
        $("#username").val(username);
        if (window.userstatus == "admin") {
            console.log("admin");
            var emailnotificationssetting = userDataVal.notificationsettings.emailon;
            if (emailnotificationssetting) {
                $("#emailnotificationslabel").text("On");
                $("#emailnotifications").prop('checked', true);
            } else {
                $("#emailnotificationslabel").text("Off");
                $("#emailnotifications").prop('checked', false);
            }
            $("#changeLocationsCollapse").removeClass("collapse");
            createLocationTable();
        } else if (window.userstatus == "nonadmin") {
            console.log("nonadmin");
        }
    }).catch(function (err) {
        handleError(err);
    });
}

$(document).ready(function () {

    $('#toslink').attr('href', config.other.tosUrl);
    $('#privacypolicylink').attr('href', config.other.privacyPolicyUrl);

    var signed_in_initially = false;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            window.email = user.email;
            window.userId = firebase.auth().currentUser.uid;
            // User is signed in.
            //console.log("signed in");
            signed_in_initially = true;
            var testemail = new RegExp(config.regex.adminemailregex, 'g');
            if (testemail.test(window.email)) {
                window.userstatus = "admin";
            } else {
                window.userstatus = "nonadmin";
            }
            $(".logoutButton").on('click touchstart', function () {
                firebase.auth().signOut().then(function () {
                    // Sign-out successful.
                }).catch(function (error) {
                    // An error happened.
                    handleError(error);
                });
            });
            $("#email").text(window.email);
            $("#bodycollapse").removeClass("collapse");
            if (window.userstatus == "admin") {
                $("#changeNotificationsCollapse").removeClass("collapse");
                $("#emailnotifications").change(function () {
                    //console.log("changing approve notification setting");
                    var checked = this.checked;
                    if (checked) {
                        //console.log("check");
                        data = true;
                    } else {
                        //console.log("uncheck");
                        data = false;
                    }
                    var notificationsettingsData = {
                        emailon: checked
                    };
                    firebase.database().ref('users/' + window.userId).update({
                        notificationsettings: notificationsettingsData
                    }).catch(function (err) {
                        handleError(err);
                    });
                    $("#emailnotificationslabel").text(checked ? "On" : "Off");
                });
            } else if (window.userstatus == "nonadmin") {
                $("#changeNotificationsCollapse").addClass("collapse");
            }
            getInitialValues();
            //console.log(window.userstatus);
            //console.log(window.userId);
            firebase.database().ref('users/' + window.userId).once('value').then(function (userData) {
                //console.log("getting user data");
                var signintype = userData.val().signintype;
                //console.log(signintype);
                if (signintype == "email") {
                    $("#changePasswordCollapse").removeClass("collapse");
                } else {
                    $("#changePasswordCollapse").addClass("collapse");
                }
            }).catch(function (err) {
                handleError(err);
            });
        } else {
            // No user is signed in. redirect to login page:
            if (signed_in_initially) {
                $('#alertsignoutsuccess').fadeIn();
                setTimeout(function () {
                    $('#alertsignoutsuccess').fadeOut();
                    //console.log("redirecting to login page");
                    setTimeout(function () {
                        window.location.href = 'login.html';
                    }, config.other.redirecttimeout);
                }, config.other.alerttimeout);
            } else {
                //slow redirect
                handleError({
                    code: "auth/notsignedin",
                    message: "Not Signed in. Redirecting."
                });
                //console.log("redirecting to login page");
                setTimeout(function () {
                    window.location.href = 'login.html';
                }, config.other.redirecttimeout);
                //fast redirect
                // window.location.href = 'login.html';
            }
        }
    });

    function addLocation() {
        if ($("#addLocation").valid()) {
            console.log("location valid");
            var formData = $("#addLocation").serializeArray();
            //console.log(formData);
            var contactId = firebase.database().ref().child('functions').push().key;
            var locationName = formData[0].value.toString();
            var dateTime = Date.now();
            firebase.database().ref('locations/' + contactId).set({
                lastdownloaddate: dateTime,
                numcontacts: 0,
                name: locationName
            }).then(function () {
                // Update successful.
                //console.log("update success");
                $('#alertlocationadded').fadeIn();
                setTimeout(function () {
                    $('#alertlocationadded').fadeOut();
                }, config.other.alerttimeout);
                $('#addLocation')[0].reset();
                $("#locationdata").remove();
                $("#locationlist").append("<tbody id=\"locationdata\"></tbody>");
                createLocationTable();
            }).catch(function (error) {
                // An error happened.
                handleError(error);
            });
        }
    }
    $("#locationname").keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            addLocation();
        }
    });

    $("#addLocationSubmit").on('click touchstart', function () {
        addLocation();
    });

    $(document).on('click touchstart', ".locationDelete", function () {
        var valueArray = $(this).attr('value').split(',');
        var locationKey = valueArray[0];
        var started = false;

        function deleteLocation(locationKey) {
            //console.log("delete the form");
            firebase.database().ref('locations/' + locationKey).remove().then(function () {
                $("#locationdata").remove();
                $("#locationlist").append("<tbody id=\"locationdata\"></tbody>");
                setTimeout(function () {
                    $('#alertconfirmdeletelocation').fadeOut();
                }, config.other.alerttimeout);
                createLocationTable();
            }).catch(function (error) {
                handleError(error);
            });
        }

        $('#alertconfirmdeletelocation').fadeIn();
        $("#cancelDeleteLocation").on('click touchstart', function () {
            if (!started) {
                $('#alertconfirmdeletelocation').fadeOut();
                started = true;
            }
        });
        $("#confirmDeleteLocation").on('click touchstart', function () {
            if (!started) {
                deleteLocation(locationKey);
                started = true;
            }
        });
    });

    function changePasswordSub() {
        if ($("#changePassword").valid()) {
            var user = firebase.auth().currentUser;
            var formdata = $("#changePassword").serializeArray();
            var newPass = formdata[0].value.toString();
            user.updatePassword(newPass).then(function () {
                // Update successful.
                //console.log("update success");
                $('#alertpasswordchangesuccess').fadeIn();
                setTimeout(function () {
                    $('#alertpasswordchangesuccess').fadeOut();
                }, config.other.alerttimeout);
            }).catch(function (error) {
                // An error happened.
                handleError(error);
            });
        }
    }

    function changeUsernameSub() {
        if ($("#changeUsername").valid()) {
            var formdata = $("#changeUsername").serializeArray();
            var newUsername = formdata[0].value.toString();
            firebase.database().ref('users/' + window.userId).update({
                username: newUsername
            }).then(function () {
                // Update successful.
                //console.log("update success");
                $('#alertusernamechangesuccess').fadeIn();
                setTimeout(function () {
                    $('#alertusernamechangesuccess').fadeOut();
                }, config.other.alerttimeout);
            }).catch(function (error) {
                // An error happened.
                handleError(error);
            });
        }
    }

    function changeNameSub() {
        if ($("#changeName").valid()) {
            var formdata = $("#changeName").serializeArray();
            var name = formdata[0].value.toString();
            var firstandlast = name.split(" ");
            var first = firstandlast[0];
            var last = firstandlast.slice(1).join(' ');
            firebase.database().ref('users/' + window.userId).update({
                name: name,
                firstname: first,
                lastname: last
            }).then(function () {
                // Update successful.
                //console.log("update success");
                $('#alertnamechangesuccess').fadeIn();
                setTimeout(function () {
                    $('#alertnamechangesuccess').fadeOut();
                }, config.other.alerttimeout);
            }).catch(function (error) {
                // An error happened.
                handleError(error);
            });
        }
    }

    $("#deleteAccount").on('click touchstart', function () {
        var button = $(this);
        //console.log(button);
        var valueArray = button.attr('value').split(',');
        //console.log(valueArray);
        var started = false;
        $('#alertconfirmdeleteaccount').fadeIn();
        $("#cancelDeleteAccount").on('click touchstart', function () {
            if (!started) {
                $('#alertconfirmdeleteaccount').fadeOut();
                started = true;
            }
        });
        $("#confirmDeleteAccount").on('click touchstart', function () {
            if (!started) {
                var user = firebase.auth().currentUser;
                firebase.database().ref('users/' + window.userId).remove().catch(function (err) {
                    handleError(err);
                }).then(function () {
                    user.delete().then(function () {
                        // User deleted.
                        //console.log("user deleted");
                        window.location.href = "login.html";
                    }).catch(function (error) {
                        // An error happened.
                        handleError(error);
                    });
                });
            }
        });
    });

    $("#changeNameSubmit").on('click touchstart', function () {
        changeNameSub();
    });

    $("#fullname").keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            changeNameSub();
        }
    });

    $("#changeUsernameSubmit").on('click touchstart', function () {
        changeUsernameSub();
    });

    $("#username").keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            changeUsernameSub();
        }
    });

    $("#changePasswordSubmit").on('click touchstart', function () {
        changePasswordSub();
    });

    $("#confirm_password").keypress(function (event) {
        if (event.which == '13') {
            event.preventDefault();
            changePasswordSub();
        }
    });

    $.validator.addMethod(
        "regex1",
        function (value, element, regexp) {
            var re = new RegExp(regexp, 'i');
            return this.optional(element) || re.test(value);
        },
        ""
    );

    $.validator.addMethod(
        "regex2",
        function (value, element, regexp) {
            var re = new RegExp(regexp, 'i');
            return this.optional(element) || re.test(value);
        },
        ""
    );

    $.validator.addMethod(
        "regex3",
        function (value, element, regexp) {
            var re = new RegExp(regexp, 'i');
            return this.optional(element) || re.test(value);
        },
        ""
    );

    $("#addLocation").validate({
        rules: {
            locationname: {
                required: true
            }
        },
        messages: {
            fullname: "Please enter a location name"
        },
        errorElement: "div",
        errorPlacement: function (error, element) {
            // Add the `invalid-feedback` class to the div element
            error.addClass("invalid-feedback");
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });

    $("#changeName").validate({
        rules: {
            fullname: {
                required: true,
                regex1: config.regex.fullname
            }
        },
        messages: {
            fullname: "Please enter your full name"
        },
        errorElement: "div",
        errorPlacement: function (error, element) {
            // Add the `invalid-feedback` class to the div element
            error.addClass("invalid-feedback");
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });

    $("#changeUsername").validate({
        rules: {
            username: {
                required: true,
                minlength: 3,
                maxlength: 15
            }
        },
        messages: {
            username: {
                required: "Please enter a username",
                minlength: "Your username must consist of at least 3 characters",
                maxlength: "Your username cannot exceed 15 characters"
            }
        },
        errorElement: "div",
        errorPlacement: function (error, element) {
            // Add the `invalid-feedback` class to the div element
            error.addClass("invalid-feedback");
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });

    $("#changePassword").validate({
        rules: {
            password: {
                required: true,
                minlength: 6,
                maxlength: 15,
                regex1: config.regex.passwordcontainsletter,
                regex2: config.regex.passwordcontainsnumber,
                regex3: config.regex.passwordcontainsspecialcharacter
            },
            confirm_password: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            password: {
                required: "Please provide a password",
                minlength: "Your password must be at least 6 characters long",
                maxlength: "Your password cannot exceed 15 characters",
                regex1: "Your password must contain at least one alpha-numerical character",
                regex2: "Your password must contain at least one digit (0-9)",
                regex3: "Your password must contain at least one special character (!@#$%^&*)"
            },
            confirm_password: {
                required: "Please provide a password",
                equalTo: "Please enter the same password as above"
            }
        },
        errorElement: "div",
        errorPlacement: function (error, element) {
            // Add the `invalid-feedback` class to the div element
            error.addClass("invalid-feedback");
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });
});