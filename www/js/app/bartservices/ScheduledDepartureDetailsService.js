angular.module('bartionic')
    .factory('ScheduledDepartureDetailsService', function ($resource, poller, ENV) {
        var scheduledDepartureDetailsDeferredResponse = {};
        return {
            scheduledDepartureDetailsDeferredRequest: function (origin, destination) {
                scheduledDepartureDetailsDeferredResponse = getScheduledDepartureDetails(origin, destination);
                return scheduledDepartureDetailsDeferredResponse;
            },

            getScheduledDepartureDetailsDeferredResponse: function () {
                return scheduledDepartureDetailsDeferredResponse;
            }
        }

        function getScheduledDepartureDetails(origin, destination) {
            console.log("origin is : " + origin, " destination is : " + destination);
            var scheduledDepartureEndpoint = ENV.bartBaseURL + '/sched.aspx?cmd=depart&b=0&a=3&l=1&orig=' + origin + '&dest=' + destination + '&key=' + ENV.bartApiKey;
            var scheduledDepartureResource = $resource(scheduledDepartureEndpoint, {}, {query: {method: 'GET', isArray: false}});
            return scheduledDepartureResource.query();
        }
    });
