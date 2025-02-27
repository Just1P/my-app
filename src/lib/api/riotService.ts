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
