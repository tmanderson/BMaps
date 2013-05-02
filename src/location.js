BMaps.location = (function() {
    var userLocation;

    function geoPositionSuccessHandler(pos) {
        userLocation = {lat: pos.coords.latitude, lon: pos.coords.longitude};
        BMaps.trigger('location:currentLocation', userLocation);
    }

    function geoPositionErrorHandler() {

    }

    function currentLocation() {
        if(navigator.geolocation) {
            if(!userLocation) {
                navigator.geolocation.getCurrentPosition(geoPositionSuccessHandler, geoPositionErrorHandler);
                return false;
            }
            else {
                return userLocation;
            }
        }
    }

    function BMapsLocation(inst) {
        this.map = function() {
            return inst;
        };
    }

    BMapsLocation.prototype = Object.create({
        currentLocation: function() {
            return BMaps.utils.location(userLocation);
        },

        centerOnUserLocation: function(coords) {
            if(!currentLocation()) {
                BMaps.one('location:currentLocation', this.centerOnUserLocation, this);
            }
            else {
                this.map().view({
                    center  : BMaps.utils.location(coords),
                    zoom    : 13
                });
            }
            return this;
        }
    });

    BMaps.utils.allowMixins(BMapsLocation);

    BMaps.map.mixin({
        location: function() {
            if(!this._location) this._location = new BMapsLocation(this);
            return this._location;
        }
    });

    return BMapsLocation;
})();