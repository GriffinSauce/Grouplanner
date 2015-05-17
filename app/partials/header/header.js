app.directive("headerView", function()
{
	return {
		restrict: "E",
		templateUrl: "partials/header/header-view.html",
		controller: function($scope, $location)
		{
			$scope.logout = function()
			{
				$location.path('logout');
			};
		},
		controllerAs:'header'
	};
});