(function() {
    'use strict';

	angular.module('grouplanner').controller('GroupCtrl', function ($scope, $routeParams, Group) {
		$scope.group = Group.get({groupId:$routeParams.groupId});
	});

})();
