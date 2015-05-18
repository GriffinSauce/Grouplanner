
(function() {
	'use strict';

	angular.module('grouplanner', ['ngResource', 'ngRoute'])
	.config(
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
			when('/groups/create', {
				templateUrl: 'components/create_group/create-group-view.html',
				controller: 'CreateGroupCtrl'
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
	)
	.factory('Groups', function($resource)
	{
		return $resource('/api/groups/:groupId', {groupId:'@_id'});
	});

}());
