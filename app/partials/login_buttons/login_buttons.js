app.directive("loginButtons", function()
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

			$scope.login = function(provider)
			{
				$location.path(provider.path);
			};
		},
		controllerAs:'loginButtons'
	};
});
