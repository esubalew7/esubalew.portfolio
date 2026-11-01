/**
 * terminalFormatter.js
 * Shared formatting utilities for the Developer Terminal.
 * Ensures consistent visual layout, prevents [object Object] leaks,
 * and formats complex CMS data structures into clean, professional ASCII output.
 */

/**
 * Safely extracts a displayable human-readable name from an item that could be
 * a string, a number, or an object (e.g. { id, name, order, visible }).
 * Never returns '[object Object]', 'undefined', or 'null'.
 */
export function extractItemName(item) {
  if (item === null || item === undefined) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'number') return String(item);
  if (typeof item === 'boolean') return '';

  if (typeof item === 'object') {
    // If explicitly hidden by CMS
    if (item.visible === false || item.published === false || item.enabled === false) {
      return '';
    }

    // Check prioritized known string keys
    const candidateKeys = [
      'name',
      'title',
      'label',
      'role',
      'organization',
      'company',
      'skill',
      'platform',
      'summary',
      'value',
    ];

    for (const key of candidateKeys) {
      const val = item[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
      if (typeof val === 'number') {
        return String(val);
      }
    }

    // Fallback: look for any non-id, non-url string property
    const entries = Object.entries(item);
    for (const [k, v] of entries) {
      if (k.toLowerCase().includes('id') || k.toLowerCase().includes('url') || k.toLowerCase().includes('image')) {
        continue;
      }
      if (typeof v === 'string' && v.trim().length > 0) {
        return v.trim();
      }
    }
  }

  return '';
}

/**
 * Safely extracts a list of readable names from an array of strings or objects.
 * Filters out hidden, null, or empty items.
 */
export function extractNames(items) {
  if (!Array.isArray(items)) {
    if (items && typeof items === 'object') {
      const single = extractItemName(items);
      return single ? [single] : [];
    }
    return [];
  }

  return items
    .map(extractItemName)
    .filter((name) => Boolean(name && name.length > 0));
}

/**
 * Formats a terminal banner with double-line divider.
 */
export function formatBanner(title) {
  const safeTitle = (title || '').toUpperCase().trim();
  return `${safeTitle}\n════════════════════════════════════════════════════════`;
}

/**
 * Formats a category section with bracketed header.
 */
export function formatSection(header, content) {
  const safeHeader = (header || '').toUpperCase().trim();
  return `\n[ ${safeHeader} ]\n${content}`;
}

/**
 * Formats an array of string items into aligned columns with bullets.
 * If items are few (<= 4), returns simple bullets.
 * Otherwise arranges into clean multi-column format.
 */
export function formatColumns(items, { numCols = 2, colWidth = 28, bullet = '•' } = {}) {
  const names = extractNames(items);
  if (!names.length) return '';

  if (names.length <= 4 || numCols < 2) {
    return names.map((name) => `  ${bullet} ${name}`).join('\n');
  }

  const rows = [];
  for (let i = 0; i < names.length; i += numCols) {
    const rowItems = names.slice(i, i + numCols);
    const line = rowItems
      .map((name, colIdx) => {
        const text = `${bullet} ${name}`;
        // Pad all columns except the last one in the row
        return colIdx < rowItems.length - 1 ? text.padEnd(colWidth) : text;
      })
      .join('  ');
    rows.push(`  ${line}`);
  }

  return rows.join('\n');
}

/**
 * Formats key-value pairs into an aligned table.
 */
export function formatTable(pairs, labelWidth = 14) {
  if (!Array.isArray(pairs)) return '';

  return pairs
    .filter((p) => p && p.label && p.value !== undefined && p.value !== null && String(p.value).trim() !== '')
    .map((p) => {
      const label = `${p.label}:`.padEnd(labelWidth);
      return `${label}${p.value}`;
    })
    .join('\n');
}

/**
 * Cleans titles and strings (e.g., removes stray trailing dots from headline roles).
 */
export function cleanTitle(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\.+$/, '');
}
