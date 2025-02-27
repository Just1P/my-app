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

// src/lib/api/baseApi.ts
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const API_KEY = process.env.NEXT_PUBLIC_RIOT_API_KEY;

  // Construire les paramètres de requête
  const queryParams = new URLSearchParams(params);
  queryParams.append("api_key", API_KEY || "");

  try {
    const response = await fetch(`${endpoint}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new APIError(`API error: ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// src/lib/api/riotService.ts
import { apiRequest, APIError } from "@/lib/api/baseApi";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import type { Summoner, Match } from "@/types/riotTypes";

export const riotService = {
  /**
   * Recherche un joueur par son Riot ID
   */
  searchSummoners: async (gameName: string, tagLine: string) => {
    try {
      return await apiRequest<{
        gameName: string;
        tagLine: string;
        puuid: string;
      }>(`${API_ROUTES.ACCOUNT}/${gameName}/${tagLine}`);
    } catch (error) {
      console.error("Erreur dans searchSummoners:", error);
      return null;
    }
  },

  /**
   * Récupère le classement d'un joueur
   */
  getSummonerRank: async (summonerId: string) => {
    try {
      const rankData = await apiRequest<any[]>(
        `${API_ROUTES.LEAGUE}/${summonerId}`
      );
      return rankData.length > 0 ? rankData[0] : null;
    } catch (error) {
      console.error("Erreur dans getSummonerRank:", error);
      return null;
    }
  },

  /**
   * Récupère les détails d'un joueur et son historique de matchs
   */
  getSummonerData: async (gameName: string, tagLine: string) => {
    try {
      console.log(`🔍 Recherche du joueur : ${gameName}#${tagLine}`);

      // 1. Récupérer le PUUID via Riot ID
      const accountData = await riotService.searchSummoners(gameName, tagLine);
      if (!accountData) throw new Error("Joueur introuvable");

      const { puuid } = accountData;
      console.log("✅ PUUID trouvé :", puuid);

      // 2. Récupérer les infos de l'invocateur
      const summonerData = await apiRequest<any>(
        `${API_ROUTES.SUMMONER}/${puuid}`
      );
      console.log("✅ Infos de l'invocateur :", summonerData);

      // 3. Récupérer le classement (SoloQ)
      const rankData = await riotService.getSummonerRank(summonerData.id);

      // 4. Récupérer l'historique des matchs
      const matchIds = await apiRequest<string[]>(
        `${API_ROUTES.MATCHES}/${puuid}/ids`,
        { start: "0", count: "18" }
      );

      // 5. Récupérer les détails des matchs
      const matchDetails = await Promise.all(
        matchIds.map(async (matchId: string) => {
          try {
            return await apiRequest<Match>(
              `${API_ROUTES.MATCH_DETAILS}/${matchId}`
            );
          } catch (error) {
            console.error(
              `Erreur lors de la récupération du match ${matchId}:`,
              error
            );
            return null;
          }
        })
      );

      return {
        name: accountData.gameName,
        tag: accountData.tagLine,
        puuid: puuid,
        profileIconId: summonerData.profileIconId,
        summonerLevel: summonerData.summonerLevel,
        rank: rankData
          ? {
              tier: rankData.tier,
              rank: rankData.rank,
              lp: rankData.leaguePoints,
              wins: rankData.wins,
              losses: rankData.losses,
            }
          : null,
        matches: matchDetails.filter((match) => match !== null),
      };
    } catch (error) {
      console.error("❌ Erreur dans getSummonerData:", error);
      return null;
    }
  },
};
