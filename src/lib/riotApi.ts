const API_KEY = process.env.NEXT_PUBLIC_RIOT_API_KEY;

// Endpoints Riot API
const BASE_ACCOUNT_URL =
  "https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id";
const BASE_SUMMONER_URL =
  "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid";
const BASE_MATCH_URL =
  "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid";
const BASE_MATCH_DETAILS_URL =
  "https://europe.api.riotgames.com/lol/match/v5/matches";
const BASE_LEAGUE_URL =
  "https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner";

/**
 * 🔎 Recherche un joueur via son Riot ID (Game Name + Tag)
 */
export const searchSummoners = async (gameName: string, tagLine: string) => {
  try {
    const res = await fetch(
      `${BASE_ACCOUNT_URL}/${gameName}/${tagLine}?api_key=${API_KEY}`
    );

    if (!res.ok) throw new Error("Aucun joueur trouvé");

    const data = await res.json();
    return {
      gameName: data.gameName,
      tagLine: data.tagLine,
      puuid: data.puuid,
    };
  } catch (error) {
    console.error("Erreur dans searchSummoners:", error);
    return null;
  }
};

/**
 * 📊 Récupère le classement d'un joueur (SoloQ)
 */
export const getSummonerRank = async (summonerId: string) => {
  try {
    const rankRes = await fetch(
      `${BASE_LEAGUE_URL}/${summonerId}?api_key=${API_KEY}`
    );
    if (!rankRes.ok) return null;

    const rankData = await rankRes.json();
    return rankData.length > 0 ? rankData[0] : null;
  } catch (error) {
    console.error("Erreur dans getSummonerRank:", error);
    return null;
  }
};

/**
 * 🎮 Récupère les détails du joueur (PUUID, niveau, icône, classement)
 */
export const getSummonerData = async (gameName: string, tagLine: string) => {
  try {
    console.log(`🔍 Recherche du joueur : ${gameName}#${tagLine}`);

    // 1️⃣ Récupérer le PUUID via Riot ID
    const accountData = await searchSummoners(gameName, tagLine);
    if (!accountData) throw new Error("Joueur introuvable");

    const { puuid } = accountData;
    console.log("✅ PUUID trouvé :", puuid);

    // 2️⃣ Récupérer les infos de l'invocateur
    const summonerRes = await fetch(
      `${BASE_SUMMONER_URL}/${puuid}?api_key=${API_KEY}`
    );

    if (!summonerRes.ok)
      throw new Error("Impossible de récupérer les infos du joueur");

    const summonerData = await summonerRes.json();
    console.log("✅ Infos de l'invocateur :", summonerData);

    // 3️⃣ Récupérer le classement (SoloQ)
    const rankData = await getSummonerRank(summonerData.id);

    // 4️⃣ Récupérer l'historique des 10 derniers matchs
    const matchRes = await fetch(
      `${BASE_MATCH_URL}/${puuid}/ids?start=0&count=18&api_key=${API_KEY}`
    );

    if (!matchRes.ok)
      throw new Error("Impossible de récupérer l'historique des parties");

    const matchIds = await matchRes.json();

    // 5️⃣ Récupérer les détails des 10 derniers matchs
    const matchDetails = await Promise.all(
      matchIds.map(async (matchId: string) => {
        const matchDetailRes = await fetch(
          `${BASE_MATCH_DETAILS_URL}/${matchId}?api_key=${API_KEY}`
        );
        if (!matchDetailRes.ok) return null;

        const matchData = await matchDetailRes.json();
        return matchData;
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
};
