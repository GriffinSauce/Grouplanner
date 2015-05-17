
(function() {
	'use strict';

	angular.module('grouplanner').directive("headerView", function()
	{
		return {
			restrict: "E",
			templateUrl: "partials/header/header-view.html",
			controller: headerController,
			controllerAs:'header'
		};

		function headerController($scope, $location)
		{
			$scope.back = function()
			{
				window.history.back();
			};

			$scope.logout = function()
			{
				$location.path('logout');
			};
		}
	});

}());
