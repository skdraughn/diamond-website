const currentTeams = [
  "arizona-diamondbacks", "atlanta-braves", "baltimore-orioles", "boston-red-sox",
  "chicago-cubs", "chicago-white-sox", "cincinnati-reds", "cleveland-guardians",
  "colorado-rockies", "detroit-tigers", "houston-astros", "kansas-city-royals",
  "los-angeles-angels", "los-angeles-dodgers", "miami-marlins", "milwaukee-brewers",
  "minnesota-twins", "new-york-mets", "new-york-yankees", "oakland-athletics",
  "philadelphia-phillies", "pittsburgh-pirates", "san-diego-padres", "san-francisco-giants",
  "seattle-mariners", "st-louis-cardinals", "tampa-bay-rays", "texas-rangers",
  "toronto-blue-jays", "washington-nationals",
];
const teamLogoMap = Object.fromEntries(currentTeams.map((key) => [
  key,
  `/team-logos/${key.replaceAll("-", "_")}.png`,
]));

const historical = {
  "anaheim-angels-1997-2001": "anaheim-angels-1997-2001.webp",
  "anaheim-angels-2000-2001": "anaheim-angels-2000-2001.webp",
  "anaheim-angels-2002-2004": "anaheim-angels-2002-2004.webp",
  "california-angels-1980-1996": "california-angels-1980-1996.webp",
  "cleveland-indians-1980-2021": "cleveland-indians-1980-2021.webp",
  "cleveland-indians-2000-2021": "cleveland-indians-2000-2021.webp",
  "florida-marlins-1993-2011": "florida-marlins-1993-2011.webp",
  "florida-marlins-2000-2011": "florida-marlins-2000-2011.webp",
  "montreal-expos-1980-2004": "montreal-expos-1980-2004.webp",
  "montreal-expos-2000-2004": "montreal-expos-2000-2004.webp",
  "tampa-bay-devil-rays-1998-2000": "tampa-bay-devil-rays-1998-2000.webp",
  "tampa-bay-devil-rays-2000": "tampa-bay-devil-rays-2000.webp",
  "tampa-bay-devil-rays-2001-2007": "tampa-bay-devil-rays-2001-2007.webp",
};

const historicalMetadata = {
  "anaheim-angels-1997-2001": ["Anaheim Angels", "#BA0021", 1997, 2001],
  "anaheim-angels-2000-2001": ["Anaheim Angels", "#5C7FBC", 2000, 2001],
  "anaheim-angels-2002-2004": ["Anaheim Angels", "#BA0021", 2002, 2004],
  "california-angels-1980-1996": ["California Angels", "#C60C30", 1980, 1996],
  "cleveland-indians-1980-2021": ["Cleveland Indians", "#E31937", 1980, 2021],
  "cleveland-indians-2000-2021": ["Cleveland Indians", "#E31937", 2000, 2021],
  "florida-marlins-1993-2011": ["Florida Marlins", "#00A3E0", 1993, 2011],
  "florida-marlins-2000-2011": ["Florida Marlins", "#00A3E0", 2000, 2011],
  "montreal-expos-1980-2004": ["Montreal Expos", "#1E3A8A", 1980, 2004],
  "montreal-expos-2000-2004": ["Montreal Expos", "#1E3A8A", 2000, 2004],
  "tampa-bay-devil-rays-1998-2000": ["Tampa Bay Devil Rays", "#652D90", 1998, 2000],
  "tampa-bay-devil-rays-2000": ["Tampa Bay Devil Rays", "#652D90", 2000, 2000],
  "tampa-bay-devil-rays-2001-2007": ["Tampa Bay Devil Rays", "#005A9C", 2001, 2007],
};

const primaryColors = {
  "arizona-diamondbacks": "#A71930", "atlanta-braves": "#CE1141",
  "baltimore-orioles": "#DF4601", "boston-red-sox": "#BD3039",
  "chicago-cubs": "#0E3386", "chicago-white-sox": "#27251F",
  "cincinnati-reds": "#C6011F", "cleveland-guardians": "#E31937",
  "colorado-rockies": "#33006F", "detroit-tigers": "#0C2340",
  "houston-astros": "#002D62", "kansas-city-royals": "#004687",
  "los-angeles-angels": "#BA0021", "los-angeles-dodgers": "#005A9C",
  "miami-marlins": "#00A3E0", "milwaukee-brewers": "#12284B",
  "minnesota-twins": "#002B5C", "new-york-mets": "#002D72",
  "new-york-yankees": "#0C2340", "oakland-athletics": "#003831",
  "philadelphia-phillies": "#E81828", "pittsburgh-pirates": "#FDB827",
  "san-diego-padres": "#2F241D", "san-francisco-giants": "#FD5A1E",
  "seattle-mariners": "#0C2C56", "st-louis-cardinals": "#C41E3A",
  "tampa-bay-rays": "#092C5C", "texas-rangers": "#003278",
  "toronto-blue-jays": "#134A8E", "washington-nationals": "#AB0003",
};

const titleCase = (value) => String(value || "").split("-")
  .map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");

export function getStatStackLogo(key) {
  const normalized = String(key || "");
  if (historical[normalized]) return `/stat-stack/historical/${historical[normalized]}`;
  if (normalized === "American League") return "/stat-stack/leagues/american-league.webp";
  if (normalized === "National League") return "/stat-stack/leagues/national-league.webp";
  return teamLogoMap[normalized] || null;
}

export const getStatStackLeagueLogo = getStatStackLogo;
export const hasStatStackLogo = (key) => Boolean(getStatStackLogo(key));

export function getStatStackLogoMetadata(key) {
  const normalized = String(key || "");
  const metadata = historicalMetadata[normalized];
  if (metadata) return {
    key: normalized, teamName: metadata[0], primaryColor: metadata[1],
    startYear: metadata[2], endYear: metadata[3],
  };
  if (!getStatStackLogo(normalized)) return null;
  return { key: normalized, teamName: titleCase(normalized), primaryColor: primaryColors[normalized] || "#A020F0" };
}

export function isStatStackLogoValidForSeason(key, season) {
  const metadata = historicalMetadata[String(key || "")];
  return metadata
    ? Number(season) >= metadata[2] && Number(season) <= metadata[3]
    : Boolean(getStatStackLogo(key));
}
