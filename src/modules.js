BMaps.modules = (function() {
    var modules = {
        shapes      : { cls: 'Microsoft.Maps.AdvancedShapes' }, 
        directions  : { cls: 'Microsoft.Maps.Directions' },
        search      : { cls: 'Microsoft.Maps.Search' },
        themes      : { cls: 'Microsoft.Maps.Themes.BingTheme' },
        traffic     : { cls: 'Microsoft.Maps.Traffic' },
        venues      : { cls: 'Microsoft.Maps.VenueMaps' }
    };

    for(var m in modules) {
        modules[m].requested = false;
        modules[m].loaded = false;
    }

    function moduleLoaded(name, callback) {
        return function() {
            modules[name].loaded = true;

            BMaps.trigger('modules:loaded', name, modules[name]);
            if(callback) callback(name, modules[name]);
        };
    }

    function requestModule(name, callback) {
        modules[name].requested = true;
        Microsoft.Maps.loadModule(modules[name].cls, {callback: moduleLoaded(name, callback) });
    }

    function loadModule(name, callback) {
        if(!modules[name]) return;
        requestModule(name, callback);
    }

    function isModuleLoaded(name) {
        return modules[name].requested && modules[name].loaded;
    }

    function getModule(name, callback) {
        if(!isModuleLoaded(name)) {
            loadModule(name, callback);
            return false;
        } 
        else {
            return modules[name];
        }
    }

    return {
        load        : loadModule,
        get         : getModule
    };

})();