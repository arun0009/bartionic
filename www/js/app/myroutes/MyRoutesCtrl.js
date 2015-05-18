var MyRoutesCtrl = function ($scope, $state, $filter, $ionicPlatform, $q, $timeout, ScheduledDepartureDetailsService, EstTimeDepartureService) {

    $scope.myRoutes = [];
    var originNames = [];
    var destinationNames = [];
    //window.localStorage.clear();

    function getScheduleDepuartureDetailsPromises(favoriteRoutes) {
        var scheduleDepartureDetailsPromises = [];
        for (var i = 0; i < favoriteRoutes.length; i++) {
            var originAbbr = favoriteRoutes[i].originAbbr;
            var destinationAbbr = favoriteRoutes[i].destinationAbbr;
            originNames.push(favoriteRoutes[i].originName);
            destinationNames.push(favoriteRoutes[i].destinationName);
            scheduleDepartureDetailsPromises.push(ScheduledDepartureDetailsService.scheduledDepartureDetailsDeferredRequest(originAbbr, destinationAbbr).$promise);
        }
        return scheduleDepartureDetailsPromises;
    }

    function setEstimatedDepartureDetails(myRouteInfo, originAbbr) {
        EstTimeDepartureService.departureTimeDeferredRequest(originAbbr).promise.then(null, null, function (estTimeDeparture) {
            //console.log("estTimeDeparture is : " + angular.toJson(estTimeDeparture));
            myRouteInfo.originName = originNames[myRouteInfo.id];
            myRouteInfo.destinationName = destinationNames[myRouteInfo.id];
            var estDepartureDetails = $filter('filter')(estTimeDeparture.root.station.etd, {abbreviation: myRouteInfo.trainHeadStation}, true);
            if (estDepartureDetails != null) {
                //should be a way to filter and return first object?
                if (angular.isArray(estDepartureDetails)) {
                    estDepartureDetails = estDepartureDetails[0];
                }
                if (angular.isArray(estDepartureDetails.estimate)) {
                    myRouteInfo.estDeparture = isNaN(estDepartureDetails.estimate[0].minutes) ? 'LEAVING_NOW' : parseInt(estDepartureDetails.estimate[0].minutes) * 60;
                } else {
                    myRouteInfo.estDeparture = isNaN(estDepartureDetails.estimate.minutes) ? 'LEAVING_NOW' : parseInt(estDepartureDetails.estimate.minutes) * 60;
                }
            }
            var myRouteInfoInScope = $filter('filter')($scope.myRoutes, {id: myRouteInfo.id}, true);
            if (!myRouteInfoInScope.length) {
                $scope.myRoutes.push(myRouteInfo);
            }
        });
    }

    this.loadFavoriteRouteSchedule = function () {
        var favoriteRoutes = JSON.parse(window.localStorage.getItem('favoriteRoutes')) || [];
        console.log('fav routes : ' + angular.toJson(favoriteRoutes));
        $q.all(getScheduleDepuartureDetailsPromises(favoriteRoutes)).then(function (data) {
            angular.forEach(data, function (scheduledDepartureDetails, key) {
                var trainHeadStation = "";
                var myRouteInfo = {};
                myRouteInfo.id = key;
                myRouteInfo.routeFare = scheduledDepartureDetails.root.schedule.request.trip[0]._fare;
                myRouteInfo.destTimeMin = scheduledDepartureDetails.root.schedule.request.trip[0]._destTimeMin;
                myRouteInfo.hasLink = false;
                if (angular.isArray(scheduledDepartureDetails.root.schedule.request.trip[0].leg)) {
                    myRouteInfo.hasLink = true;
                    myRouteInfo.trainHeadStation = scheduledDepartureDetails.root.schedule.request.trip[0].leg[0]._trainHeadStation;
                } else {
                    myRouteInfo.trainHeadStation = scheduledDepartureDetails.root.schedule.request.trip[0].leg._trainHeadStation;
                }

                var originAbbr = favoriteRoutes[key].originAbbr;
                setEstimatedDepartureDetails(myRouteInfo, originAbbr);
            });
        });
    }

    this.deleteRoute = function (route) {
        var favoriteRoutes = JSON.parse(window.localStorage.getItem('favoriteRoutes')) || [];
        for (var i = 0; i < favoriteRoutes.length; i++) {
            console.log(favoriteRoutes[i]);
            if (favoriteRoutes[i].originName === route.originName && favoriteRoutes[i].destinationName === route.destinationName) {
                favoriteRoutes.splice(i, 1);
            }
        }
        window.localStorage.setItem('favoriteRoutes', JSON.stringify(favoriteRoutes));
        window.location.reload();
    }
}


angular.module('bartionic.myroutes').controller('MyRoutesCtrl', MyRoutesCtrl);
