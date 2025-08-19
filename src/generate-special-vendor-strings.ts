import { getAllDefs } from '@d2api/manifest-node';
import { writeFile,  } from './helpers.js';
import { DestinyVendorDefinition } from 'bungie-api-ts/destiny2/interfaces.js';


/**
 * Some vendors provide strings that we need to be able to do specific function, for example to filter out exotic catalysts from xur, we need to check for "Already Acquired" in the item
 * as a result we must get the localized version of this string, to avoid relying on Xur being an arbitrary ID and failureString, index we use this script to map his value
 * 
 * e.x.
 * {
 *  "alreadyAcquiredFailureString": {
 *    vendorHash: number,
 *    index: number 
 *  }, ...
 * }
*/

const allVendors: DestinyVendorDefinition[] = getAllDefs("Vendor")
const specialVendorStrings: Record<string, {vendorHash: number, index: number}> = {}
const vendorStringsToFind: Record<string, string> = {
  "alreadyAcquiredFailureString": "Already Acquired",
}

for (const [key, value] of Object.entries(vendorStringsToFind)) {
  const alreadyAcquiredStringVendor: DestinyVendorDefinition = allVendors.filter((vendor: DestinyVendorDefinition) => 
    vendor.failureStrings.some((s) => s === value)
  )[0]
  specialVendorStrings[key] = {
    vendorHash: alreadyAcquiredStringVendor.hash,
    index: alreadyAcquiredStringVendor.failureStrings.indexOf(value)
  }
}

writeFile('./output/special-vendors-strings.json', specialVendorStrings);