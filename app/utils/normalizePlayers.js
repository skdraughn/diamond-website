// utils/normalizePlayer.js
/**
 * Decode common UTF-8 mojibake when it’s present, strip diacritics,
 * apostrophes & dashes, lowercase, collapse whitespace.
 */
const unescapeUnicode = (str = "") =>
  str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

/** does the string contain the unmistakable mojibake byte pattern? */
const looksLikeMojibake = (str) => /[\u00C2-\u00F4][\u0080-\u00BF]/.test(str);

export const decodeMojibake = (str = "") => {
  str = unescapeUnicode(str);

  if (!looksLikeMojibake(str)) return str; // already fine ↩️

  try {
    const esc = [...str]
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
    return decodeURIComponent(esc);
  } catch {
    return str; // give up, return as-is
  }
};

export const normalizePlayer = (raw = "") => {
  let s = decodeMojibake(raw)
    .normalize("NFD") // split diacritics
    .replace(/[\u0300-\u036f]/g, "") // drop them
    .toLowerCase()
    .replace(/[-‐-–—−]/g, " ") // any dash → space
    .replace(/['\u2018\u2019\u201B\u02BC]/g, "") // apostrophes → remove
    .replace(/[^a-z\s]/g, " ") // junk → space
    .replace(/\s+/g, " ") // collapse
    .trim();

  return s;
};
