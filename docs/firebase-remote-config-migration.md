# Firebase Remote Config Migration

This project now prefers Firebase Remote Config for client configuration.

## Implemented In This Step

- Added Firebase Web SDK.
- Added env-driven Firebase app setup in `utils/firebaseClient.js`.
- Added Remote Config helpers in `utils/remoteConfig.js`.
- Switched `utils/useTriviaPlayers.js` from Truflag `playerfilename` to Firebase Remote Config `playerfilename`.
- Removed `TruflagProvider` from `app/layout.tsx`.
- Added `.env.local.example` with the Firebase public web config keys.

## Remote Config Parameters

Create these Firebase Remote Config parameters:

| Parameter key | Type | Default value | Purpose |
| --- | --- | --- | --- |
| `playerfilename` | String | Current public players JSON filename | Selects the S3 JSON file loaded by `useTriviaPlayers`. |
| `numstrikes` | String/Number | `3` | Reserved for migrating strike-count configuration next. |

For local testing before Firebase is configured, set:

```bash
NEXT_PUBLIC_PLAYERS_FILE_NAME=<known-public-players-file>.json
```

## Console Checklist

1. Create or open the Firebase project for Diamond Trivia.
2. Register a Web app and copy its Firebase config into `.env.local`.
3. Open **Remote Config** in Firebase.
4. Add `playerfilename` with the exact JSON filename currently served by the public S3 data bucket.
5. Add `numstrikes` with `3` or the desired default.
6. Publish the Remote Config template.
7. Restart `next dev` after changing `.env.local`.

## Follow-Up Migration

- Move Strikeout `numStrikes` flag/defaults to `numstrikes`.
- Remove `react-featureflags-client` and `components/TruflagProvider.tsx` after confirming no runtime imports remain.
- Mirror this migration in the React Native app when ready.
