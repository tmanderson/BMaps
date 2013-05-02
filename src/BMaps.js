BMaps = (function() {
    var modules = {
        BMapsPin        : BMaps.Pin,
        BMapsLocation   : BMaps.Location,
        BMapsDirections : BMaps.Directions,
        BMapsMap        : BMaps.Map,
        BMapsView       : BMaps.View
    };

    function onMixin(to, moduleName) {
        var shortName = moduleName.match(/BMaps(\w+)/).pop().toLowerCase();

        to.prototype[shortName] = function() {
            if(!this['_' + shortName]) {
                this['_' + shortName] = new modules[moduleName](this);
                if(this._mixWith && ~this._mixWith.indexOf(moduleName)) {
                    var name = to.toString().match(/BMaps(\w+)/).pop().toLowerCase();
                    this['_' + shortName]['_' + name] = this;
                }
            }

            return this['_' + shortName];
        }
    }

    for(var c in modules) {
        var module = modules[c];
        for(var m in module.prototype._mixWith) {
            var mixTo   = modules[module.prototype._mixWith[m]];
            onMixin(mixTo, c);
        }
    }

    BMaps.Events.eventable(BMaps);

    return BMaps;
})();