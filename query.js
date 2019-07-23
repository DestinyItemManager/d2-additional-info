/*================================================================*\
||
|| query.js
|| looks in arg1's table, following arg2's key structure,
|| compares to arg3, and returns items using arg4's key structure
||
|| "i am genuinely sorry for making this file" -@sundevour
||
\*================================================================*/
const { getMostRecentManifest } = require('./helpers.js');
const mostRecentManifestLoaded = require(`./${getMostRecentManifest()}`);

if (process.argv.length < 3)
  return console.log(
    `    arg 1: one of these manifest tables
${Object.keys(mostRecentManifestLoaded)
  .map((key) => key.slice(7, -10))
  .sort()
  .join(' ')}

    arg 2: path to the key of the comparison value
           ":" to try all indices of an array
           i.e. sourceData.vendorSources:vendorhash

    arg 3: value we want to find when we look in arg 2
           i.e. 3361454721

    arg 4: path to the entry's value to return
          i.e. displayProperties.name
`
  );

let table, query, checkvalue, returnthis, keystring;
[, , table, query, checkvalue, returnthis] = process.argv;

//  /¯¯table¯¯\   /¯¯¯¯¯¯¯¯¯¯¯¯¯¯query¯¯¯¯¯¯¯¯¯¯¯¯\  checkvalue  /¯¯¯¯returnthis¯¯¯¯\
// InventoryItem sourceData.vendorSources:vendorhash 3361454721 displayProperties.name
//       ↑           ↑             ↑          ↑           ↑
//      obj         obj           arr        key       num/str

// budget idx
function keynest(startobject, keylist) {
  // abort if no further dive to do
  if (!keylist) return startobject;

  let returnval = startobject;
  keylist.split('.').map((key) => {
    if (returnval) returnval = returnval[key];
  });
  return returnval;
}

// for each item in an array, continue object traversal and do the equality check
function compareallindices(array, knownlocation, maybevalue) {
  return array.filter((x) => {
    return keynest(x, knownlocation) == maybevalue;
  }).length;
}

[keystring, keystringinsidearray] = query.split(':');

let searchresults = [];
Object.entries(mostRecentManifestLoaded[`Destiny${table}Definition`]).map(([hash, properties]) => {
  let searchtemp;
  let resultstemp;
  if (
    // if key traversal finds something
    (searchtemp = keynest(properties, keystring)) &&
    // and either no array to check
    ((!keystringinsidearray && searchtemp == checkvalue) ||
      // or there is, and the array check finds something
      (keystringinsidearray && compareallindices(searchtemp, keystringinsidearray, checkvalue))) &&
    // and subsequent key traversal goes ok
    (resultstemp = keynest(properties, returnthis))
  ) {
    // then we found a nested value that matches checkvalue!
    searchresults.push(resultstemp);
  }
});
console.log(searchresults.sort().join('\n'));
