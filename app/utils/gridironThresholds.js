export const gridironThresholds = {
  halloffame4: 170000,
  halloffame3: 150000,
  halloffame2: 135000,
  halloffame1: 120000,
  mvp4: 105000,
  mvp3: 95000,
  mvp2: 85000,
  mvp1: 75000,
  superstar4: 65000,
  superstar3: 60000,
  superstar2: 55000,
  superstar1: 50000,
  captain4: 45900,
  captain3: 43800,
  captain2: 41700,
  captain1: 39600,
  allpro4: 37500,
  allpro3: 35400,
  allpro2: 33300,
  allpro1: 31200,
  star4: 29100,
  star3: 27000,
  star2: 24900,
  star1: 22800,
  starter4: 20700,
  starter3: 18600,
  starter2: 16500,
  starter1: 14400,
  backup4: 12300,
  backup3: 10500,
  backup2: 8700,
  backup1: 6900,
  rookie4: 5400,
  rookie3: 3900,
  rookie2: 2700,
  rookie1: 1800,
  prospect4: 1200,
  prospect3: 600,
  prospect2: 250,
  prospect1: 0,
};

const badgeImages = {
  halloffame4: "/rank_badges/mvp4.png",
  halloffame3: "/rank_badges/mvp3.png",
  halloffame2: "/rank_badges/mvp2.png",
  halloffame1: "/rank_badges/mvp1.png",
  superstar4: "/rank_badges/halloffame4.png",
  superstar3: "/rank_badges/halloffame3.png",
  superstar2: "/rank_badges/halloffame2.png",
  superstar1: "/rank_badges/halloffame1.png",
  mvp4: "/rank_badges/superstar4.png",
  mvp3: "/rank_badges/superstar3.png",
  mvp2: "/rank_badges/superstar2.png",
  mvp1: "/rank_badges/superstar1.png",
  captain4: "/rank_badges/captain4.png",
  captain3: "/rank_badges/captain3.png",
  captain2: "/rank_badges/captain2.png",
  captain1: "/rank_badges/captain1.png",
  allpro4: "/rank_badges/allmlb4.png",
  allpro3: "/rank_badges/allmlb3.png",
  allpro2: "/rank_badges/allmlb2.png",
  allpro1: "/rank_badges/allmlb1.png",
  star4: "/rank_badges/star4.png",
  star3: "/rank_badges/star3.png",
  star2: "/rank_badges/star2.png",
  star1: "/rank_badges/star1.png",
  starter4: "/rank_badges/starter4.png",
  starter3: "/rank_badges/starter3.png",
  starter2: "/rank_badges/starter2.png",
  starter1: "/rank_badges/starter1.png",
  backup4: "/rank_badges/backup4.png",
  backup3: "/rank_badges/backup3.png",
  backup2: "/rank_badges/backup2.png",
  backup1: "/rank_badges/backup1.png",
  rookie4: "/rank_badges/rookie4.png",
  rookie3: "/rank_badges/rookie3.png",
  rookie2: "/rank_badges/rookie2.png",
  rookie1: "/rank_badges/rookie1.png",
  prospect4: "/rank_badges/prospect4.png",
  prospect3: "/rank_badges/prospect3.png",
  prospect2: "/rank_badges/prospect2.png",
  prospect1: "/rank_badges/prospect1.png",
};

const sortedRanks = Object.entries(gridironThresholds).sort((a, b) => b[1] - a[1]);

export function getCurrentRank(gridiron = 0) {
  return sortedRanks.find(([, threshold]) => gridiron >= threshold)?.[0] || "prospect1";
}

export function formatRank(rank) {
  if (!rank) return "";
  return rank
    .replace(/(\D+)(\d+)/, (_, word, number) => {
      return `${word.charAt(0).toUpperCase()}${word.slice(1)} ${number}`;
    })
    .replace("Halloffame", "Hall of Fame")
    .replace("Mvp", "MVP")
    .replace("Allpro", "All MLB");
}

export function getCurrentBadge(gridiron = 0) {
  return badgeImages[getCurrentRank(gridiron)] || badgeImages.prospect1;
}
