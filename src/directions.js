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