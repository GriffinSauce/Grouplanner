(function() {
	'use strict';

	angular.module('grouplanner').controller('GroupsCtrl', function ($scope, Groups) {
		$scope.groups = Groups.query();
	});

}());
