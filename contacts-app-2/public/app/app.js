angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'emailController', 'managementController']) //'contactManagementController', 'contactControllers', 'contactServices'

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');
});
