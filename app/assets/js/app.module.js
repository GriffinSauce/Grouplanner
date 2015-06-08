
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
			when('/group', {
				templateUrl: 'components/groups/groups-view.html',
				controller: 'GroupsCtrl'
			}).
			when('/group/create', {
				templateUrl: 'components/create_group/create-group-view.html',
				controller: 'CreateGroupCtrl'
			}).
			when('/group/:groupId', {
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
	.factory('Group', function($resource)
	{
		return $resource('/api/group/:groupId', {groupId:'@_id'});
	});

}());
