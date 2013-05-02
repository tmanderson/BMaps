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