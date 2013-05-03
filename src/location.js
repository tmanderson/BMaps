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
        _reference          : ['BMapsView', 'BMapsPin', 'BMapsDirections', 'BMapsPOI'],
        _coords             : { lat: 0.0, lon: 0.0 },

        current: function() {
            if(!this._coords.lat && !this._coords.lon) return this;
            return new Microsoft.Maps.Location(this._coords.lat, this._coords.lon);
        },

        geocode: function() {
            if(arguments[0]) this.geocode.then = arguments[0];
            if(!this._coords.lat || !this._coords.lon) return this.geolocate(this.geocode);

            //  Second argument should be error handler
            if(!this._address) {
                this.directions()._manager.reverseGeocode(this.current(), BMapsLocation.geocodedSuccessHandler(this));
                return this;
            }
            
            if(this.geocode.then) {
                this.geocode.then.apply(this);
                this.geocode.then = null;
            }

            return this;
        },

        geolocate: function() {
            if(arguments.length) this.geolocate.then = arguments[0];

            if(navigator.geolocation && !this._coords.lat && !this._coords.lon) {
                this._gettingLocation = true;
                navigator.geolocation.getCurrentPosition(
                        BMapsLocation.geolocationSuccessHandler(this), 
                            BMapsLocation.geolocationErrorHandler(this));
            }

            return this;
        },

        asAddress: function() {
            if(arguments[0]) this.asAddress.then = arguments[0];
            if(!this._address) return this.geocode(this.asAddress, arguments[0]);

            if(this.asAddress.then) {
                this.asAddress.then(this._address);
                this.asAddress = null;
            }

            return this._address;
        },

        set: function() {

        },

        get: function() {
            return this._coords;
        }
    });

    BMapsLocation.geocodedSuccessHandler = function(scope) {
        return function(pos) {
            scope._address = pos.formattedAddress;
            if(scope.geocode.then) scope.geocode.then.apply(scope);

            return true;
        };
    };

    BMapsLocation.geolocationSuccessHandler = function(scope) {
        return function(pos) {
            scope._coords.lat = pos.coords.latitude;
            scope._coords.lon = pos.coords.longitude;

            scope._gettingLocation = false;
            if(scope.geolocate.then) scope.geolocate.then.apply(scope);
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