var app = angular.module('grouplanner', ['ngRoute']);

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
		otherwise({
			redirectTo: '/'
		});
		
		// enable html5Mode for pushstate ('#'-less URLs)
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
	}
);