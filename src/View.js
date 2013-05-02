BMaps.View = (function() {
    var defaults = BMaps.Utils.defaults;

    function BMapsView(root) {
        this._root = root;

        this.map = function() {
            var map = this._root;
            while(map._root) map = map._root;
            return map;
        };

        return this;
    }

    BMapsView.prototype = Object.create({
        _mixWith: ['BMapsMap', 'BMapsPin', 'BMapsLocation', 'BMapsDirections'],

        center: function() {
            var location = this.location();
            if(location.get().lat && location.get().lon) {
                this.map()._mapInstance.setView( defaults({ center: location.current(), zoom: 13 }) );
            }
        }
    });

    return BMapsView;
})();