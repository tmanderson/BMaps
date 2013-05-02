BMaps.Map = (function() {
    function BMapsMap() {
        var defaults = BMaps.Utils.defaults;
        options = arguments[1] || {};
        if(!options.key) options.credentials = BMaps.key;
        this._mapInstance = new Microsoft.Maps.Map(options.el || document.body, defaults(options, BMaps.Options.Map, true));

        return this;
    }

    BMapsMap.prototype = Object.create({
        _reference: ['BMapsView']
    });

    return BMapsMap;
})();