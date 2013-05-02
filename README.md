# BMaps
**An easier way to interact with the Bing Maps APIs**

## Initialize
```JavaScript
    BMaps.init({ key: "BingMapsAPIKey" })
        .map({ 
            el: document.body 
        });
```

## BMaps.map Module
Deals with all things map/view

### `get`
Returns an instance to the currently active map

### `entities`
Returns the active map's entities with familiar methods and properties
```JavaScript
    {
        length: 34 //   length of current map's entities
    }
```

### `view`
Get/set the current view on the active map.

### `addEntity`
Add a list or single entity to the currently active map

## BMaps.modules Module
Deals with `Microsoft.Maps` module management
### `load(`<span color="#CCC">String:moduleName, Function:callback</span>`)`
Load a given module based on the following names:
- shapes
- directions
- search
- themes
- traffic
- venues