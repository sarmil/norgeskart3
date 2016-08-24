angular.module('mainApp')
    .factory('mainAppFactory', ['ISY.MapAPI.Map','$location','ISY.Repository','$translate','translations',
        function(map, $location, repository, $translate, translations){

            var instance = "";
            var configUrl;
            var projectUrl;
            var projectsList;
            var projectConfig;
            var groupIds = [];
            var notDummyGroup = false;
            var projectNameUrl;

            var mapConfig = {
                "numZoomLevels": 18,
                "newMaxRes":  21664,
                "center": [
                    570130,7032300
                ],
                "groups": [],
                "zoom": 15,
                "layers": [
                    {
                        "id": "1992",
                        "isBaseLayer": true,
                        "subLayers": [
                            {
                                "title": "norges_grunnkart",
                                "source": "WMS",
                                "url": ["http://opencache.statkart.no/gatekeeper/gk/gk.open?LAYERS=norges_grunnkart"],
                                "gatekeeper": true,
                                "name": "norges_grunnkart",
                                "format": "image/png",
                                "coordinate_system": "EPSG:32632",
                                "id": "1992",
                                "tiled": true
                            }
                        ],
                        "visibleOnLoad": true
                    }
                ],
                "coordinate_system": "EPSG:32632",
                "extent": [
                    -2000000.0, 3500000.0, 3545984.0, 9045984.0
                ],
                "extentUnits": "m",
                "languages": {
                    "no": {},
                    "en": {}
                }
            };

            var getConfigCallback = function(configJson){
                configUrl = configJson.config.configurl;
                projectUrl = configJson.config.configurl;
                if ($location.search().application !== undefined || $location.search().instance !== undefined){
                    if ($location.search().application !== undefined){
                        instance = $location.search().application;
                    }else{
                        instance = $location.search().instance;
                    }

                }else{
                    instance = configJson.config.instance;
                }
                if (instance === undefined){
                    instance = '';
                }
                var projectsListUrl = projectUrl;
                projectsListUrl += '/api/v1/listprojects?application=' + instance;
                projectUrl += '/api/v1/project?application=' + instance + '&name=';
                var nameProject = projectName();
                if (nameProject.length > 0){


                    projectNameUrl = nameProject;

                    projectUrl += nameProject.toLowerCase();
                }

                // map.GetResource(projectUrl, 'application/json', getProjectCallback);
                map.GetResourceFromJson(projectsListUrl, 'application/json', getProjectsListCallback);

            };

            // var setSearch = function (obj) {
            //     if (!angular.equals(obj, $location.search())) {
            //         var newSearch = angular.extend($location.search(), obj);
            //         $location.search(newSearch);
            //     }
            // };

            function getProjectsListCallback(project){
                projectsList = project ? project : undefined;
                if (projectsList === undefined || projectNameUrl !== undefined) {
                    map.GetConfigResource(projectUrl, 'application/json', getProjectCallback);
                }
                // else{
                    // headerAppFactory.setShowSimpleHeader(true);
                    // giAppFactory.setListProjectsBody();
                // }
            }

            var projectName = function(){
                var absUrl = $location.$$absUrl;
                if (absUrl.indexOf("project=") > -1){
                    var projectName = /project=([^&]+)&/.exec(absUrl);
                    if (projectName === null){
                        projectName = /project=([^]+)/.exec(absUrl);
                        if (projectName === null){
                            projectName = ["", "__Default"];
                        }
                    }
                    return decodeURIComponent(projectName[1]);
                }else{
                    return "";
                }
            };

            var getProject = function() {
                //map.GetResource('config.xml', 'application/json', getConfigCallback);
                //map.GetConfigResource('config.xml', 'application/json', getConfigCallback);
                getConfigCallback(xml2json.parser($.ajax({
                    type: "GET",
                    url: "config.xml",
                    async: false
                }).responseText));
            };

            function getProjectCallback(project, isOffline) {
                projectConfig = project;
                // if (projectConfig === undefined || project.config === undefined || project.config.mapbounds === undefined) {
                //     console.log("project and/or coordinateExtend is undefined. Check project config");
                //     headerAppFactory.setShowSimpleHeader(true);
                //     giAppFactory.setErrorBody();
                //     $rootScope.$apply();
                //     return false;
                // }

                mapConfig = new ISY.Repository.MapConfig(angular.copy(mapConfig));
                mapConfig.instance = instance;
                mapConfig.projectName = projectName().toLowerCase();
                mapConfig.isOffline = isOffline;
                if (project.config.project.isyauth !== undefined) {
                    mapConfig.authHost = project.config.project.isyauth;
                    mapConfig.authHost += "/authjson/";
                    // TODO: Remove hardcoded "geoinnsyn" instance.
                    // authorizationPageService.init(mapConfig.authHost, instance);
                    // authorizationPageService.readToken();
                    // bookmarkMenuService.init(mapConfig.authHost, instance);
                }
                if (project.config.project.isyattachment !== undefined) {
                    mapConfig.attachmentHost = project.config.project.isyattachment;
                }
                if (project.config.project.isyproxy !== undefined) {
                    mapConfig.proxyHost = project.config.project.isyproxy + '/?';
                }
                if (project.config.project.isypicklist !== undefined) {
                    mapConfig.picklistHost = project.config.project.isypicklist;
                    mapConfig.picklistHost += "/picklist/";
                    // mapFeaturesService.init(mapConfig.picklistHost);
                }
                if (project.config.project.isygatekeeper !== undefined) {
                    mapConfig.tokenHost = project.config.project.isygatekeeper;
                }
                if (project.config.project.isysearch !== undefined) {
                    mapConfig.searchHost = project.config.project.isysearch;
                }
                if (project.config.project.codelists !== undefined) {
                    mapConfig.codelists = project.config.project.codelists;
                }

                var isyTokenIsSet = false;

                if ($location.search().isytoken !== undefined){
                    if ($location.search().isytoken !== '123'){
                        mapConfig.zoom = parseFloat($location.search().zoom);
                        mapConfig.center[0] = parseFloat($location.search().lon);
                        mapConfig.center[1] = parseFloat($location.search().lat);
                        isyTokenIsSet = true;
                    }
                }
                if (!isyTokenIsSet){
                    mapConfig.zoom = project.config.project.zoom;
                    mapConfig.center[0] = project.config.project.lon;
                    mapConfig.center[1] = project.config.project.lat;
                }

                if ($location.search().search !== undefined){
                    mapConfig.search = $location.search().search;
                    delete $location.search().search;
                }

                mapConfig.coordinate_system = project.config.project.mapepsg;
                mapConfig.mouseProjectionPrefix = project.config.project.displayprojectionprefix;
                mapConfig.headerTitle = project.config.project.headertitle;
                mapConfig.siteTitle = project.config.project.sitetitle;
                mapConfig.isy3dflyurl = project.config.project.isy3dflyurl;
                // if (project.config.project.isy3dflyurl === undefined){
                //     mainMenuButtonsOverlayFactory.showButton('3DView', false);
                // }else{
                //     mainMenuButtonsOverlayFactory.showButton('3DView', true);
                // }


                // var layout = getLayout(project.config.project.layout);
                // if (layout) {
                //     mapConfig.showMousePosition = layout.enablemousepositionctrl === 'true';
                // }
                // updateMapConfigWithCoordinateAndExtend(project.config.mapbounds);
                //
                updateMapConfigWithGroups(project);
                updateMapConfigWithImageLayers(project);
                // updateMapConfigWithWfs(project);
                // updateLayersSortingIndex();
                registerTranslations(mapConfig.languages);
                repository.GetMapConfigFromJson(mapConfig);

                return true;
            }

            var updateMapConfigWithGroups = function(project) {
                if (project.config.maplayer !== undefined){
                    if (project.config.maplayer.length !== undefined){
                        project.config.maplayer.forEach(function(group) {
                            createGroup(group.groupid, group.name, group.namelng, group.display);
                        });
                    }else{
                        createGroup(project.config.maplayer.groupid, project.config.maplayer.name, project.config.maplayer.namelng, project.config.maplayer.display);
                    }
                }

            };

            var createGroup = function(groupId, groupNameLng1, groupNameLng2, visibleOnLoad){
                var newGroup = new ISY.Repository.Category({
                    "groupId": groupId,
                    "name": groupNameLng1,
                    "parentId": groupNameLng2,
                    "visibleOnLoad": _getBoolean(visibleOnLoad)
                });
                groupIds.push(groupId);
                mapConfig.groups.push(newGroup);
                mapConfig.languages.en[newGroup.groupId] = groupNameLng1; // has to be fix with correct value!
                mapConfig.languages.no[newGroup.groupId] = groupNameLng2;
            };

            var updateMapConfigWithImageLayers = function(project) {
                if (project.config.wms !== undefined) {
                    if (project.config.wms.length !== undefined) {
                        project.config.wms.forEach(function (wms) {
                            addWms(wms);
                        });
                    } else {
                        addWms(project.config.wms);
                    }
                }
                if (project.config.wmts !== undefined){
                    if (project.config.wmts.length !== undefined) {
                        project.config.wmts.forEach(function (wmts) {
                            addWmts(wmts);
                        });
                    } else {
                        addWmts(project.config.wmts);
                    }
                }
            };

            var findGroupExistance = function(grpIds){
                var notExistGroups = [];
                grpIds.forEach(function (grpId) {
                    if (groupIds.indexOf(grpId) === -1){
                        notExistGroups.push(grpId);
                    }
                });
                return notExistGroups;
            };

            var createNotExistGroup = function(grpIds, groupNameLng1, groupNameLng2){
                var notExistGroups = findGroupExistance(grpIds);
                notExistGroups.forEach(function(grpId){
                    createGroup(grpId, groupNameLng1, groupNameLng2);
                });
            };

            var createDummyGroup = function(){ //dummy category for layers without group id
                if (notDummyGroup === false){
                    createGroup(999, 'Other layers', 'Andre lag');
                    notDummyGroup = true;
                }
            };

            var addWms = function(wms){
                addLayer("WMS", wms);
            };

            var addWmts = function(wmts){
                addLayer("WMTS", wmts);
            };

            var addLayer = function(sourceType, wms) {

                var cat_ids = [999];
                if (wms.groupid !== undefined){
                    cat_ids = wms.groupid.toString().split(',').map(function(item){
                        return parseInt(item, 10);
                    });
                    createNotExistGroup(cat_ids, wms.name, wms.namelng);
                }else{
                    if (wms.options.isbaselayer === 'false'){
                        createDummyGroup();
                    }
                }

                //if (wms.gatekeeper === 'true'){
                //    wmsSource = "WMS"; // WMS is default
                //}else{
                //    wmsSource = "proxyWms";
                //}



                var newIsyLayer = new ISY.Domain.Layer({
                    "subLayers": [
                        {
                            "title": wms.name,
                            "name": getNewLayers(wms.params.layers, wms.url),
                            "providerName": getNewLayers(wms.params.layers, wms.url),
                            "source": sourceType,
                            "gatekeeper": wms.gatekeeper === "true",
                            "url": getWmsUrl(wms.url),
                            "format": wms.params.format,
                            "coordinate_system": mapConfig.coordinate_system,
                            "extent": mapConfig.extent,
                            "extentUnits": mapConfig.extentUnits,
                            "matrixPrefix": wms.matrixprefix === "true",
                            "numZoomLevels": mapConfig.numZoomLevels,
                            "id": mapConfig.layers.length+1001,
                            "transparent": true,
                            "layerIndex": -1,
                            "legendGraphicUrl": wms.layers.layer.legendurl,
                            "minScale": wms.options.minscale,
                            "maxScale": wms.options.maxscale,
                            "sortingIndex": -1,
                            "featureInfo": {
                                "supportsGetFeatureInfo": true,
                                "getFeatureInfoFormat": "application/json",
                                "getFeatureInfoCrs": "",
                                "supportsGetFeature": true,
                                "getFeatureBaseUrl": "",
                                "getFeatureFormat": "application/json",
                                "getFeatureCrs": "EPSG:4326"
                            },
                            "tiled": wms.options.singletile !== "true",
                            "crossOrigin": null
                        }
                    ],
                    "guid": wms.guid,
                    "name":wms.name,
                    "groupId": cat_ids,
                    "visibleOnLoad": (wms.options.visibility === 'true'),
                    "id":  mapConfig.layers.length+1001,
                    "isBaseLayer": (wms.options.isbaselayer === 'true'),
                    "previewActive": false,
                    "opacity": 1,
                    "mapLayerIndex": -1,
                    "legendGraphicUrls": [],
                    "selectedLayerOpen": false
                });
                mapConfig.layers.push(newIsyLayer);
                mapConfig.languages.en[newIsyLayer.id] = wms.name;
                mapConfig.languages.no[newIsyLayer.id] = wms.namelng;
            };

            var _getBoolean = function(value){
                switch (typeof value){
                    case "string":
                        return value === "true" ? true : false;
                    case "boolean":
                        return value;
                }
                return false;
            };

            var getWmsUrl = function(url){
                if (url.indexOf('|')){
                    var urls = url.split('|');
                    for (var i = 0; i < urls.length; i++){
                        urls[i] = fixNibUrl(urls[i]);
                    }
                    return urls;
                } else {
                    return fixNibUrl(url);
                }
            };

            var oldNibUrl = 'geonorge.no/BaatGatekeeper/gk/gk.nibcache';
            var newNibUrl = 'geonorge.no/BaatGatekeeper/gk/gk.nib_utm';
            var getNewLayers = function(layers, url){
                if (url.indexOf(oldNibUrl) > 0){
                    switch (mapConfig.coordinate_system){
                        case 'EPSG:25832':
                        case 'EPSG:32632':
                            layers = 'Nibcache_UTM32_EUREF89';
                            break;
                        case 'EPSG:25833':
                        case 'EPSG:32633':
                            layers = 'Nibcache_UTM33_EUREF89';
                            break;
                        case 'EPSG:25835':
                        case 'EPSG:32635':
                            layers = 'Nibcache_UTM35_EUREF89';
                            break;
                    }
                }
                return layers;
            };

            var fixNibUrl = function (url) {
                var iPos = url.indexOf(oldNibUrl);
                if (iPos > 0) {
                    url = url.substr(0, iPos) + newNibUrl + url.substr(iPos + oldNibUrl.length);
                    switch (mapConfig.coordinate_system) {
                        case 'EPSG:25832':
                        case 'EPSG:32632':
                            url += '32';
                            break;
                        case 'EPSG:25833':
                        case 'EPSG:32633':
                            url += '33';
                            break;
                        case 'EPSG:25835':
                        case 'EPSG:32635':
                            url += '35';
                            break;
                        default:
                            console.error(url + ' støtter ikke ' + mapConfig.coordinate_system);
                            break;
                    }
                }
                return url;
            };

            function registerTranslations(languages) {
                angular.extend(translations.en, languages.en);
                angular.extend(translations.no, languages.no);
                $translate.refresh();
            }

            return {
                getMapConfig: function () {
                    return mapConfig;
                },
                updateMapConfig: function() {
                    getProject();
                }
            };
        }]
    );