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