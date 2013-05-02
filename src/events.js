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