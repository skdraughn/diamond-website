export const positions = [
  { abbreviation: "P", name: "Pitcher", color: "#A879FF" },
  { abbreviation: "SP", name: "Starting Pitcher", color: "#A879FF" },
  { abbreviation: "RP", name: "Relief Pitcher", color: "#A879FF" },
  { abbreviation: "C", name: "Catcher", color: "#FF647C" },
  { abbreviation: "1B", name: "First Base", color: "#F6A623" },
  { abbreviation: "2B", name: "Second Base", color: "#F6A623" },
  { abbreviation: "3B", name: "Third Base", color: "#F6A623" },
  { abbreviation: "SS", name: "Shortstop", color: "#F6A623" },
  { abbreviation: "IF", name: "Infielder", color: "#F6A623" },
  { abbreviation: "LF", name: "Left Field", color: "#2ED39A" },
  { abbreviation: "CF", name: "Center Field", color: "#2ED39A" },
  { abbreviation: "RF", name: "Right Field", color: "#2ED39A" },
  { abbreviation: "OF", name: "Outfielder", color: "#2ED39A" },
  { abbreviation: "DH", name: "Designated Hitter", color: "#2BB7FF" },
];

export const abbreviationsToNameMap = positions.reduce((acc, position) => {
  acc[position.abbreviation] = position.name;
  return acc;
}, {});
export const abbreviationsToColorMap = positions.reduce((acc, position) => {
  acc[position.abbreviation] = position.color;
  return acc;
}, {});
