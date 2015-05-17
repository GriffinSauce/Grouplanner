var app = angular.module('grouplanner', ['ngRoute']);

app.config(
    function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'components/home/home-view.html',
        controller: 'HomeCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
});