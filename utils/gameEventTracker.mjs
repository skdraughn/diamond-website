// Analytics state is separate from saved gameplay. Never let tracking failures affect a game.
export function createGameEventTracker({ send, app, game, gameId, playMode = "daily", storage, retry = false }) {
  let active = false;
  let finished = false;
  let startedAt = null;
  let remembered = null;
  const key = gameId ? `analytics-attempt:${app}:${game}:${gameId}` : null;
  const read = () => { try { return key ? JSON.parse(storage?.getItem(key) || "null") : remembered; } catch { return remembered; } };
  const write = (value) => { remembered = value; try { if (key) storage?.setItem(key, JSON.stringify(value)); } catch {} };
  const emit = (name, details) => { try { Promise.resolve(send(name, { app, game, play_mode: playMode, ...details })).catch(() => {}); } catch {} };
  return {
    start() {
      if (active || finished) return;
      active = true;
      const previous = retry ? null : read();
      startedAt = previous?.startedAt || Date.now();
      if (!previous?.startedAt || previous?.finished) {
        startedAt = Date.now();
        emit("game_start", {});
      }
      write({ startedAt, finished: false });
    },
    complete(details = {}) {
      // Restoring a completed board must not count as another completed game.
      if (!active || finished) return;
      finished = true;
      write({ startedAt, finished: true });
      emit("game_complete", { duration_ms: Math.max(0, Date.now() - startedAt), ...details });
    },
    reset() { active = false; finished = false; startedAt = null; retry = true; },
  };
}
