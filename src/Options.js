BMaps.Options = Object.create({
    Map: {
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
    },

    MapView: {
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
    },

    Data: {
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
    }
})