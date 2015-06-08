(function() {
	'use strict';

	angular.module('grouplanner').controller('GroupsCtrl', function ($scope, Group) {
		$scope.groups = Group.query();
	});

}());
