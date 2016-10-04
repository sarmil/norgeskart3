angular.module('searchResultsPanel')
    .directive('searchResultsPanel', [
        function() {
            return {
                templateUrl: 'components/transclusions/searchPanel/searchResultsPanel/searchResultsPanel.html',
                restrict: 'A',
                link: function(scope){
                    scope.husnummerChanged= function (searchResult, activeHusnummer) {
                        console.log(searchResult, activeHusnummer);
                    };
                }
            };
        }]);