var jQuery = require("jquery");
require('jquery-validation');
require("popper.js");
require("bootstrap");
window.$ = window.jQuery = jQuery;

var FileSaver = require('file-saver');
require("bootstrap-select");
require("bootstrap-select/dist/css/bootstrap-select.css");

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

var createdDownloadButton = false;

$(document).ready(function () {

    $('#toslink').attr('href', config.other.tosUrl);
    $('#privacypolicylink').attr('href', config.other.privacyPolicyUrl);
    $('#helplink').attr('href', config.other.helpPageUrl);

    function downloadCSV() {
        var BOM = "\uFEFF";
        var datastring = "";
        firebase.database().ref('locations/' + window.locationSelect).once('value').then(function (location) {
            var locationId = location.key;
            //console.log(locationId);
            var locationData = location.val();
            var contactIdData = locationData.contacts;
            if (contactIdData !== undefined) {
                $("#nodatawarning").addClass("collapse");
                //console.log(contactIdData);
                var locationname = locationData.name;
                var numcontacts = locationData.numcontacts;
                var numContactIterations = 0;
                for (var index in contactIdData) {
                    if (contactIdData.hasOwnProperty(index)) {
                        //console.log(contactIdData[index]);
                        var contactId = contactIdData[index].id;
                        //console.log(contactId);
                        firebase.database().ref('contacts/' + contactId).once('value').then(function (contact) {
                            var contactData = contact.val();
                            //console.log(contactData);
                            for (var i = 0; i < config.other.outlookfieldnames.length; i++) {
                                //replace / with - to avoid json key problems
                                var outlookfieldname = config.other.outlookfieldnames[i].replace('/', '-');
                                if (contactData.hasOwnProperty(outlookfieldname)) {
                                    var contactDataValue = contactData[outlookfieldname];
                                    if (outlookfieldname == "Notes") {
                                        contactDataValue = "\"" + contactDataValue + "\"";
                                    }
                                    datastring = datastring + contactDataValue + ",";
                                } else {
                                    datastring = datastring + ",";
                                }
                            }
                            datastring += "\r\n";
                            numContactIterations++;
                            if (numcontacts == numContactIterations) {
                                var csvData = BOM + datastring;
                                var blob = new Blob([csvData], {
                                    type: "text/csv;charset=utf-8"
                                });
                                var rightnow = new Date();
                                var datevalues = [
                                    rightnow.getFullYear(),
                                    rightnow.getMonth() + 1,
                                    rightnow.getDate(),
                                    rightnow.getHours(),
                                    rightnow.getMinutes(),
                                    rightnow.getSeconds()
                                ];
                                var filename = locationname + '-' + datevalues[0] + '-' + ("0" + datevalues[1]).slice(-2) + '-' + ("0" + datevalues[2]).slice(-2) + '-' + ("0" + datevalues[3]).slice(-2) + '-' + ("0" + datevalues[4]).slice(-2) + '.csv';
                                var dateTime = Date.now();
                                firebase.database().ref('locations/' + locationId).update({
                                    lastdownloaddate: dateTime,
                                    numcontacts: 0
                                }).then(function () {
                                    firebase.database().ref('locations/' + locationId + '/contacts').remove().then(function () {
                                        FileSaver.saveAs(blob, filename);
                                    }).catch(function (error) {
                                        handleError(error);
                                    });
                                }).catch(function (error) {
                                    handleError(error);
                                });
                            }
                        }).catch(function (error) {
                            handleError(error);
                        });
                    }
                }
            } else {
                //console.log("contact id data undefined");
                $("#nodatawarning").removeClass("collapse");
            }
        }).catch(function (error) {
            handleError(error);
        });
    }

    function createDownloadButton() {
        createdDownloadButton = true;
        $("#downloadLocationCSV").on('click touchstart', function () {
            downloadCSV();
        });
    }

    function createlocationSelect() {
        //console.log("Create location select");
        firebase.database().ref('locations').once('value').then(function (locations) {
            var locationSelectString = "<select class=\"selectpicker locationSelect\" data-live-search=\"true\" id=\"locationSelect\">" +
                "<option data-tokens=\"none\" value=\"\">none</option>";
            var numlocations = locations.numChildren();
            var countlocations = 0;
            locations.forEach(function (location) {
                countlocations++;
                var locationVal = location.val();
                var loctionId = location.key;
                //console.log("location data: " + locationVal, loctionId);
                var locationName = locationVal.name;
                //console.log(locationName);
                locationSelectString = locationSelectString + "<option data-tokens=\"" + locationName + "\" value=\"" + loctionId + "\">" + locationName + "</option>";
                if (countlocations == numlocations) {
                    locationSelectString = locationSelectString + "</select><br/><br/><br/><br/>";
                    $('#locationSelect').selectpicker('destroy');
                    $('#downloadSelectCollapse').append(locationSelectString);
                    $('#locationSelect').selectpicker();
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                        $('#locationSelect').selectpicker('mobile');
                    }
                    $('.selectpicker').selectpicker();
                    //console.log("location select: " + locationSelectString);
                    $('.locationSelect').on("change", function (elem) {
                        $("#nodatawarning").addClass("collapse");
                        // on select update locationSelect variable
                        //console.log($(this));
                        //console.log("changed value");
                        var locationSelect = elem.target.value;
                        //console.log("selected " + locationSelect);
                        //console.log(locationSelect);
                        if (locationSelect !== "") {
                            window.locationSelect = locationSelect;
                            $('#downloadButtonCollapse').removeClass("collapse");
                            if (!createdDownloadButton) {
                                createDownloadButton();
                            }
                        } else {
                            window.locationSelect = "";
                            $('#downloadButtonCollapse').addClass("collapse");
                        }
                    });
                    $("#downloadSelectCollapse").removeClass("collapse");
                }
            });
        }).catch(function (error) {
            handleError(error);
        });
    }

    function createContactSubmitForm() {
        if ($("#addContactForm").valid()) {
            //console.log("form valid");
            var formData = $("#addContactForm").serializeArray();
            //console.log(formData);
            var contactId = firebase.database().ref().child('contacts').push().key;
            var firstname = formData[0].value.toString();
            var lastname = formData[1].value.toString();
            var email = formData[2].value.toString();
            var companyname = formData[3].value.toString();
            var homestreet = formData[4].value.toString();
            var homecity = formData[5].value.toString();
            var homestate = formData[6].value.toString();
            var homepostalcode = formData[7].value.toString();
            var homecountry = formData[8].value.toString();
            var notes = formData[9].value.toString();
            firebase.database().ref('contacts/' + contactId).set({
                "First Name": firstname,
                "Last Name": lastname,
                "E-mail Address": email,
                "Company": companyname,
                "Home Street": homestreet,
                "Home City": homecity,
                "Home State": homestate,
                "Home Postal Code": homepostalcode,
                "Home Country-Region": homecountry,
                "Notes": notes
            }).then(function () {
                firebase.database().ref('locations').once('value').then(function (locations) {
                    var numlocations = locations.numChildren();
                    var countlocations = 0;
                    locations.forEach(function (location) {
                        countlocations++;
                        var locationId = location.key;
                        //console.log(locationId);
                        var locationData = location.val();
                        var numcontacts = locationData.numcontacts;
                        var newcontactnum = numcontacts + 1;
                        firebase.database().ref('locations/' + locationId + '/contacts/' + numcontacts).update({
                            id: contactId
                        }).then(function () {
                            if (countlocations == numlocations) {
                                firebase.database().ref('locations/' + locationId).update({
                                    numcontacts: newcontactnum
                                }).then(function () {
                                    //console.log("successful update");
                                }).catch(function (error) {
                                    handleError(error);
                                });
                            }
                        }).catch(function (error) {
                            handleError(error);
                        });
                    });
                }).catch(function (error) {
                    handleError(error);
                });
                // Update successful.
                //console.log("update success");
                setTimeout(function () {
                    $('#alertcontactadded').fadeIn();
                    setTimeout(function () {
                        $('#alertcontactadded').fadeOut();
                    }, config.other.alerttimeout);
                    $('#addContactForm')[0].reset();
                }, config.other.datatimeout);
            }).catch(function (error) {
                // An error happened.
                handleError(error);
            });
        }
    }

    function createValidation() {
        $.validator.addMethod(
            "regex",
            function (value, element, regexp) {
                var re = new RegExp(regexp, 'i');
                return this.optional(element) || re.test(value);
            },
            ""
        );
    
        $("#addContactForm").validate({
            rules: {
                firstname: {
                    required: true
                },
                lastname: {
                    required: true
                },
                email: {
                    regex: config.regex.validemail
                }
            },
            messages: {
                firstname: "Please enter a first name",
                lastname: "Please enter a last name",
                email: "Please enter a valid email"
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
    }

    var signed_in_initially = false;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            //console.log("signed in");
            window.email = user.email;
            var testemail = new RegExp(config.regex.adminemailregex, 'g');
            $("#bodycollapse").removeClass("collapse");
            $("#addContactCollapse").removeClass("collapse");
            createValidation();
            $("#addContactSubmit").on('click touchstart', function () {
                createContactSubmitForm();
            });
            if (!(testemail.test(window.email))) {
                //console.log("non-admin");
            } else {
                //console.log("admin");
                createlocationSelect();
            }
            signed_in_initially = true;
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

    $("#logoutButton").on('click touchstart', function () {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
        }).catch(function (error) {
            // An error happened.
            handleError(error);
        });
    });
});