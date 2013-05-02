BMaps.Location = (function() {
    
    function BMapsLocation(root) {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };

        return this;
    }

    BMapsLocation.prototype = Object.create({
        _reference: ['BMapsView', 'BMapsPin', 'BMapsDirections', 'BMapsPOI'],
        _coords: { lat: 0.0, lon: 0.0 },

        current: function() {
            if(!this._coords.lat && !this._coords.lon) return this;
            return new Microsoft.Maps.Location(this._coords.lat, this._coords.lon);
        },

        geocode: function() {

        },

        geolocate: function() {
            if(navigator.geolocation && !this.get().lat && !this.get().lon) {
                this._gettingLocation = true;
                navigator.geolocation.getCurrentPosition(
                        BMapsLocation.geolocationSuccessHandler(this), 
                            BMapsLocation.geolocationErrorHandler(this));

                this.promise = BMaps.Utils.promise(this, this.geolocation);
                return this.promise;
            }

            return this;
        },

        set: function() {

        },

        get: function() {
            return this._coords;
        }
    });

    BMapsLocation.geolocationSuccessHandler = function(scope) {
        return function(pos) {
            scope._coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            scope._gettingLocation = false;
            if(scope.promise) {
                scope.promise.resolve();
                scope.promise = undefined;
            }
            return true;
        };
    };

    BMapsLocation.geolocationErrorHandler = function(scope) {
        return function(coords) {
            return false;
        };
    };

    return BMapsLocation;
})();