// src/lib/utils/formatters.ts
/**
 * Formate la durée d'un match en minutes et secondes
 */
export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

/**
 * Formate une date de match
 */
export function formatGameDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calcule le KDA (Kills + Assists / Deaths)
 */
export function calculateKDA(
  kills: number,
  deaths: number,
  assists: number
): string {
  return ((kills + assists) / Math.max(1, deaths)).toFixed(2);
}

// src/lib/utils/errorHandling.ts
import { APIError } from "@/lib/api/baseApi";

/**
 * Gère les erreurs d'API et retourne un message utilisateur approprié
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.status) {
      case 404:
        return "Joueur introuvable. Vérifiez le nom et le tag.";
      case 429:
        return "Trop de requêtes. Veuillez réessayer dans quelques minutes.";
      case 403:
        return "Clé API non valide ou expirée.";
      default:
        return `Erreur serveur (${error.status}).`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue.";
}
