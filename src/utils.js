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