// src/lib/constants/gameConstants.ts

/**
 * Mapping des identifiants de file d'attente (queueId) vers des noms lisibles
 * Ces identifiants sont fournis par l'API Riot dans les données de match
 */
export const QUEUE_TYPES: Record<number, string> = {
  // Files d'attente classées
  420: "Classée Solo/Duo",
  440: "Classée Flex",

  // Files d'attente normales
  400: "Partie Normale (Draft)",
  430: "Partie Normale (Blind)",

  // Modes de jeu spéciaux
  450: "ARAM",
  900: "URF",
  1010: "URF",
  1020: "One for All",
  700: "Clash",

  // Autres modes
  830: "Co-op vs IA (Intro)",
  840: "Co-op vs IA (Débutant)",
  850: "Co-op vs IA (Intermédiaire)",
  1400: "Ultime Spellbook",
  1200: "Nexus Blitz",
  1300: "Nexus Blitz",
  1700: "Arena",
  1090: "TFT Normal",
  1100: "TFT Classée",
  1110: "TFT Tutoriel",
  1130: "TFT Hyperbolic",
  1160: "TFT Double Up",
};

/**
 * Positions standard sur la carte (rôles en jeu)
 */
export const POSITIONS = {
  TOP: "TOP",
  JUNGLE: "JUNGLE",
  MIDDLE: "MIDDLE",
  BOTTOM: "BOTTOM",
  SUPPORT: "SUPPORT",
  FILL: "FILL",
};

/**
 * Durées types de parties en secondes (pour les statistiques et filtrages)
 */
export const GAME_DURATIONS = {
  SHORT: 15 * 60, // 15 minutes (early surrender)
  AVERAGE: 25 * 60, // 25 minutes
  LONG: 35 * 60, // 35 minutes
};

/**
 * Niveaux de vision score (pour les évaluations de performance)
 */
export const VISION_SCORE_LEVELS = {
  POOR: 15,
  AVERAGE: 25,
  GOOD: 35,
  EXCELLENT: 50,
};

/**
 * Seuils pour les CS par minute (dernière touche sur minions)
 */
export const CS_PER_MIN_THRESHOLDS = {
  LOW: 5,
  AVERAGE: 7,
  HIGH: 8.5,
  EXCEPTIONAL: 10,
};

/**
 * Niveaux de KDA (Kills + Assists / Deaths)
 */
export const KDA_LEVELS = {
  POOR: 1.5,
  AVERAGE: 2.5,
  GOOD: 3.5,
  EXCELLENT: 5,
  PERFECT: 10, // Utilisé quand le joueur n'a pas de morts
};

/**
 * URL de base pour les images de champions, objets, etc.
 */
export const RIOT_IMAGE_URLS = {
  CHAMPION: "https://ddragon.leagueoflegends.com/cdn/15.4.1/img/champion/",
  CHAMPION_SPLASH:
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/",
  PROFILE_ICON:
    "https://ddragon.leagueoflegends.com/cdn/15.4.1/img/profileicon/",
  ITEM: "https://ddragon.leagueoflegends.com/cdn/15.4.1/img/item/",
  SPELL: "https://ddragon.leagueoflegends.com/cdn/15.4.1/img/spell/",
};

/**
 * Types de parties pour les filtres de l'interface utilisateur
 */
export const GAME_TYPE_FILTERS = [
  { id: "Tous", label: "Tous les types" },
  { id: "Ranked", label: "Classées" },
  { id: "Normal", label: "Normales" },
  { id: "ARAM", label: "ARAM" },
  { id: "Special", label: "Modes spéciaux" },
];

/**
 * Couleurs pour les graphiques (correspondant au thème de l'application)
 */
export const CHART_COLORS = {
  kda: "#4ade80", // vert
  cs: "#f59e0b", // orange
  vision: "#3b82f6", // bleu
  damage: "#ec4899", // rose
  win: "#10b981", // turquoise
  loss: "#ef4444", // rouge
  average: "#94a3b8", // gris
  blue: "#1e3a8a", // bleu foncé (équipe bleue)
  red: "#991b1b", // rouge foncé (équipe rouge)
};

/**
 * Équipes dans un match
 */
export const TEAMS = {
  BLUE: 100,
  RED: 200,
};

/**
 * Limite par défaut du nombre de matchs à afficher
 */
export const DEFAULT_MATCH_COUNT = 10;

/**
 * Constantes pour le système de favoris
 */
export const FAVORITES = {
  STORAGE_KEY: "lol-favorites",
  MAX_FAVORITES: 20,
};
