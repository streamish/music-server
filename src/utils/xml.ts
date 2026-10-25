function escapeXml(value: string | number | boolean | null | undefined | unknown) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeXmlValue(value: string | number | boolean | null | undefined | unknown) {
  const text = String(value);
  if (/[<&]/.test(text)) {
    return `<![CDATA[${text.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
  }
  return escapeXml(text);
}

/**
 * Converts a JS object to XML wrapped in an open/closing tag
 * @param obj An object
 * @param openingTag The parent opening tag without <>, this may include attributes eg `QDocRoot version="1.0"
 * @param closingTag The parent closing tag without <> eg `QDocRoot`
 * @param indent The indentation level
 * @returns The XML string
 */
export function objectToXml(obj: unknown, openingTag: string, closingTag?: string, indent: number = 0): string {
  if (Array.isArray(obj)) {
    const array = obj as Array<unknown>;
    let xml = ``;
    for (let i = 0, len = array.length; i < len; i += 1) {
      const item = array[i];
      const itemXml = objectToXml(item as Record<string | number, unknown>, openingTag, closingTag, indent + 2);
      xml += `\n${' '.repeat(indent)}${itemXml}${'  '.repeat(indent)}`;
    }
    return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` : xml;
  }
  let xml = `${' '.repeat(indent)}<${openingTag}>`;
  const record = obj as Record<string | number, unknown>;
  const objectKeys = Object.keys(record);
  for (let i = 0, len = objectKeys.length; i < len; i += 1) {
    const key = objectKeys[i];
    if (key) {
      if (Object.hasOwn(record, key)) {
        const value = record[key];
        if (typeof value === 'object' && value !== null) {
          const itemXml = objectToXml(value as Record<string | number, unknown>, key, key, indent + 2);
          xml += `\n${itemXml}${' '.repeat(indent)}`;
        } else {
          xml += `\n${' '.repeat(indent + 2)}<${key}>${sanitizeXmlValue(value)}</${key}>`;
        }
      }
    }
  }
  xml += `\n${' '.repeat(indent)}</${closingTag ?? openingTag}>`;
  return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` : xml;
}
