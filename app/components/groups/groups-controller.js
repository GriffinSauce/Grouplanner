app.controller('GroupsCtrl', function ($scope, Groups) {
	$scope.groups = Groups.query();
});
