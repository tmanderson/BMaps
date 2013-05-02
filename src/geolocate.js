BMaps.geoLocate = (function() {
    var currentPosition     = [0.0,0.0];

    //options.success = geoLocationHandler(options.success);

    function geoLocationSuccessHandler(callback) {
        return function(pos) {
            currentPosition[0] = pos.coords.latitude;
            currentPosition[1] = pos.coords.longitude;
            if(callback) callback(currentPosition);
        };
    }

    function geoLocationErrorHandler() {

    }

    function getLocation(options) {
        if(!navigator.geolocation) return;
        if(currentPosition[0] !== 0.0 && currentPosition[1] !== 0.0) return currentPosition;

        navigator.geolocation.getCurrentPosition(geoLocationSuccessHandler(options.success), geoLocationErrorHandler, {
            enableHighAccuracy: true
        });  
    }

    return getLocation;
})();