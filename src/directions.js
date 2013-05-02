BMaps.Directions = (function() {
    function BMapsDirections() {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };
    }

    BMapsDirections.prototype = Object.create({
        _mixWith: ['BMapsLocation', 'BMapsPin'],

        to: function(toAddress) {
            if(!this._manager) this._manager = new Microsoft.Maps.Directions.DirectionsManager(this.map());
            this._manager.addWaypoint({ location: this.location().get() });
            this._manager.addWaypoint({ address: toAddress });
        },

        from: function(fromAddress) {
            if(!this._manager) this._manager = new Microsoft.Maps.Directions.DirectionsManager(this.map());
            this._manager.addWaypoint({ address: fromAddress });
            this._manager.addWaypoint({ location: this.location().get() });
        }
    });

    return BMapsDirections;
})();