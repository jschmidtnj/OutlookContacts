angular.module('userServices', [])

.factory('User', function($http) {
    var contactFactory = {}; // Create the contactFactory object

    // Register users in database
    contactFactory.create = function(regData) {
        return $http.post('/api/users', regData);
    };

    // Check if username is available at registration
    contactFactory.checkUsername = function(regData) {
        return $http.post('/api/checkusername', regData);
    };

    // Check if e-mail is available at registration
    contactFactory.checkEmail = function(regData) {
        return $http.post('/api/checkemail', regData);
    };

    // Activate user account with e-mail link
    contactFactory.activateAccount = function(token) {
        return $http.put('/api/activate/' + token);
    };

    // Check credentials before re-sending activation link
    contactFactory.checkCredentials = function(loginData) {
        return $http.post('/api/resend', loginData);
    };

    // Send new activation link to user
    contactFactory.resendLink = function(username) {
        return $http.put('/api/resend', username);
    };

    // Send user's username to e-mail
    contactFactory.sendUsername = function(userData) {
        return $http.get('/api/resetusername/' + userData);
    };

    // Send password reset link to user's e-mail
    contactFactory.sendPassword = function(resetData) {
        return $http.put('/api/resetpassword', resetData);
    };

    // Grab user's information from e-mail reset link
    contactFactory.resetUser = function(token) {
        return $http.get('/api/resetpassword/' + token);
    };

    // Save user's new password
    contactFactory.savePassword = function(regData) {
        return $http.put('/api/savepassword', regData);
    };

    // Provide the user with a new token
    contactFactory.renewSession = function(username) {
        return $http.get('/api/renewToken/' + username);
    };

    // Get the current user's permission
    contactFactory.getPermission = function() {
        return $http.get('/api/permission/');
    };

    // Get all the users from database
    contactFactory.getUsers = function() {
        return $http.get('/api/management/');
    };

    // Get user to then edit
    contactFactory.getUser = function(id) {
        return $http.get('/api/edit/' + id);
    };

    // Delete a user
    contactFactory.deleteUser = function(username) {
        return $http.delete('/api/management/' + username);
    };

    // Edit a user
    contactFactory.editUser = function(id) {
        return $http.put('/api/edit', id);
    };

    return contactFactory; // Return contactFactory object
});
