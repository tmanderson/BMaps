describe("BMapsMap Module", function() {
    var map;

    describe("Instance destruction", function() {
        it("Should be able to dispose of instance", function() {
            map = new BMaps.Map();
            map.destroy();
            expect(document.body.childElementCount).toEqual(2);
        });
    });

    describe("Instance creation", function() {

        afterEach(function() {
            map.destroy();
        });

        it("Should create a map instance in the body, if no element is specified.", function() {
            map = new BMaps.Map();
            expect(document.body.childElementCount).toEqual(3);

        });

        it("Should create a map instance within specified element.", function() {
            map = new BMaps.Map(document.getElementById('mapContainer'));
            expect(document.body.childElementCount).toEqual(2);
        });

    });

    describe("Reference Chaining", function() {
        beforeEach(function() {
            map = new BMaps.Map(document.getElementById('mapContainer'));
        });

        afterEach(function() {
            map.destroy();
        });

        it("Indefinite reference chaining", function() {
            map.view().location().view().location().pin().view().location().pin().view().pin().view().location().directions().location().view();
        });

        it("References are actually references", function() {
            expect(map.view().location().pin().location().view()).toBe(map.view());
            expect(map.view().location().pin().location().directions().location()).toBe(map.view().location());
        });

        it("Promise chains retain call stack", function() {
            expect(map.view().location().geolocate().view().center().zoom(15).pin().add());
        });

    });
});