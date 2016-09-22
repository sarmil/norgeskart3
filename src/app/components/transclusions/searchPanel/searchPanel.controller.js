angular.module('searchPanel')
    .controller('searchPanelController', ['$scope',
        function($scope){

            $scope.showSearchResultPanel = function () {
                $scope.searchPanelLayout = "searchResultsPanel";
            };

            $scope.showSearchOptionsPanel = function () {
                $scope.searchPanelLayout = "searchOptionsPanel";
            };

            $scope.searchPanelLayout = "searchResultsPanel";

            $scope.showSearchSeEiendomPanel = function () {
                $scope.activeSearchOptionOrder = ['kommunenr', 'gardsnr', 'bruksnr', 'festenr', 'seksjonsnr', 'eiendomstype', 'matrikkelnr'];
                $scope.activeSearchOption = $scope.searchOptionsDict['seEiendom'];
                $scope.searchPanelLayout = "searchSeEiendomPanel";
            };

            $scope.searchOptionsDict = {};

            $scope.showKoordTransPanel = function () {
                $scope.searchPanelLayout = "searchKoordTransPanel";
            };
        }
    ]);