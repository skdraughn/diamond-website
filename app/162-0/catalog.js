import { decodeDiamondCombination, validateOneSixtyTwoZeroCatalog } from "./gameLogic";

const LOCAL_FALLBACK = "/data/one-sixty-two-zero.local.json";

async function fetchCatalog(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`162-0 catalog request failed (${response.status}).`);
  const catalog = validateOneSixtyTwoZeroCatalog(await response.json());
  const combinations = catalog.combinations.map((combination) => {
    const decoded = decodeDiamondCombination(combination);
    return { ...decoded, decadeEnd: decoded.decade };
  });
  return {
    ...catalog,
    catalogChecksum: catalog.catalogChecksum || catalog.catalogVersion,
    calibration: {},
    combinations,
  };
}

export async function loadCatalog({ url }) {
  try {
    return await fetchCatalog(url || LOCAL_FALLBACK);
  } catch (networkError) {
    if (!url || url === LOCAL_FALLBACK) throw networkError;
    return fetchCatalog(LOCAL_FALLBACK);
  }
}

export const localCatalogURL = LOCAL_FALLBACK;
