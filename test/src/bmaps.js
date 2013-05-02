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

        location: function location(options) {
            return new Microsoft.Maps.Location(options.lat, options.lon);
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
                for(var k in mixin) obj.prototype[k] = mixin[k];
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
            this._events[type].push({ callback: callback, scope: scope || this, one: callback.one });
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
        for(var k in Events) obj[k] = BMaps.utils.bind(Events[k], obj);
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
BMaps.directions = (function() {
    var BDirections, BWaypoint, BWaypointOptions,
        defaults = BMaps.utils.defaults,
        directions = [];

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

    function BMapsDirections(inst) {
        this.location = function() {
            return inst;
        };

        this.map = function() {
            return inst.map();
        };
    }

    BMapsDirections.prototype = Object.create({
        to: function(to) {
            var directionsModule = BMaps.modules.get('directions');

            if(!directionsModule) {
                var self = this;
                BMaps.one('modules:loaded', function() { self.to.call(self, to) }, this);
                return this;
            }
            
            if(!this.manager) this.manager = new Microsoft.Maps.Directions.DirectionsManager( this.map().map );

            this.manager.addWaypoint( new Microsoft.Maps.Directions.Waypoint( defaults({ location: this.location().currentLocation() }, BWaypoint.options) ) );
            this.manager.addWaypoint( new Microsoft.Maps.Directions.Waypoint( defaults({ address: to }, BWaypoint.options) ) );
            this.manager.calculateDirections();
            return this;
        }
    });

    BMaps.location.mixin({
        directions: function() {
            if(!this._directions) this._directions = new BMapsDirections(this);
            return this._directions;
        }
    });

    return BMapsDirections;
})();