// Interfaces pour les données Riot API
export interface Summoner {
  profileIconId: number;
  name: string;
  tag: string;
  puuid: string;
  summonerLevel: number;
  rank?: {
    tier: string;
    rank: string;
    lp: number;
    wins: number;
    losses: number;
  } | null;
  matches: Match[];
}

export interface Match {
  metadata: MatchMetadata;
  info: MatchInfo;
}

export interface MatchMetadata {
  matchId: string;
  participants: string[]; // PUUIDs
}

export interface MatchInfo {
  gameCreation: number; // timestamp
  gameDuration: number; // en secondes
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  queueId: number;
  participants: Participant[];
  platformId: string;
  teams: Team[];
}

export interface Team {
  teamId: number; // 100 pour équipe bleue, 200 pour équipe rouge
  win: boolean;
  bans: Ban[];
  objectives: Objectives;
}

export interface Ban {
  championId: number;
  pickTurn: number;
}

export interface Objectives {
  baron: Objective;
  champion: Objective;
  dragon: Objective;
  inhibitor: Objective;
  riftHerald: Objective;
  tower: Objective;
}

export interface Objective {
  first: boolean;
  kills: number;
}

export interface Participant {
  assists: number;
  baronKills: number;
  bountyLevel: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string;
  championTransform: number;
  consumablesPurchased: number;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  goldEarned: number;
  goldSpent: number;
  individualPosition: string;
  inhibitorKills: number;
  inhibitorTakedowns: number;
  inhibitorsLost: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  itemsPurchased: number;
  killingSprees: number;
  kills: number;
  lane: string;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  neutralMinionsKilled: number;
  nexusKills: number;
  nexusTakedowns: number;
  nexusLost: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  participantId: number;
  pentaKills: number;
  perks: Perks;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName?: string;
  riotIdTagline?: string;
  role: string;
  sightWardsBoughtInGame: number;
  spell1Casts: number;
  spell2Casts: number;
  spell3Casts: number;
  spell4Casts: number;
  summoner1Casts: number;
  summoner1Id: number;
  summoner2Casts: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string;
  teamEarlySurrendered: boolean;
  teamId: number; // 100 pour équipe bleue, 200 pour équipe rouge
  teamPosition: string;
  timeCCingOthers: number;
  timePlayed: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageShieldedOnTeammates: number;
  totalDamageTaken: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalTimeSpentDead: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretTakedowns: number;
  turretsLost: number;
  unrealKills: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

export interface Perks {
  statPerks: {
    defense: number;
    flex: number;
    offense: number;
  };
  styles: [
    {
      description: string;
      selections: [
        {
          perk: number;
          var1: number;
          var2: number;
          var3: number;
        }
      ];
      style: number;
    }
  ];
}

// Types pour les fonctions d'API
export type SearchSummonersFunction = (
  gameName: string,
  tagLine: string
) => Promise<{
  gameName: string;
  tagLine: string;
  puuid: string;
} | null>;

export type GetSummonerDataFunction = (
  gameName: string,
  tagLine: string
) => Promise<Summoner | null>;
