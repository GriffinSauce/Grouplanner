(function() {
    'use strict';

	angular.module('grouplanner').controller('GroupCtrl', function ($scope, $routeParams, Groups) {
		$scope.group = Groups.get({groupId:$routeParams.groupId});
	});

})();
