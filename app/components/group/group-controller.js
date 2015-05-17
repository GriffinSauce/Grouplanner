app.controller('GroupCtrl', function ($scope, $routeParams, Groups) {
	$scope.group = Groups.get({groupId:$routeParams.groupId});
});
