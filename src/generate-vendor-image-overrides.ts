import { getAllDefs } from '@d2api/manifest-node';
import { writeFile } from './helpers.js';

const vendors = getAllDefs('Vendor');

const isRealIcon = (icon: string | undefined): icon is string =>
  Boolean(icon && !icon.includes('missing_icon'));

const donors = new Map<string, string>();
for (const vendor of vendors) {
  const displayProps = vendor.displayProperties;
  if (!vendor.enabled && displayProps?.name && isRealIcon(displayProps.smallTransparentIcon)) {
    donors.set(`${displayProps.name}|${displayProps.subtitle}`, displayProps.smallTransparentIcon);
  }
}

const overrides: Record<number, string> = {};
for (const vendor of vendors) {
  const displayProps = vendor.displayProperties;
  if (
    vendor.enabled &&
    vendor.visible &&
    displayProps?.name &&
    !isRealIcon(displayProps.smallTransparentIcon)
  ) {
    const icon = donors.get(`${displayProps.name}|${displayProps.subtitle}`);
    if (icon) {
      overrides[vendor.hash] = icon;
    }
  }
}

writeFile('./output/vendor-image-overrides.json', JSON.stringify(overrides, null, 2));
