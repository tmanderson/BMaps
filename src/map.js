BMaps.Map = (function() {
    function BMapsMap(el, options) {
        options = options || {};

        var defaults = BMaps.Utils.defaults;

        if(el && !('nodeType' in el) && /object/i.test(typeof el)) {
            options = el;
            el = options.el || null;
        }

        if(!options.key && BMaps.key) options.credentials = BMaps.key;

        this._mapInstance = new Microsoft.Maps.Map(el || document.body, defaults(options, BMaps.Options.Map, true));

        return this;
    }

    BMapsMap.prototype = Object.create({
        _reference: ['BMapsView'],

        get: function() {
            return this._mapInstance;
        },

        destroy: function() {
            this._mapInstance.dispose();
        }
    });

    return BMapsMap;
})();