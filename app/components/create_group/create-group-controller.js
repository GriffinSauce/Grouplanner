(function() {
    'use strict';

    angular.module('grouplanner').controller('CreateGroupCtrl', function($scope, $location, Groups)
    {
        $scope.group = new Groups();

        $scope.saveGroup = function(group)
        {
            group.$save(redirectToGroup);
        };

        function redirectToGroup(group)
        {
            $location.path('/groups/' + group._id);
        }
    });
}());
