import Link from "next/link";
import styles from "./siteShell.module.css";
const games = [
  {
    "name": "Strikeout",
    "href": "/strikeout",
    "description": "Use the stat clues to find MLB players who fit each square. Strikeout is a daily test of how well you know players and their careers."
  },
  {
    "name": "162-0",
    "href": "/162-0",
    "description": "Draft players from random MLB teams and decades, fill five roster spots, and see your projected record. Aim for an undefeated 162-0 season."
  },
  {
    "name": "Reverse Immaculate",
    "href": "/reverseimmaculate",
    "description": "The players are already in the grid. Work out the missing MLB teams by finding the connections across each row and column."
  },
  {
    "name": "Higher Lower",
    "href": "/higherlower",
    "description": "Compare two MLB players and choose who has the higher value for the displayed stat. Keep making correct picks to build your score."
  },
  {
    "name": "Stat Stack",
    "href": "/statstack",
    "description": "Fill five stacks with unique player-seasons that satisfy their row. Your score depends on the featured stat shown at the top of the game."
  }
];
export default function HomeGameGuide() {
 return <section className={styles.guide} aria-labelledby="game-guide-heading">
  <h2 id="game-guide-heading">Find Your Next Baseball Trivia Game</h2>
  <p className={styles.guideIntro}>Start with player clues, try a team grid, or put your knowledge of MLB statistics to work. Each game tests a different part of baseball history.</p>
  <div className={styles.guideList}>{games.map(game=><section key={game.href}><h3><Link href={game.href}>{game.name === "162-0" ? "162-0 MLB Draft Game" : game.name}</Link></h3><p>{game.description}</p></section>)}</div>
 </section>;
}
