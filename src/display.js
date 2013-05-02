BMaps.display = (function() {
    var BPin, BPinOptions,
        defaults = BMaps.utils.defaults,
        location = BMaps.utils.location;

    //  Pushpin: 
    //      http://msdn.microsoft.com/en-us/library/gg427615.aspx
    //  Pushpin Options: 
    //      http://msdn.microsoft.com/en-us/library/gg427629.aspx
    BPin = Object.create({
        pin     : Microsoft.Maps.Pushpin
    });

    BPinOptions = Object.create({
        anchor      : null, //  Microsoft.Maps.Point,
        draggable   : false,
        height      : 39,
        htmlContent : null,
        icon        : null,
        infoBox     : null, //  Microsoft.Maps.InfoBox,
        text        : null,
        textOffset  : null, //  Microsoft.Maps.Point,
        typeName    : null,
        visible     : true,
        width       : 25,
        zIndex      : null
    });

    function createPin(options) {
        BMaps.map.addEntity( new BPin.pin( location(options.lat, options.lon), defaults(options, BPinOptions, true) ) );
    }

    function createPins(set) {
        for(var i = 0; i < set.length; i++) {
            createPin( set[i] );
        }
    }

    return {
        addPin  : createPin,
        addPins : createPins
    };
})();