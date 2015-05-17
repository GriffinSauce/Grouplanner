var app = angular.module('grouplanner', ['ngResource', 'ngRoute']);

app.config(
	function($routeProvider, $locationProvider) {
		$routeProvider.
		when('/', {
			templateUrl: 'components/home/home-view.html',
			controller: 'HomeCtrl'
		}).
		when('/groups', {
			templateUrl: 'components/groups/groups-view.html',
			controller: 'GroupsCtrl'
		}).
		when('/groups/:groupId', {
			templateUrl: 'components/group/group-view.html',
			controller: 'GroupCtrl'
		}).
		when('/login', {
			templateUrl: 'components/login/login-view.html',
			controller: 'LoginCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});

		// enable html5Mode for pushstate ('#'-less URLs)
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
	}
);

app.factory('Groups', function($resource)
{
	return $resource('/api/groups/:groupId', {groupId:'@_id'});
});
