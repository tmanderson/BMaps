# BMaps
**An easier way to interact with the Bing Maps APIs**

## Getting started
```JavaScript
    var map = new BMaps.map();
```

## Messing with Location
```JavaScript
    map.view()
            .location()
                .geolocate();
```

## Add some Pins
```JavaScript
    map.view()
        .location()
            .pin()
                .add();
```

## Some POIs
```JavaScript
    map.view()
        .location()
            .poi()
                .get();
```

## Location, zoom and pin
```JavaScript
    map.view()
        .location
            .geolocate()
        .view()
            .center()
            .zoom(12)
            .pin()
                .add();
```

## Directions?
```JavaScript
    map.view()
        .location()
            .geolocate()
            .directions()
                .to("Boston, MA");
```

## Care for transit?
```JavaScript
    map.view()
        .location()
            .geolocate()
            .directions()
                .to("16 W Ontario, Chicago, il")
                .byTransit()
```