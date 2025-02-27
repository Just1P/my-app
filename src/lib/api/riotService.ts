// src/lib/api/enhancedRiotService.ts
import { apiRequest, APIError } from "@/lib/api/baseApi";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { cacheService, generateCacheKey } from "@/lib/utils/cacheService";
import type { Summoner, Match } from "@/types/riotTypes";

// Cache durations in milliseconds
const CACHE_DURATIONS = {
  SUMMONER: 15 * 60 * 1000, // 15 minutes
  MATCH_HISTORY: 10 * 60 * 1000, // 10 minutes
  MATCH_DETAILS: 60 * 60 * 1000, // 1 hour (matches don't change)
};

export const enhancedRiotService = {
  /**
   * Recherche un joueur par son Riot ID (avec cache)
   */
  searchSummoners: async (gameName: string, tagLine: string) => {
    const cacheKey = generateCacheKey('account', gameName, tagLine);
    const cachedData = cacheService.get<{
      gameName: string;
      tagLine: string;
      puuid: string;
    }>(cacheKey);
    
    if (cachedData) {
      console.log('Using cached account data');
      return cachedData;
    }
    
    try {
      const accountData = await apiRequest<{
        gameName: string;
        tagLine: string;
        puuid: string;
      }>(`${API_ROUTES.ACCOUNT}/${gameName}/${tagLine}`);
      
      // Cache the result
      cacheService.set(cacheKey, accountData, CACHE_DURATIONS.SUMMONER);
      
      return accountData;
    } catch (error) {
      console.error("Erreur dans searchSummoners:", error);
      return null;
    }
  },

  /**
   * Récupère le classement d'un joueur (avec cache)
   */
  getSummonerRank: async (summonerId: string) => {
    const cacheKey = generateCacheKey('rank', summonerId);
    const cachedData = cacheService.get<any[]>(cacheKey);
    
    if (cachedData) {
      console.log('Using cached rank data');
      return cachedData.length > 0 ? cachedData[0] : null;
    }
    
    try {
      const rankData = await apiRequest<any[]>(
        `${API_ROUTES.LEAGUE}/${summonerId}`
      );
      
      // Cache the result
      cacheService.set(cacheKey, rankData, CACHE_DURATIONS.SUMMONER);
      
      return rankData.length > 0 ? rankData[0] : null;
    } catch (error) {
      console.error("Erreur dans getSummonerRank:", error);
      return null;
    }
  },

  /**
   * Récupère les détails d'un joueur et son historique de matchs (avec cache)
   */
  getSummonerData: async (gameName: string, tagLine: string) => {
    const summonerCacheKey = generateCacheKey('summoner', gameName, tagLine);
    const cachedSummoner = cacheService.get<Summoner>(summonerCacheKey);
    
    if (cachedSummoner) {
      console.log('Using cached summoner data');
      return cachedSummoner;
    }
    
    try {
      console.log(`🔍 Recherche du joueur : ${gameName}#${tagLine}`);

      // 1. Récupérer le PUUID via Riot ID
      const accountData = await enhancedRiotService.searchSummoners(gameName, tagLine);
      if (!accountData) throw new Error("Joueur introuvable");

      const { puuid } = accountData;
      console.log("✅ PUUID trouvé :", puuid);

      // 2. Récupérer les infos de l'invocateur
      const summonerData = await apiRequest<any>(
        `${API_ROUTES.SUMMONER}/${puuid}`
      );
      console.log("✅ Infos de l'invocateur :", summonerData);

      // 3. Récupérer le classement (SoloQ)
      const rankData = await enhancedRiotService.getSummonerRank(summonerData.id);

      // 4. Récupérer l'historique des matchs
      const matchIdsCacheKey = generateCacheKey('matchIds', puuid);
      let matchIds = cacheService.get<string[]>(matchIdsCacheKey);

      if (!matchIds) {
        matchIds = await apiRequest<string[]>(
          `${API_ROUTES.MATCHES}/${puuid}/ids`,
          { start: "0", count: "18" }
        );
        cacheService.set(matchIdsCacheKey, matchIds, CACHE_DURATIONS.MATCH_HISTORY);
      }

      // 5. Récupérer les détails des matchs (avec cache individuel par match)
      const matchDetails = await Promise.all(
        matchIds.map(async (matchId: string) => {
          const matchCacheKey = generateCacheKey('match', matchId);
          const cachedMatch = cacheService.get<Match>(matchCacheKey);
          
          if (cachedMatch) {
            return cachedMatch;
          }
          
          try {
            const matchData = await apiRequest<Match>(
              `${API_ROUTES.MATCH_DETAILS}/${matchId}`
            );
            
            // Les détails de match ne changent jamais, donc on peut les mettre en cache plus longtemps
            cacheService.set(matchCacheKey, matchData, CACHE_DURATIONS.MATCH_DETAILS);
            
            return matchData;
          } catch (error) {
            console.error(
              `Erreur lors de la récupération du match ${matchId}:`,
              error
            );
            return null;
          }
        })
      );

      const summonerResult = {
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

      // Cache the complete summoner data
      cacheService.set(summonerCacheKey, summonerResult, CACHE_DURATIONS.SUMMONER);

      return summonerResult;
    } catch (error) {
      console.error("❌ Erreur dans getSummonerData:", error);
      return null;
    }
  },
  
  /**
   * Efface le cache pour un invocateur spécifique
   */
  clearSummonerCache: (gameName: string, tagLine: string) => {
    const summonerCacheKey = generateCacheKey('summoner', gameName, tagLine);
    cacheService.remove(summonerCacheKey);
  }
};