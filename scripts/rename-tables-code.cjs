/**
 * rename-tables-code.cjs
 * Patches all supabase.from() calls to use lty_ prefix.
 *
 * Strategy:
 *   products   → lty_products   (table renamed in Supabase)
 *   settings   → lty_settings   (table renamed in Supabase)
 *   categories → lty_categories (table renamed in Supabase)
 *   orders     → lty_orders     (NEW table created in Supabase — old 'orders' left intact)
 *
 * Usage: node scripts/rename-tables-code.cjs
 */

const fs = require('fs');
const path = require('path');

const RENAMES = {
  "'products'":   "'lty_products'",
  '"products"':   '"lty_products"',
  "'orders'":     "'lty_orders'",
  '"orders"':     '"lty_orders"',
  "'settings'":   "'lty_settings'",
  '"settings"':   '"lty_settings"',
  "'categories'": "'lty_categories'",
  '"categories"': '"lty_categories"',
};

const FILES = [
  'app/page.tsx',
  'app/panier/page.tsx',
  'app/tous-les-produits/page.tsx',
  'app/produits/[id]/page.tsx',
  'app/ltyy/page.tsx',
  'components/HeroSection.tsx',
  'components/SocialSection.tsx',
  'components/CategoryGrid.tsx',
  'components/FilterableGallery.tsx',
];

const ROOT = path.join(__dirname, '..');

let totalChanges = 0;

for (const relPath of FILES) {
  const filePath = path.join(ROOT, relPath);

  if (!fs.existsSync(filePath)) {
    console.log(`SKIPPED (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fileChanges = 0;

  for (const [oldName, newName] of Object.entries(RENAMES)) {
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\.from\\(${escaped}\\)`, 'g');
    const replacement = `.from(${newName})`;
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      const count = (before.match(pattern) || []).length;
      fileChanges += count;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`UPDATED (${fileChanges} change${fileChanges > 1 ? 's' : ''}): ${relPath}`);
    totalChanges += fileChanges;
  } else {
    console.log(`OK (already up to date): ${relPath}`);
  }
}

console.log(`\nDone. Total replacements: ${totalChanges}`);
