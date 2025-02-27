// src/lib/constants/apiRoutes.ts
export const API_ROUTES = {
  ACCOUNT:
    "https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id",
  SUMMONER: "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid",
  MATCHES: "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid",
  MATCH_DETAILS: "https://europe.api.riotgames.com/lol/match/v5/matches",
  LEAGUE: "https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner",
};

// src/lib/constants/gameConstants.ts
export const QUEUE_TYPES: Record<number, string> = {
  420: "Classée Solo/Duo",
  440: "Classée Flex",
  400: "Partie Normale (Draft)",
  430: "Partie Normale (Blind)",
  450: "ARAM",
  900: "URF",
  1010: "URF",
  1020: "One for All",
  700: "Clash",
};

// src/lib/api/riotService.ts
