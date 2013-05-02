describe("POI module", function() {
    var flag;

    it("get()", function() {

        runs(function() {
            BMaps.POI.get({
                lat     : '41.8934435',
                lon     : '-87.6287466',
                range   : 25.0,
                callback: function(results) {
                    if(results.length) flag = true;
                }
            });
        });

        waitsFor(function() {
            return flag;
        }, "returned a list of POIs", 1000);

    });
});