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
        },

        promise: function(obj, rootCall) {

            function Promise(root, rootFn) {
                this.overrideProps(root);
                this.resolutions = [{ scope: root, method: null, args: [] }];
                return this;
            }

            Promise.prototype = Object.create({
                resolve: function() {
                    var scope = null;

                    for(var p in this.resolutions) {
                        var reso = this.resolutions[p];
                        if(!reso.method) continue;
                        console.log(reso);
                        reso.scope[reso.method].apply(reso.scope, reso.args);
                        // else if(scope && reso.method) {
                        //     scope = scope[reso.method].apply(scope, reso.args);
                        // }

                        // console.log(reso.scope || scope, reso.method);
                    }
                },

                overrideProps: function(obj) {
                    var self = this;

                    for(var p in obj) {
                        if(/function/ig.test(typeof obj[p])) {
                            this[p] = self.nextPromise(obj, p, obj[p], self);
                        }
                        else {
                            this[p] = function() {
                                return self;
                            }
                        }
                    }
                },

                nextPromise: function(scope, prop, exp, p) {
                    return function() {
                        var newScope = exp.apply(scope, arguments);
                        p.overrideProps(newScope);
                        p.resolutions[p.resolutions.length-1].method = prop;
                        p.resolutions.push({ scope: newScope, method: null, args: arguments });
                        return p;
                    }
                }
            });

            return new Promise(obj, rootCall);
        }
    });

    return BMapsUtils;
})();