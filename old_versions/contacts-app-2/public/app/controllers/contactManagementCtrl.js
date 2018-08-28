angular.module('contactManagementController', [])

// Controller: contact to control the management page and managing of contact accounts
.controller('contactManagementCtrl', function(Contact, $scope) {
    var app = this;

    app.loading = true; // Start loading icon on page load
    app.accessDenied = true; // Hide table while loading
    app.errorMsgContacts = false; // Clear any error messages
    app.editAccess = false; // Clear access on load
    app.deleteAccess = false; // CLear access on load
    app.limitContacts = 5; // Set a default limit to ng-repeat
    app.searchLimitContacts = 0; // Set the default search page results limit to zero

    // Function: get all the contacts from database
    function getContacts() {
        // Runs function to get all the contacts from database
        Contact.getContacts().then(function(data) {
            // Check if able to get data from database
            if (data.data.success) {
              app.contacts = data.data.contacts; // Assign contacts from database to variable
              app.accessDenied = false; // Show table
              app.loading = false; // Stop loading icon
              app.editAccessContacts = true; // Show edit button
            } else {
                app.errorMsgContacts = data.data.message; // Set error message
                app.loading = false; // Stop loading icon
            }
        });
    }

    getContacts(); // Invoke function to get contacts from databases

    // Function: Show more results on page
    app.showMoreContacts = function(number) {
        app.showMoreContactsError = false; // Clear error message
        // Run functio only if a valid number above zero
        if (number > 0) {
            app.limit = number; // Change ng-repeat filter to number requested by contact
        } else {
            app.showMoreContactsError = 'Please enter a valid number'; // Return error if number not valid
        }
    };

    // Function: Show all results on page
    app.showAllContacts = function() {
        app.limitContacts = undefined; // Clear ng-repeat limit
        app.showMoreContactsError = false; // Clear error message
    };

    // Function: Delete a contact
    app.deleteContact = function(email) {
        // Run function to delete a contact
        Contact.deleteContact(email).then(function(data) {
            // Check if able to delete contact
            if (data.data.success) {
                getContacts(); // Reset contacts on page
            } else {
                app.showMoreContactsError = data.data.message; // Set error message
            }
        });
    };

    // Function: Perform a basic search function
    app.searchContacts = function(searchKeyword, number) {
        // Check if a search keyword was provided
        if (searchKeyword) {
            // Check if the search keyword actually exists
            if (searchKeyword.length > 0) {
                app.limitContacts = 0; // Reset the limit number while processing
                $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the contact
                app.limit = number; // Set the number displayed to the number entered by the contact
            } else {
                $scope.searchFilter = undefined; // Remove any keywords from filter
                app.limitContacts = 0; // Reset search limit
            }
        } else {
            $scope.searchFilter = undefined; // Reset search limit
            app.limitContacts = 0; // Set search limit to zero
        }
    };

    // Function: Clear all fields
    app.clearContacts = function() {
        $scope.number = 'Clear'; // Set the filter box to 'Clear'
        app.limitContacts = 0; // Clear all results
        $scope.searchKeyword = undefined; // Clear the search word
        $scope.searchFilter = undefined; // Clear the search filter
        app.showMoreContactsError = false; // Clear any errors
    };

    // Function: Perform an advanced, criteria-based search
    app.advancedSearchContacts = function(searchByEmail, searchByName) {
        // Ensure only to perform advanced search if one of the fields was submitted
        if (searchByEmail || searchByName) {
            $scope.advancedSearchFilterContacts = {}; // Create the filter object
            if (searchByEmail) {
                $scope.advancedSearchFilter.email = searchByEmail; // If email keyword was provided, search by email
            }
            if (searchByName) {
                $scope.advancedSearchFilter.name = searchByName; // If name keyword was provided, search by name
            }
            app.searchLimitContacts = undefined; // Clear limit on search results
        }
    };

    // Function: Set sort order of results
    app.sortOrderContacts = function(order) {
        app.sortContacts = order; // Assign sort order variable requested by contact
    };
})

// Controller: Used to edit contacts
.controller('editContactsCtrl', function($scope, $routeParams, Contact, $timeout) {
    var app = this;
    $scope.nameTabContact = 'active'; // Set the 'name' tab to the default active tab
    app.phase1Contact = true; // Set the 'name' tab to default view

    // Function: get the contact that needs to be edited
    Contact.getContact($routeParams.id).then(function(data) {
        // Check if the contact's _id was found in database
        if (data.data.success) {
            $scope.newName = data.data.contact.name; // Display contact's name in scope
            $scope.newEmail = data.data.contact.email; // Display contact's e-mail in scope
            $scope.newPermission = data.data.contact.permission; // Display contact's permission in scope
            app.currentContact = data.data.contact._id; // Get contact's _id for update functions
        } else {
            app.errorMsgContacts = data.data.message; // Set error message
            $scope.alert = 'alert alert-danger'; // Set class for message
        }
    });

    // Function: Set the name pill to active
    app.namePhaseContact = function() {
        $scope.nameTab = 'active'; // Set name list to active
        $scope.emailTab = 'default'; // Clear email class
        app.phase1Contact = true; // Set name tab active
        app.phase2Contact = false; // Set e-mail tab inactive
        app.errorMsgContacts = false; // Clear error message
    };

    // Function: Set the e-mail pill to active
    app.emailPhaseContact = function() {
        $scope.nameTab = 'default'; // Clear name class
        $scope.emailTab = 'active'; // Set e-mail list to active
        app.phase1 = false; // Set name tab to inactive
        app.phase2 = true; // Set e-mail tab to active
        app.errorMsgContacts = false; // Clear error message
    };

    // Function: Update the contact's name
    app.updateNameContact = function(newName, valid) {
        app.errorMsgContacts = false; // Clear any error messages
        app.disabledContacts = true; // Disable form while processing
        // Check if the name being submitted is valid
        if (valid) {
            var contactObject = {}; // Create a contact object to pass to function
            contactObject._id = app.currentcontact; // Get _id to search database
            contactObject.name = $scope.newName; // Set the new name to the contact
            // Runs function to update the contact's name
            contact.editContact(contactObject).then(function(data) {
                // Check if able to edit the contact's name
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsgContacts = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.nameFormContacts.name.$setPristine(); // Reset name form
                        app.nameFormContacts.name.$setUntouched(); // Reset name form
                        app.successMsg = false; // Clear success message
                        app.disabledContacts = false; // Enable form for editing
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsgContacts = data.data.message; // Clear any error messages
                    app.disabledContacts = false; // Enable form for editing
                }
            });
        } else {
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsgContacts = 'Please ensure form is filled out properly'; // Set error message
            app.disabledContacts = false; // Enable form for editing
        }
    };

    // Function: Update the contact's e-mail
    app.updateEmailContact = function(newEmail, valid) {
        app.errorMsgContacts = false; // Clear any error messages
        app.disabledContacts = true; // Lock form while processing
        // Check if submitted e-mail is valid
        if (valid) {
            var contactObject = {}; // Create the contact object to pass in function
            contactObject._id = app.currentContact; // Get the contact's _id in order to edit
            contactObject.email = $scope.newEmail; // Pass the new e-mail to save to contact in database
            // Run function to update the contact's e-mail
            contact.editContact(contactObject).then(function(data) {
                // Check if able to edit contact
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsgContacts = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.emailFormContacts.email.$setPristine(); // Reset e-mail form
                        app.emailFormContacts.email.$setUntouched(); // Reset e-mail form
                        app.successMsgContacts = false; // Clear success message
                        app.disabledContacts = false; // Enable form for editing
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsgContacts = data.data.message; // Set error message
                    app.disabledContacts = false; // Enable form for editing
                }
            });
        } else {
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsgContacts = 'Please ensure form is filled out properly'; // Set error message
            app.disabledContacts = false; // Enable form for editing
        }
    };
});
