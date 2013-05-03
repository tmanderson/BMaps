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