angular.module('mainApp')
    .controller('mainAppController', ['$scope','ISY.MapAPI.Map','mainAppFactory','toolsFactory','ISY.EventHandler','isyTranslateFactory','$location','mainMenuPanelFactory', 'localStorageFactory',
        function($scope, map, mainAppFactory, toolsFactory, eventHandler, isyTranslateFactory, $location, mainMenuPanelFactory, localStorageFactory){

            function _initToolbar() {
                toolsFactory.initToolbar();
            }

            var _setSearch = function (obj) {
                if (!angular.equals(obj, $location.search())) {
                    var newSearch = angular.extend($location.search(), obj);
                    $location.search(newSearch);
                    mainMenuPanelFactory.setProjectById($location.search().project);
                }
            };

            function _viewChanged(obj) {
                $scope.$apply(function () {
                    _setSearch(obj);
                },0);
                localStorageFactory.set("lat", $location.search().lat);
                localStorageFactory.set("lon", $location.search().lon);
                localStorageFactory.set("zoom", $location.search().zoom);
            }

            function _registerEvents(){
                eventHandler.RegisterEvent(ISY.Events.EventTypes.MapConfigLoaded, _initToolbar);
                eventHandler.RegisterEvent(ISY.Events.EventTypes.MapMoveend, _viewChanged);
                // eventHandler.RegisterEvent(ISY.Events.EventTypes.ChangeLayers, _changedLayers);
            }

            function _initUrl() {
                var obj = $location.search();
                if (obj.zoom !== undefined && obj.lat !== undefined && obj.lon !== undefined){
                    if (localStorageFactory.get("zoom") !== null && localStorageFactory.get("lat") !== null && localStorageFactory.get("lon") !== null){
                        var center = {
                            "lon": localStorageFactory.get("lon"),
                            "lat": localStorageFactory.get("lat"),
                            "zoom": localStorageFactory.get("zoom")
                        };
                        map.SetCenter(center);
                    }
                }

                var newSearch = angular.extend($location.search(), obj);
                $location.search(newSearch);
            }

            $scope.initMainPage = function () {
                _registerEvents();
                map.SetTranslateOptions(isyTranslateFactory.getTranslateOptionsByActiveLanguage());
                map.SetImageInfoMarker("assets/img/pin-md-orange.png");
                mainAppFactory.updateMapConfig();
                var mapConfig = mainAppFactory.getMapConfig();

                map.Init('mapDiv', mapConfig);
                _initUrl();
            };


        }
    ]);