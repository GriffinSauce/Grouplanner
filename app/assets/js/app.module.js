var app = angular.module('grouplanner', ['ngRoute']);

app.config(
    function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'components/home/home-view.html',
        controller: 'HomeCtrl'
      }).
      when('/app/groups', {
        templateUrl: 'components/groups/groups-view.html',
        controller: 'GroupsCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
});