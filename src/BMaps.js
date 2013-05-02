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