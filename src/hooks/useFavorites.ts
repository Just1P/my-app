import { useState, useEffect } from "react";
import { FavoritePlayer } from "@/components/Favorites";

const FAVORITES_KEY = "lol-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePlayer[]>([]);

  // Charger les favoris depuis le localStorage au montage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Erreur lors du chargement des favoris:", e);
        localStorage.removeItem(FAVORITES_KEY);
        setFavorites([]);
      }
    }
  }, []);

  // Mettre à jour le localStorage à chaque changement de favoris
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (gameName: string, tagLine: string) => {
    return favorites.some(
      (f) =>
        f.gameName.toLowerCase() === gameName.toLowerCase() &&
        f.tagLine.toLowerCase() === tagLine.toLowerCase()
    );
  };

  const addFavorite = (
    gameName: string,
    tagLine: string,
    profileIconId?: number
  ) => {
    if (isFavorite(gameName, tagLine)) return;

    const newFavorite: FavoritePlayer = {
      id: `${gameName.toLowerCase()}-${tagLine.toLowerCase()}`,
      gameName,
      tagLine: tagLine.startsWith("#") ? tagLine.substring(1) : tagLine,
      lastSearched: Date.now(),
      profileIconId,
    };

    setFavorites([...favorites, newFavorite]);
  };

  const removeFavorite = (gameName: string, tagLine: string) => {
    setFavorites(
      favorites.filter(
        (f) =>
          f.gameName.toLowerCase() !== gameName.toLowerCase() ||
          f.tagLine.toLowerCase() !== tagLine.toLowerCase()
      )
    );
  };

  return { favorites, isFavorite, addFavorite, removeFavorite };
}
