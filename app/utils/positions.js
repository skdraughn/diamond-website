export const positions = [
  { abbreviation: "P", name: "Pitcher", color: "#1864ab" },
  { abbreviation: "C", name: "Catcher", color: "#0b7285" },
  { abbreviation: "1B", name: "First Baseman", color: "#2f9e44" },
  { abbreviation: "2B", name: "Second Baseman", color: "#5c940d" },
  { abbreviation: "3B", name: "Third Baseman", color: "#66a80f" },
  { abbreviation: "SS", name: "Shortstop", color: "#5f3dc4" },
  { abbreviation: "LF", name: "Left Fielder", color: "#d9480f" },
  { abbreviation: "CF", name: "Center Fielder", color: "#e67700" },
  { abbreviation: "RF", name: "Right Fielder", color: "#c92a2a" },
  { abbreviation: "OF", name: "Outfielder", color: "#1ea684" },
  { abbreviation: "DH", name: "Designated Hitter", color: "#9c36b5" },
  { abbreviation: "PH", name: "Pinch Hitter", color: "#d6336c" },
  { abbreviation: "PR", name: "Pinch Runner", color: "#a61e4d" },
];

export const abbreviationsToColorMap = positions.reduce((acc, position) => {
  acc[position.abbreviation] = position.color;
  return acc;
}, {});
