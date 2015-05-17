(function() {
	'use strict';

	angular.module('grouplanner').directive("loginButtons", function()
	{
		return {
			restrict: "E",
			templateUrl: "partials/login_buttons/login_buttons.html",
			controller: function($scope, $location)
			{
	            $scope.providers = [
	                {
	                    name: "Google",
	                    path: "/auth/google"
	                },
	                {
	                    name: "Facebook",
	                    path: "/auth/facebook"
	                }

	            ];
			},
			controllerAs:'loginButtons'
		};
	});

}());
