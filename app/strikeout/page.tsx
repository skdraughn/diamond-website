"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { generateClient } from "aws-amplify/api";
import useTriviaPlayers from "@/utils/useTriviaPlayers";
// ✅ Import Team Data
import { STATIC_TEAMS } from "@/utils/teams";
import { teamLogoMap } from "@/utils/teamLogoMap";
import Image from "next/image";
import { appLinks } from "@/utils/appLinks";

const APP_LINKS = appLinks;

// --- GraphQL Query ---
const customRedZoneGamesByDate = /* GraphQL */ `
  query RedZoneGamesByDate(
    $date: AWSDate!
    $filter: ModelRedZoneGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    redZoneGamesByDate(
      date: $date
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        date
        title
        subtitle
        numStrikes
        teamsHidden
        prompt
        cells {
          hint
          team
          teamID
          index
          answerPlayerID
          answerPlayerName
        }
      }
      nextToken
    }
  }
`;

// --- Helpers & Icons ---
const getTodayDate = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offsetMs);
  return local.toISOString().slice(0, 10);
};

function BackArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-red-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

// --- Components ---

const GameHeader = ({
  title,
  subtitle,
  score,
  strikes,
  numStrikes,
  prompt,
}: any) => (
  <div className="mb-6 space-y-4 text-center">
    <div className="flex items-center justify-between px-4">
      <Link
        href="/"
        className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <BackArrowIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
      </Link>
      <h1 className="text-xl font-bold tracking-tight text-red-600">
        STRIKEOUT
      </h1>
      <div className="w-10" />
    </div>

    <div>
      <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{prompt}</p>
    </div>

    <div className="flex items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Score
        </span>
        <span className="text-2xl font-black text-zinc-900 dark:text-white">
          {score}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Strikes
        </span>
        <div className="flex gap-1 mt-1">
          {[...Array(numStrikes)].map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full border border-red-600 ${
                i < strikes ? "bg-red-600" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ✅ Updated GridCell
const GridCell = ({
  hint,
  index,
  isRevealed,
  player,
  team,
  completed,
  answersShown,
  percent,
  shouldShowTeam,
}: any) => {
  const isMissed = completed && answersShown && !isRevealed;
  const showContent = isRevealed || isMissed;

  const baseStyles =
    "relative flex aspect-square w-full flex-col items-center justify-between rounded-md border p-1 text-center transition-all duration-300 overflow-hidden";

  let colorsClass =
    "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700";
  let hintColor = "text-zinc-500 dark:text-zinc-400";
  let nameColor = "text-zinc-900 dark:text-white";

  if (isRevealed) {
    colorsClass =
      "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20";
  } else if (isMissed) {
    colorsClass =
      "border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/20";
    hintColor = "text-red-500 dark:text-red-400";
    nameColor = "text-red-600 dark:text-red-300";
  }

  // Determine Logo
  // ✅ FIX: Added Type Assertion for teamLogoMap
  const logoSrc = team?.logoURL
    ? teamLogoMap[team.logoURL as keyof typeof teamLogoMap]
    : null;

  if (player) {
    if (player.n) {
      player["name"] = player.n;
    }
  }

  return (
    <div className={`${baseStyles} ${colorsClass}`}>
      {/* Top: Hint */}
      <div className="z-10 mt-0.5 w-full">
        <span
          className={`block text-[10px] font-bold uppercase leading-none tracking-tight ${hintColor} line-clamp-2`}
        >
          {hint}
        </span>
        {percent !== undefined && (
          <span className="block text-[9px] text-zinc-400 mt-0.5">
            {(percent * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Middle: Team Logo OR Fallback Abbr */}
      {((showContent && team) || shouldShowTeam) && (
        // Increased size to h-9 w-9 to fill larger cell better
        <div className="my-auto h-9 w-9 shrink-0 flex items-center justify-center relative">
          {logoSrc ? (
            // ✅ Background circle added so white logos pop
            <div className="relative w-full h-full bg-zinc-300 dark:bg-zinc-800 rounded-full p-1.5 flex items-center justify-center">
              <Image
                src={logoSrc}
                alt={team.name || "Team Logo"}
                fill
                className="object-contain p-0.5" // Slight padding inside
                sizes="40px"
              />
            </div>
          ) : (
            // Fallback to circle abbreviation if logo missing
            <div
              className={`flex h-full w-full items-center justify-center rounded-full border ${isMissed ? "bg-red-100 border-red-200" : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"}`}
            >
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                {team.abbreviation || "TM"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bottom: Player Name or ? */}
      <div className="z-10 mb-0.5 w-full h-[22px] flex items-end justify-center">
        {showContent && player ? (
          <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center w-full">
            <span
              className={`block text-[9px] font-bold uppercase leading-none ${nameColor} opacity-80`}
            >
              {player?.name?.split(" ")[0]}
            </span>
            <span
              className={`block text-[10px] font-extrabold uppercase leading-tight ${nameColor} truncate w-full px-0.5`}
            >
              {player?.name?.split(" ")?.slice(1)?.join(" ")}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 select-none pb-0.5">
            ?
          </span>
        )}
      </div>

      <span className="absolute top-0.5 left-1 text-[8px] text-zinc-300 dark:text-zinc-700 font-mono">
        {index + 1}
      </span>
    </div>
  );
};
// --- App Overlay Modal ---
const AppOverlay = ({
  isCompleted,
  appLinks,
  close,
  handleShare,
}: {
  isCompleted: boolean;
  appLinks: any;
  close: any;
  handleShare: any;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 scale-in-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <span className="text-3xl">{isCompleted ? "🏆" : "⚾"}</span>
      </div>

      <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
        {isCompleted ? "Perfect Game!" : "Nice Try!"}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        You can play daily games, track your stats, and compete on global
        leaderboards in the app.
      </p>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 py-4 text-base font-black text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-700 active:scale-95 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
          SHARE RESULTS
        </button>
        <a
          href={appLinks.appStore}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition-transform active:scale-95 dark:bg-white dark:text-black"
        >
          <span>Download on App Store</span>
        </a>
        <a
          href={appLinks.googlePlay}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-zinc-200 py-3 text-sm font-bold text-zinc-900 transition-transform active:scale-95 dark:border-zinc-700 dark:text-white"
        >
          <span>Get it on Google Play</span>
        </a>
      </div>

      <button
        onClick={() => close()}
        className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors"
      >
        Close & Review Board
      </button>
    </div>
  </div>
);

// --- Main Game Component ---

export default function RedZoneGame() {
  const client = useMemo(() => generateClient(), []);
  const date = getTodayDate();

  const { basicPlayers, loading: playersLoading } = useTriviaPlayers();

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState<Record<number, any>>({});

  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const isGameOver = game ? strikes >= (game.numStrikes || 3) : false;
  const isCompleted =
    game && game.cells
      ? Object.keys(matched).length === game.cells.length
      : false;
  const isFinished = isGameOver || isCompleted;

  const [showOverlay, setShowOverlay] = useState(false);

  const handleShare = async () => {
    // ✅ FIX: Ensure game exists to prevent TS null errors
    if (!game) return;

    const GREEN_BOX = "🟩";
    const RED_BOX = "🟥";
    const total = game.cells.length;

    // ✅ FIX: Typed arguments _ as any and index as number
    const emojiGrid = game.cells
      .map((_: any, index: number) => (matched[index] ? GREEN_BOX : RED_BOX))
      .join("");

    const shareText = `Diamond Trivia\nStrikeout\nScore: ${score}/${total}\nStrikes: ${strikes}\n\n${emojiGrid}\n\nPlay at: ${APP_LINKS.appStore}`;

    // ✅ FIX: Cast navigator to any to avoid "property share does not exist" errors
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "Diamond Trivia",
          text: shareText,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Results copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  // Trigger overlay when game ends
  useEffect(() => {
    if (isFinished) {
      // Small delay for better UX so they see the last "correct" animation
      const timer = setTimeout(() => setShowOverlay(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isFinished]);
  useEffect(() => {
    if (!date) return;
    const fetchGame = async () => {
      setLoading(true);
      try {
        let nextToken = null;
        let mainGTP = null;
        do {
          const res = await client.graphql({
            query: customRedZoneGamesByDate,
            variables: { date },
          }) as any;
          const items = res?.data?.redZoneGamesByDate?.items || [];
          nextToken = res?.data?.redZoneGamesByDate?.nextToken;
          mainGTP = items.find((g: any) => !g.adLocked);
        } while (nextToken && !mainGTP);

        if (mainGTP && mainGTP.cells) {
          mainGTP.cells.sort((a: any, b: any) => a.index - b.index);
        }
        setGame(mainGTP || null);
      } catch (err) {
        console.error("Error fetching GTP game:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [date, client]);

  useEffect(() => {
    if (!inputValue || inputValue.length < 2 || !basicPlayers) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const query = inputValue.toLowerCase().trim();
    const results = basicPlayers
      .filter((p: any) => (p.n ? p.n.toLowerCase().includes(query) : false))
      .slice(0, 10);
    setSearchResults(results);
    setShowResults(true);
  }, [inputValue, basicPlayers]);

  const handleGuess = (player: any) => {
    if (isFinished || !game) return;

    const alreadyMatched = Object.values(matched).some(
      (m: any) => m.player.id === player.id,
    );
    if (alreadyMatched) {
      setInputValue("");
      setShowResults(false);
      return;
    }

    const targetCell = game.cells.find(
      (c: any) => c.answerPlayerID === player.id,
    );

    if (targetCell) {
      setMatched((prev) => ({
        ...prev,
        [targetCell.index - 1]: {
          correct: true,
          player: { name: player.n, id: player.id },
        },
      }));
      setScore((prev) => prev + 1);
    } else {
      setStrikes((prev) => prev + 1);
    }

    setInputValue("");
    setShowResults(false);
  };

  if (loading || playersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <Spinner />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500">
        <p>
          {error ? "Error loading game." : "No RedZone game available today."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 font-sans">
      {showOverlay && (
        <div>
          <AppOverlay
            isCompleted={isCompleted}
            appLinks={APP_LINKS}
            close={() => setShowOverlay(false)}
            handleShare={handleShare}
          />
        </div>
      )}
      {/* ✅ Changed max-w-lg to max-w-2xl to make display wider */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 relative">
        <GameHeader
          title={game.title}
          subtitle={game.subtitle}
          score={score}
          strikes={strikes}
          prompt={game.prompt}
          numStrikes={game.numStrikes || 3}
        />

        <div className="grid w-full grid-cols-5 gap-2 mb-24">
          {game.cells?.map((cell: any, index: number) => {
            const isRevealed = !!matched[index];

            // ✅ Lookup Logic: Find team where cell.team matches any abbr
            const abbrToCheck = cell.team || cell.teamID;
            const fullTeam = STATIC_TEAMS.find((t) =>
              t.abbrs.includes(abbrToCheck),
            );

            // Fallback object if not found
            const cellTeam = fullTeam || { abbreviation: abbrToCheck || "TM" };

            const displayPlayer = isRevealed
              ? matched[index].player
              : basicPlayers.find(({ id }) => id === cell.answerPlayerID);

            return (
              <GridCell
                key={cell.index}
                index={index}
                hint={cell.hint}
                isRevealed={isRevealed}
                completed={isFinished}
                answersShown={isFinished}
                player={displayPlayer}
                team={cellTeam}
                percent={cell.percent}
                shouldShowTeam={game.teamsHidden < cell.index}
              />
            );
          })}
        </div>

        {/* Input & Dropdown */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-4 pb-8 z-50">
          <div className="mx-auto max-w-2xl relative">
            {showResults && !isFinished && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 max-h-60 overflow-y-auto overflow-x-hidden z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((player: any) => (
                    <button
                      key={player.id}
                      onClick={() => handleGuess(player)}
                      className="w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {player.n}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {player.s}-{player.e} • {player.p}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                          SELECT
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    No players found
                  </div>
                )}
              </div>
            )}

            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isFinished
                    ? isCompleted
                      ? "You Won!"
                      : "Game Over"
                    : "Guess a player..."
                }
                disabled={isFinished}
                className="block w-full rounded-full border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 text-base font-medium shadow-sm transition-all placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="off"
                autoCorrect="off"
              />

              {inputValue && !isFinished && (
                <button
                  onClick={() => {
                    setInputValue("");
                    setShowResults(false);
                  }}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  <span className="text-xs font-bold uppercase bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                    Clear
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
