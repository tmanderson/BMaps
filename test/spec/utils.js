describe("Utilities Module", function() {
    it("id()", function() {
        var id = BMaps.utils.id,
            i = 0;
        while(++i < 100) id();

        expect(id()).toEqual(100);
    });

    it("defaults() without strict", function() {
        var defaults        = BMaps.utils.defaults,
            obj             = {name: "Jimbo Jangle", age: 34},
            withDefaults    = defaults(obj, {name: "None", age: 0, color: 'black'});

        expect(obj.color).toBe(undefined);
        expect(withDefaults.color).toEqual('black');
        expect(withDefaults.age).toEqual(34);
        expect(withDefaults.name).toEqual("Jimbo Jangle");
    });

    it("defaults() with strict", function() {
        var defaults        = BMaps.utils.defaults,
            obj             = {name: "Jimbo Jangle", age: 34, color: 'black'},
            withDefaults    = defaults(obj, {name: "None", age: 0}, true);

        expect(obj.color).toEqual('black');
        expect(withDefaults.color).toBe(undefined);
        expect(withDefaults.age).toEqual(34);
        expect(withDefaults.name).toEqual("Jimbo Jangle");
    });

    it("merge()", function() {
        var merge = BMaps.utils.merge,
            obj             = {name: "Jimbo Jangle"},
            obj2            = {age: 34},
            obj3            = {color: 'black'};

        merge(obj, obj2, obj3);
        
        expect(obj.name).toEqual("Jimbo Jangle");
        expect(obj.age).toEqual(34);
        expect(obj.color).toEqual('black');
    });
})