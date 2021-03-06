BMaps = {}
BMaps.Options = Object.create({
    Map: {
        backgroundColor     : Microsoft.Maps.Color, //a,r,g,b
        credentials         : null,
        center              : null,
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
        width               : null,
        animate             : true,
        zoom                : 10
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
BMaps.Utils = (function() {

    var BMapsUtils = Object.create({
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
            console.log(url, data);
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
    });

    return BMapsUtils;
})();
BMaps.Events = (function() {
    BMapsEvents = Object.create({
        trigger: function trigger(type) {
            var data    = Array.prototype.slice.apply(arguments),
                events  = this._events[type],
                i;
                
            if(!events) return;

            for(i = 0; i < this._events[type].length; i++) {
                var evt = this._events[type][i];
                evt.callback.apply(evt.scope || this, data.slice(1));
                if(evt.one) this.off(type, evt.callback, evt.scope);
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
    });

    BMapsEvents.eventable = function eventable(obj) {
        obj._events = {};
        for(var k in BMapsEvents) obj[k] = BMapsEvents[k];
        return obj;
    }

    return BMapsEvents;
})();
BMaps.Map = (function() {
    function BMapsMap(el, options) {
        options = options || {};

        var defaults = BMaps.Utils.defaults;

        if(el && !('nodeType' in el) && /object/i.test(typeof el)) {
            options = el;
            el = options.el || null;
        }

        if(!options.key && BMaps.key) options.credentials = BMaps.key;

        this._mapInstance = new Microsoft.Maps.Map(el || document.body, defaults(options, BMaps.Options.Map, true));

        return this;
    }

    BMapsMap.prototype = Object.create({
        _reference: ['BMapsView'],

        get: function() {
            return this._mapInstance;
        },

        destroy: function() {
            this._mapInstance.dispose();
        }
    });

    return BMapsMap;
})();
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

        set: function(lat, lon) {
            this._coords = { lat: lat, lon: lon };
            return this;
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
BMaps.Pin = (function() {

    function BMapsPin(root) {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };
    }

    BMapsPin.prototype = Object.create({
        _reference: ['BMapsView', 'BMapsLocation', 'BMapsDirections'],

        add: function(options) {
            options = options || {};
            var location = this.location();

            if(location.get().lat && location.get().lon) {
                this.map()._mapInstance.entities.push( new Microsoft.Maps.Pushpin(location.current(), {visible: true}) );
            }
            else {
                BMaps.one('location:geolocation', this.add, this);
            }

            return this;
        },

        get: function(i) {
            if(!i) return this.map().entities;
            this.map().entities.get(i);

            return this;
        },

        show: function(i) {
            var entities = this.map().entities;
            if(!i) {
                for(i = 0; i < entities.length; i++) entities.get(i).setOptions({visible: true});
            }
            else {
                entities.get(i).setOptions({visible: true});
            }

            return this;
        },

        hide: function(i) {
            var entities = this.map().entities;
            if(!i) {
                for(i = 0; i < entities.length; i++) entities.get(i).setOptions({visible: false});
            }
            else {
                entities.get(i).setOptions({visible: false});
            }

            return this;
        },

        remove: function(i) {
            var entities = this.map().entities;
            if(!i) {
                entities.clear();
            }
            else {
                entities.removeAt(i);
            }

            return this;
        }
    });
    
    return BMapsPin;
})();
BMaps.Directions = (function() {
    function BMapsDirections(root) {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };

        this._manager = new Microsoft.Maps.Directions.DirectionsManager(this.map()._mapInstance);
    }

    BMapsDirections.prototype = Object.create({
        _reference  : ['BMapsLocation', 'BMapsPin', 'BMapsPOI'],
        _lastDir    : 'to',

        byTransit: function() {
            this._manager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.transit });
            this._manager.calculateDirections();
            return this;
        },

        byDriving: function() {
            this._manager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });
            this._manager.calculateDirections();
            return this;
        },

        byWalking: function() {
            this._manager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.walking });
            this._manager.calculateDirections();
            return this;
        },

        to: function(toAddress) {
            this._lastDir = 'to';
            this._manager.resetDirections();
            this._manager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: this.location().current() }));
            this._manager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: toAddress }));
            this._manager.calculateDirections();
            return this;
        },

        from: function(fromAddress) {
            this._lastDir = 'from';
            this._manager.resetDirections();
            this._manager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: fromAddress }));
            this._manager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: this.location().current() }));
            this._manager.calculateDirections();
            return this;
        }
    });

    return BMapsDirections;
})();
BMaps.View = (function() {
    var defaults = BMaps.Utils.defaults;

    function BMapsView(root) {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };

        return this;
    }

    BMapsView.prototype = Object.create({
        _reference: ['BMapsMap', 'BMapsPin', 'BMapsLocation', 'BMapsDirections'],

        center: function() {
            var location = this.location();
            if(location.get().lat && location.get().lon) {
                this.map().get().setView( defaults({ center: location.current(), zoom: 13 }) );
            }
            return this;
        },

        zoom: function() {
            this.map().get().setView( defaults({ zoom: arguments[0] }, BMaps.Options.MapView) );
            return this;
        }
    });

    return BMapsView;
})();
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
BMaps = (function() {
    var modules = {
        BMapsPin        : BMaps.Pin,
        BMapsLocation   : BMaps.Location,
        BMapsDirections : BMaps.Directions,
        BMapsMap        : BMaps.Map,
        BMapsView       : BMaps.View,
        BMapsPOI        : BMaps.POI
    };

    Microsoft.Maps.loadModule("Microsoft.Maps.Directions", function() { console.log('ready'); });

    function createProperty(referenceName, moduleName, thisConstructorName) {
        return function() {
            var instance = this['_' + referenceName];

            if(!instance) instance = this['_' + referenceName] = new modules[moduleName](this);
            
            for(var r in instance._reference) {
                if(thisConstructorName === instance._reference[r]) instance['_' + instance._reference[r]] = this;
                if(this['_' + instance._reference[r]]) {
                        instance['_' + instance._reference[r]] = this['_' + instance._reference[r]];
                }
            }

            if(this.promise) instance.promise = this.promise;

            return instance;
        }
    }

    function getShortName(name) {
        return name.match(/BMaps(\w+)/).pop().toLowerCase();
    }

    for(var c in modules) {
        var module = modules[c];

        for(var m in module.prototype._reference) {
            var canReference    = module.prototype._reference[m],
                shortName       = getShortName(canReference);

            module.prototype[shortName] = createProperty(shortName, canReference, getShortName(c));
            module.prototype._reference[m] = shortName;
        }
    }

    BMaps.Events.eventable(BMaps);

    return BMaps;
})();