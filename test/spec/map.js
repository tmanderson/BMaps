describe("Map module", function() {
    it("create()", function() {
        BMaps.map.create({
            el          : document.getElementById('mapContainer'),
            credentials : BMaps.key
        });
    });
});