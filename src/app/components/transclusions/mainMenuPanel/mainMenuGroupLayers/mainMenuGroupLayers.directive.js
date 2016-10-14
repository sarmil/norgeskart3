angular.module('mainMenuGroupLayers')
    .directive('mainMenuGroupLayers', ['ISY.MapAPI.Map','mainMenuPanelFactory',
        function(map, mainMenuPanelFactory) {
            return {
                templateUrl: 'components/transclusions/mainMenuPanel/mainMenuGroupLayers/mainMenuGroupLayers.html',
                restrict: 'A',
                link: function(scope){

                    var overlayLayers = map.GetOverlayLayers();

                    scope.selectedProject = mainMenuPanelFactory.getSelectedProject();
                    scope.groupLayers = map.GetGroups();

                    var _updateGroupState = function(group){
                        if (group!==undefined){
                            var isyLayers = group.isyLayers || [];
                            group.isAllLayersSelected = true;
                            group.groupIsVisible = true;
                            group.isPartiallyVisible = false;
                            var bVisibleLayers = 0;
                            for (var i = 0; i < isyLayers.length; i++) {
                                if (!isyLayers[i].isVisible) {
                                    group.isAllLayersSelected = false;
                                    group.groupIsVisible = false;
                                }else{
                                    bVisibleLayers += 1;
                                }
                            }

                            if (bVisibleLayers !== isyLayers.length && bVisibleLayers !== 0){
                                group.isPartiallyVisible = true;
                            }
                        }
                    };

                    var _updateGroupStateByLayer = function(layer, groupLayers){
                        groupLayers.forEach(function(group){
                            layer.groupId.forEach(function(layerCatId){
                                if(group.groupId === layerCatId) {
                                    _updateGroupState(group);
                                }
                            });
                        });
                    };

                    function _initGroups(){
                        overlayLayers.forEach(function(isyLayer){
                            isyLayer.groupId.forEach(function(catId){
                                var group = map.GetGroupById(catId);
                                if (group){
                                    group.isyLayers = group.isyLayers || [];
                                    group.isyLayers.push(isyLayer);
                                }
                            });
                        });
                        for(var c in scope.groupLayers){
                            _updateGroupState(scope.groupLayers[c]);
                        }
                    }

                    scope.removeGroups = function () {
                        overlayLayers.forEach(function (isyLayer) {
                            isyLayer.groupId.forEach(function(catId){
                                var group = map.GetGroupById(catId);
                                if (group){
                                    group.isyLayers = [];
                                }
                            });
                        });
                        for (var c in scope.groupLayers){
                            scope.groupLayers[c].isOpen = false;
                        }

                    };

                    scope.getGroupStyleStatus = function (group) {
                        if (group.groupIsVisible){
                            return 'glyphicon glyphicon-ok-sign pointer-cursor';
                        }else if(group.isPartiallyVisible){
                            return 'glyphicon glyphicon-ok-circle pointer-cursor';
                        }else{
                            return 'icon-radio-unchecked pointer-cursor';
                        }
                    };

                    scope.getLayerStyleStatus = function (isyLayer) {
                        if (isyLayer.isVisible){
                            return 'glyphicon glyphicon-ok-sign pointer-cursor';
                        }else{
                            return 'icon-radio-unchecked pointer-cursor';
                        }
                    };

                    scope.toggleLayer = function(isyLayer){
                        if(!scope.onlyOneGroup || isyLayer.groupId.indexOf(999) > -1 ){
                            if(isyLayer.isVisible){
                                map.HideLayer(isyLayer);
                                isyLayer.styles = undefined;
                            } else{
                                isyLayer.previewActive = false;
                                map.ShowLayer(isyLayer);
                            }
                            _updateGroupStateByLayer(isyLayer, scope.groupLayers);
                        }
                    };

                    scope.toggleGroup = function (group) {
                        console.log(group);
                        if (!group.isAllLayersSelected) { //select all layers
                            if (group.isyLayers !== undefined) {
                                if (scope.onlyOneGroup && group.groupId !== 999) {
                                    scope.groupLayers.forEach(function (groupLayer) {
                                        if (groupLayer.groupId !== 999) {
                                            for (var i = 0; i < groupLayer.isyLayers.length; i++) {
                                                map.HideLayer(groupLayer.isyLayers[i]);
                                                groupLayer.isyLayers[i].styles = undefined;
                                                _updateGroupStateByLayer(groupLayer.isyLayers[i], scope.groupLayers);
                                            }
                                        }
                                    });
                                }
                                for (var i = 0; i < group.isyLayers.length; i++) {
                                    map.ShowLayer(group.isyLayers[i]);
                                    _updateGroupStateByLayer(group.isyLayers[i], scope.groupLayers);
                                }
                            }
                            // if (group.subCategories !== undefined) {
                            //     group.subCategories.forEach(scope.selectLayers);
                            // }
                        }else{ // deselect all layers
                            if (group.isyLayers !== undefined) {
                                for (var j = 0; j < group.isyLayers.length; j++){
                                    map.HideLayer(group.isyLayers[j]);
                                    group.isyLayers[j].styles = undefined;
                                    _updateGroupStateByLayer(group.isyLayers[j], scope.groupLayers);
                                }
                            }
                            // if (group.subCategories !== undefined) {
                            //     group.subCategories.forEach(scope.toggleGroup);
                            // }
                        }
                    };

                    _initGroups();
                    // console.log(scope.groupLayers);
                }
            };
        }]);