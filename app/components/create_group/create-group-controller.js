(function() {
    'use strict';

    angular.module('grouplanner').controller('CreateGroupCtrl', function($scope, $location, Group)
    {
        $scope.group = new Group();

        $scope.saveGroup = function(group)
        {
            group.$save(redirectToGroup);
        };

        function redirectToGroup(group)
        {
            $location.path('/group/' + group._id);
        }
    });
}());
