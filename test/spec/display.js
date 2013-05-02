describe("Display module", function() {
    var flag;

    it("addPin()", function() {

        BMaps.display.addPin({
            title   : 'A',
            lat     : '41.8934435',
            lon     : '-87.6287466'
        });

        expect(BMaps.map.entities().length).toEqual(1);

    });
});