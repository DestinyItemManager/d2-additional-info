# query.md?

hopefully a fast way to filter through d2 manifest tables

## input

```
 /¯¯table¯¯\   /¯¯¯¯¯¯¯¯¯¯¯¯¯¯query¯¯¯¯¯¯¯¯¯¯¯¯\  checkvalue  /¯¯¯¯returnthis¯¯¯¯\
InventoryItem sourceData.vendorSources:vendorhash 3361454721 displayProperties.name
      ↑           ↑             ↑          ↑           ↑
     obj         obj           arr        key       num/str
```

#### table

arg 1 accepts a manifest table minus the "Destiny" prefix/"Definition" suffix.

#### query

arg 2 accepts a query string that shows what key and subkeys to access to find filter data.
`:` represents an array to check all items inside.
the last `\w+` of the `query` should be the name of the key, whose value we want to compare.

#### checkvalue

arg 3, the value we accessed using the `query`, gets compared to this.
to-add: arg 2.5 which defines how to compare. right now it's `==`.

#### returnthis

arg 4, similar to `query` but leads to the value we want returned, for the matching elements in the table.
you probably just want `displayProperties.name` if you're eyeballing the results,
or `hash` if you need a script-usable list.

## output

info is `console.log`ged, which seems pipeable.
if you've made bad life choices and use git bash like i do, you may need to type `bash` before querying, so the results are pipeable.

## examples

hashes of all collectibles with "Events" in their `parentPresentationNodeHashes`

```bash
node query.js Collectible presentationInfo.parentPresentationNodeHashes: 2699282986 hash
```

names of all shaders i think?

```bash
node query.js InventoryItem itemSubType 20 displayProperties.name
```

names of all items that include Tess as a `VendorSource`

```bash
node query.js InventoryItem sourceData.vendorSources:vendorHash 3361454721 displayProperties.name
```
