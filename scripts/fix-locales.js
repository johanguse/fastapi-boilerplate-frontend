import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path based on where I save this script. I'll save it in frontend/scripts/fix-locales.js
const localesDir = path.resolve(__dirname, '../src/i18n/locales');
const enUsPath = path.join(localesDir, 'en-US/translation.json');

console.log(`Deep merging missing keys from ${enUsPath} to other locales...`);

const enUsContent = JSON.parse(fs.readFileSync(enUsPath, 'utf-8'));

function mergeDeep(target, source) {
  if (typeof source !== 'object' || source === null) {
    return;
  }
  
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      mergeDeep(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key]; // Copy english value as fallback
      }
    }
  }
}

const locales = fs.readdirSync(localesDir);

for (const locale of locales) {
  if (locale === 'en-US') continue;
  
  const filePath = path.join(localesDir, locale, 'translation.json');
  if (!fs.existsSync(filePath)) continue;
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    mergeDeep(content, enUsContent);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    console.log(`Updated ${locale}`);
  } catch (e) {
    console.error(`Error updating ${locale}:`, e);
  }
}
