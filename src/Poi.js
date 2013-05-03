BMaps.POI = (function() {
    var JSONPRequest    = BMaps.Utils.JSONPRequest,
        JSONPHandler    = BMaps.Utils.JSONPHandler;

    function BMapsPOI(root) {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };
    }

    BMapsPOI.prototype = Object.create({
        _reference: ['BMapsMap', 'BMapsPin', 'BMapsLocation'],
        _results: [],

        get: function(cb) {
            var location = this.location();

            if(location.get().lat && location.get().lon && !this._results.length) {
                var self    = this;

                BMapsPOI.getPOIs({
                    lat     : location.get().lat,
                    lon     : location.get().lon,
                    callback: function(data) {
                        self._results = data;
                        if(cb) cb(data);
                    }
                });

                return this;
            }
            else {
                return this._results;
            }
        }
    });

    BMapsPOI.createRequestURL = function createRequestURL(service) {
        return 'http://spatial.virtualearth.net/REST/v1/data/' + BMaps.Options.Data[service].urlString;
    };

    BMapsPOI.spatialFilter = function spatialFilter(lat, lon, range) {
        return 'nearby(' + lat + ',' + lon + ',' + (range || 15.0) + ')';
    };

    BMapsPOI.formatResponse = function formatResponse(callback) {
        return function(data) {
            results = data.d.results;
            if(callback) callback(results);
        };
    };

    BMapsPOI.getPOIs = function getPOIs(options) {
        JSONPRequest(BMapsPOI.createRequestURL('NAVTEQNA'), {
            spatialFilter   : BMapsPOI.spatialFilter(options.lat, options.lon, options.range),
            jsonp           : JSONPHandler(BMapsPOI.formatResponse(options.callback)),
            key             : BMaps.key,
            $format         : 'json'
        });
    };

    return BMapsPOI;
})();