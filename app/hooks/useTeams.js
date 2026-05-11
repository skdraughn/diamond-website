import { STATIC_TEAMS } from "@/utils/teams";

export default function useTeams() {
  return {
    teams: STATIC_TEAMS,
    loading: false,
    refresh: () => {},
  };
}
