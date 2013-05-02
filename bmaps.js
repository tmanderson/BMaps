BMaps = {
    init: function(options) {
        BMaps.key = options.key;
        return BMaps;
    }
};
BMaps.utils = (function() {
    return {
        id: function id() {
            if(!this.count) this.count = 0;
            return ++this.count;
        },

        defaults: function defaults(obj, defs, strict) {
            var v, clone = {};

            if(obj) for(v in obj) clone[v] = obj[v];

            if(!obj) clone = {};

            for(v in defs) {
                if(!clone[v]) if(defs[v]) clone[v] = defs[v];
            }

            //  If "strict", remove any non-specified keys
            if(strict) for(v in clone) if(!(v in defs)) delete clone[v];

            return clone;
        },

        merge: function merge(to) {
            var args    = Array.prototype.slice.apply(arguments),
                curr, k;
            
            while(args.length > 1) {
                curr = args.splice(1,1)[0];
                for(k in curr) to[k] = curr[k];
            }

            return to;
        },

        chain: function chain(fn, as) {
            return function() { fn.apply(as, arguments); return as; };
        },

        location: function location(lat, lon) {
            return new Microsoft.Maps.Location(lat, lon);
        },

        JSONPHandler: function JSONPHandler(callback) {
            if(!this.count) this.count = 0;

            var handlerName = 'BMapsJSONP' + (++this.count);

            window[handlerName] = function(data) {
                callback(data);
                document.body.removeChild(document.getElementById(handlerName));
                delete window[handlerName];
            };

            return handlerName;
        },

        JSONPRequest: function JSONPRequest(url, data) {
            var script = document.createElement('script'), k;

            if(data) url += '?';

            for(k in data) url += [k, data[k]].join('=') + '&';

            script.setAttribute('src', url.substr(0, url.length-1));
            script.setAttribute('id', data.jsonp);

            document.body.appendChild(script);
        },

        allowMixins: function allowMixins(obj) {
            obj.mixin = function(mixin) {
                for(var k in mixin) BMap.prototype[k] = mixin[k];
            };
        },

        bind: function bind(fn, scope) {
            return function() {
                fn.apply(scope, arguments);
            };
        },

        wrapAll: function wrapAll(obj, withFn) {
            for(var k in obj) {
                if(/function/ig.test(obj[k].toString())) {
                    var wrapped = obj[k];
                    obj[k] = function() {
                        withFn.call(obj, wrapped, arguments);
                    };
                }
            }
        }
    };
})();
BMaps.events = (function() {

    var Events = {
        trigger: function trigger(type) {
            var data    = Array.prototype.slice.apply(arguments),
                events  = this._events[type],
                i;
                
            for(i = 0; i < events.length; i++) {
                events[i].callback.apply(events[i].scope || this, data.slice(1));
                if(events[i].one) this.off(type, events[i].callback, events[i].scope);
            }

            return this;
        },

        on: function on(type, callback, scope) {
            if(!this._events[type]) this._events[type] = [];
            this._events[type].push({ callback: callback, scope: scope, one: callback.one });
            return this;
        },

        one: function one(type, callback, scope) {
            callback.one = true;
            this.on.apply(this, arguments);
        },

        off: function off(type, callback, scope) {
            if(!this._events[type]) return this;
            var removed = [],
                i;

            if(!arguments.length) {
                this._events = {};
                return this;
            }

            if(arguments.length === 1) {
                this._events[type] = [];
                return this;
            }

            for(i = 0; i < this._events[type].length; i++) {
                var events = this._events[type];

                if(events[i].callback.toString() === callback.toString()) {
                    if(scope && events[i].scope === scope) {
                        removed.push(i);
                    }
                    else {
                        removed.push(i);
                    }
                }
            }

            while(removed.length) this._events[type].splice(removed.shift(), 1);

            return this;
        }
    };

    function makeEventable(obj) {
        obj._events = {};
        for(var k in Events) obj[k] = Events[k];
        return obj;
    }

    makeEventable(BMaps);

    return {
        makeEventable: makeEventable
    };
})();
BMaps.modules = (function() {
    var modules = {
        shapes      : { cls: 'Microsoft.Maps.AdvancedShapes' }, 
        directions  : { cls: 'Microsoft.Maps.Directions' },
        search      : { cls: 'Microsoft.Maps.Search' },
        themes      : { cls: 'Microsoft.Maps.Themes.BingTheme' },
        traffic     : { cls: 'Microsoft.Maps.Traffic' },
        venues      : { cls: 'Microsoft.Maps.VenueMaps' }
    };

    for(var m in modules) {
        modules[m].requested = false;
        modules[m].loaded = false;
    }

    function moduleLoaded(name, callback) {
        return function() {
            modules[name].loaded = true;

            BMaps.trigger('modules:loaded', name, modules[name]);
            if(callback) callback(name, modules[name]);
        };
    }

    function requestModule(name, callback) {
        modules[name].requested = true;
        Microsoft.Maps.loadModule(modules[name].cls, {callback: moduleLoaded(name, callback) });
    }

    function loadModule(name, callback) {
        if(!modules[name]) return;
        requestModule(name, callback);
    }

    function isModuleLoaded(name) {
        return modules[name].requested && modules[name].loaded;
    }

    function getModule(name, callback) {
        if(!isModuleLoaded(name)) {
            loadModule(name, callback);
            return false;
        } 
        else {
            return modules[name];
        }
    }

    return {
        load        : loadModule,
        get         : getModule
    };

})();
/**
 * Maps Module for BMaps
 */
BMaps.map = (function() {
    var BMap, BMapView,
        defaults    = BMaps.utils.defaults,
        merge       = BMaps.utils.merge,
        mixin       = BMaps.utils.allowMixins;

    BMap = function BMapInstance() {
        if(!options.key) options.key = BMaps.key;
        this.map = new Microsoft.Maps.Map(options.el || document.body, defaults(options, BMapOptions) );
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
BMaps.directions = (function() {
    var BDirections, BWaypoint, BWaypointOptions,
        defaults = BMaps.utils.defaults,
        directions = [];

    BDirections = Object.create({
        manager: function(map) {
            return new Microsoft.Maps.Directions.DirectionsManager(map);
        }
    });

    BWaypoint = Object.create({
        options: {
            address                 : null,
            disambiguationContainer : null,     // DOM Element for directions
            exactLocation           : false,
            isViapoint              : false,
            location                : null,
            pushpin                 : null,
            shortAddress            : null
        }
    });

    function getDirections(options) {
        var directionsModule = BMaps.modules.get('directions');

        if(!directionsModule) return BMaps.one('modules:loaded', getDirections);
        
        var dm = BDirections.manager(BMaps.map.get());
        directions.push(dm);

        if(options.waypoints) {
            for(var w in options.waypoints) {
                dm.addWaypoint( new Microsoft.Maps.Directions.Waypoint( defaults(currentWaypoint, BWaypoint.options) ) );
            }
        }
    }

    return {
        directions: getDirections
    };
})();