describe("BMapsPin Module", function() {
    var map, flag = false;

    beforeEach(function() {
        map = new BMaps.Map(document.getElementById('mapContainer'));
    });

    afterEach(function() {
        map.destroy();
        flag = false;
    });


    it("Should be accessible as a method of a location.", function() {
        expect(map.view().pin()).not.toBe(undefined);
    });

    it("Should place itself at a location, if present.", function() {
        runs(function() {
            map.view().location().geolocate().view().pin().add();
        });

        waitsFor(function() {
            if(map.get().entities.getLength() === 1) flag = true;
            return flag;
        }, "Promise resolution", 5000);

        runs(function() {
            var location = map.get().entities.get(0).getLocation();
            expect(location.latitude).toEqual(map.view().location().get().lat);
            expect(location.longitude).toEqual(map.view().location().get().lon);  
        });
    });
});