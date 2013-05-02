BMaps.POI = (function() {
    var JSONPRequest    = BMaps.utils.JSONPRequest,
        JSONPHandler    = BMaps.utils.JSONPHandler,
        results         = [];

    //  For entity types: http://msdn.microsoft.com/en-us/library/hh478191.aspx
    BMapsDataSources = {
        FourthCoffeeSample: {},
        NAVTEQNA: {
            urlString       : 'f22876ec257b474b82fe2ffcb8393150/NAVTEQNA/NAVTEQPOIs',
            properties      : {
                EntityId        : null,
                Name            : null,
                DisplayName     : null,
                Latitude        : null,
                Longitude       : null,
                AddressLine     : null,
                Locality        : null,
                AdminDistrict   : null,
                AdminDistrict2  : null,
                PostalCode      : null,
                CountryRegion   : null,
                Phone           : null,
                EntityTypeId    : null
            }
        },
        NAVTEQEU: {},
        TrafficIncidents: {}
    };

    function createRequestURL(service) {
        return 'http://spatial.virtualearth.net/REST/v1/data/' + BMapsDataSources[service].urlString;
    }

    function spatialFilter(lat, lon, range) {
        return 'nearby(' + lat + ',' + lon + ',' + (range || 15.0) + ')';
    }

    function formatResponse(callback) {
        return function(data) {
            results = data.d.results;
            if(callback) callback(results);
        };
    }

    function getPOIs(options) {
        JSONPRequest(createRequestURL('NAVTEQNA'), {
            spatialFilter   : spatialFilter(options.lat, options.lon, options.range),
            jsonp           : JSONPHandler(formatResponse(options.callback)),
            key             : BMaps.key,
            $format         : 'json'
        });
    }

    return {
        get         : getPOIs,
        results     : function() {
            return results.concat([]);
        }
    };

})();