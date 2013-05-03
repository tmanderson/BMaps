describe("BMapsView Module", function() {
    var map, flag = false;

    beforeEach(function() {
        map = new BMaps.Map(document.getElementById('mapContainer'));
    });

    afterEach(function() {
        map.destroy();
        flag = false;
    });

    it("Should be accessable as a method of map instance", function() {
        expect(map.view()).not.toBe(undefined);
    });

    it("Should retain a reference to map", function() {
        expect(map.view().map()).toEqual(map);
    });

    it("Should be zoomable via zoom(n)", function() {
        runs(function() { map.view().zoom(15); });

        waitsFor(function() {
            if(map.get().getZoom() === 15) flag = true;
            return flag;
        }, "Map should be zoomed to 15", 1000);

        runs(function() { expect(map.get().getZoom()).toBe(15); });
    });

    it("Should center on user location via center", function() {
        runs(function() {
            map.view().location().geolocate().geocode(map.view().center);
        });

        waitsFor(function() {
            if(map.view().location().get().lat && map.view().location().get().lon) flag = true;
            return flag;
        }, "Map should be zoomed to 10 and centered on user location", 5000);
        
        runs(function() { expect(map.get().getZoom()).toEqual(13); });
    });
});