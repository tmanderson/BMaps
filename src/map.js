/**
 * Maps Module for BMaps
 */
BMaps.map = (function() {
    var BMap, BMapView,
        defaults    = BMaps.utils.defaults,
        merge       = BMaps.utils.merge,
        mixin       = BMaps.utils.allowMixins;

    function BMap(options) {
        options = options || {};
        if(!options.key) options.credentials = BMaps.key;
        console.log(options.key)
        this.map = new Microsoft.Maps.Map(options.el || document.body, defaults(options, BMapOptions) );
        return this;
    };

    BMap.prototype = Object.create({
        view    : function(options) { 
            if(!options) return this.map.getView();
            this.view = defaults(options, BMapView);
            this.map.setView( this.view );
        }
    });

    mixin(BMap);

    BMapView = Object.create({
        //  A boolean that specifies whether to animate map navigation. Note that this option is 
        //  associated with each setView call and defaults to true if not specified.
        /**
         * A boolean that specifies whether to animate map navigation. Note that this option is 
         * associated with each setView call and defaults to true if not specified.
         * @type {Boolean}
         */
        animate     : true,
        //  The bounding rectangle of the map view. If both are specified, bounds takes precedence over center.
        bounds      : false,
        center      : null,     // Microsoft.Maps.Location,
        centerOffset: null,     // Microsoft.Maps.Point,
        heading     : 0,
        labelOverlay: null,     // Microsoft.Maps.LabelOverlay,
        mapTypeId   : null,     // Microsoft.Maps.MapTypeId.aerial,
        padding     : 0,
        zoom        : 10
    });

    //  http://msdn.microsoft.com/en-us/library/gg427603.aspx
    BMapOptions = Object.create({
        backgroundColor     : Microsoft.Maps.Color, //a,r,g,b
        credentials         : null,
        customizeOverlays   : false,
        disableBirdseye     : false,
        disableKeyboardInput: false,
        disableMouseInput   : false,
        disablePanning      : false,
        disableTouchInput   : false,
        DisableUserInput    : false,
        disableZooming      : false,
        enableClickableLogo : true,
        enableSearchLogo    : true,
        fixedMapPosition    : false,
        height              : null, // must have width as well
        inertialIntensity   : 0.85,
        showBreadCrumb      : false,
        showCopyright       : true,
        showDashboard       : true,
        showMapTypeSelector : true,
        showScalebar        : true,
        theme               : null, //'Microsoft.Maps.Themes.BingThemes', //   module?
        tileBuffer          : 0,
        userIntertia        : true,
        width               : null
    });

    return BMap;
})();