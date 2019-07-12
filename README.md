# MapTiler Geocoder

JavaScript component for geographical search provided as part of [MapTiler Cloud](https://www.maptiler.com/cloud).

## Usage example

### Autocomplete

```html
<html>
  <head>
    <script src="https://cdn.maptiler.com/maptiler-geocoder/v1.1.0/maptiler-geocoder.js"></script>
    <link href="https://cdn.maptiler.com/maptiler-geocoder/v1.1.0/maptiler-geocoder.css" rel="stylesheet" />
  </head>
  <body>
    <input id="search" type="text" />
    <script>
      var geocoder = new maptiler.Geocoder({
        input: 'search', // id of input element
        key: 'get_your_own_key'
      });
      geocoder.on('select', function(item) {
        console.log('Selected', item);
      });
    </script>
  </body>
</html>
```

### API

```js
var geocoder = new maptiler.Geocoder({
  key: 'get_your_own_key'
});

geocoder.geocode('Zurich')
.then(function(results) {
  console.log(results.features[0]);
});
```

**Note**: You can get your own keys for free at https://cloud.maptiler.com.

## API

### maptiler.Geocoder

* [Geocoder](#module_maptiler.Geocoder)
    * [new Geocoder(options)](#new_module_maptiler.Geocoder_new)
    * [.setLanguage(language)](#module_maptiler.Geocoder+setLanguage)
    * [.setBounds(bbox)](#module_maptiler.Geocoder+setBounds)
    * [.setProximity(point)](#module_maptiler.Geocoder+setProximity)
    * [.getQueryUrl(query)](#module_maptiler.Geocoder+getQueryUrl) ⇒ `string`
    * [.geocode(query)](#module_maptiler.Geocoder+geocode) ⇒ `Promise.<GeocodingResult>`

**Emits**: [`hover`](#Geocoder+event_hover), [`select`](#Geocoder+event_select)

### Constructor

<a name="new_module_maptiler.Geocoder_new"></a>

#### new Geocoder(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | `Object` |  | |
| options.key | `string` | | Access key from https://cloud.maptiler.com/ |
| [options.input] | `string` \| `HTMLInputElement` \| `null` | `null` | If no input is provided, the autocomplete will not be initiated, but the rest of the methods can still be used. Most notably [.geocode(query)](#module_maptiler.Geocoder+geocode). |
| [options.autocompleteWaitMs] | `number` | `500` | Number of milliseconds to wait before autocompleting. At most one request will be sent within this timeframe. Useful if you want to wait for the user to finish typing. Does not have any effect if `input` is not specified. |
| [options.language] | `string` \| `Array.<string>` | `null` | Specifies language preference e.g. `en,de`, `null` to disable. |
| [options.bounds] | `Array.<number>` | `null` | Search only within the specified bounds `[minx, miny, maxx, maxy]`, `null` to disable. |
| [options.proximity] | `Array.<number>` | `null` | Prefer results closer to the specified point `[lon, lat]`, `null` to disable. |

### Methods
<a name="module_maptiler.Geocoder+setLanguage"></a>

#### geocoder.setLanguage(language)

| Param | Type |
| --- | --- |
| language | `string` \| `Array.<string>` \| `null` |

<a name="module_maptiler.Geocoder+setBounds"></a>

#### geocoder.setBounds(bbox)

| Param | Type |
| --- | --- |
| bbox | `Array.<number>` \| `null` |

<a name="module_maptiler.Geocoder+setProximity"></a>

#### geocoder.setProximity(point)

| Param | Type |
| --- | --- |
| point | `Array.<number>` \| `null` |

<a name="module_maptiler.Geocoder+getQueryUrl"></a>

#### geocoder.getQueryUrl(query) ⇒ `string`

| Param | Type |
| --- | --- |
| query | `string` |

<a name="module_maptiler.Geocoder+geocode"></a>

#### geocoder.geocode(query) ⇒ `Promise.<GeocodingResult>`

Performs the search with the given `query` and currently set geocoder options.

| Param | Type |
| --- | --- |
| query | `string` |

### Events

The Geocoder inherits from [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter), so you can use the related methods. Most notably `geocoder.on` (see [EventEmitter#on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener)) to listen for events:

```js
geocoder.on('select', function(item) {
  console.log('Selected', item);
});
```

Possible event types:

<a name="Geocoder+event_select"></a>

#### `select`
Emitted when user selects an item.

<a name="Geocoder+event_hover"></a>

#### `hover`
Emitted when user hovers over and item in the autocomplete list.

### Types

#### GeocodingResult : `GeoJSONFeatureCollection`

The result of the geocoding is always a `GeoJSON` with individual items in a `FeatureCollection` at the root (`features` property).

**Properties**

| Name | Type |
| --- | --- |
| features | `Array.<GeocodingResultItem>` |

#### GeocodingResultItem : `GeoJSONFeature`
