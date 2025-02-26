import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { FavoritePlayer } from "./Favorites";

interface ProfileFavoriteButtonProps {
  gameName: string;
  tagLine: string;
  profileIconId?: number;
}

const ProfileFavoriteButton: React.FC<ProfileFavoriteButtonProps> = ({
  gameName,
  tagLine,
  profileIconId,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Vérifier si le joueur est déjà dans les favoris au chargement
  useEffect(() => {
    const checkIfFavorite = () => {
      const savedFavorites = localStorage.getItem("lol-favorites");
      if (savedFavorites) {
        try {
          const favorites: FavoritePlayer[] = JSON.parse(savedFavorites);
          const isAlreadyFavorite = favorites.some(
            (f) =>
              f.gameName.toLowerCase() === gameName.toLowerCase() &&
              f.tagLine.toLowerCase() === tagLine.toLowerCase()
          );
          setIsFavorite(isAlreadyFavorite);
        } catch (e) {
          console.error("Erreur lors du chargement des favoris:", e);
          setIsFavorite(false);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkIfFavorite();
  }, [gameName, tagLine]);

  const toggleFavorite = () => {
    // Récupérer les favoris actuels
    const savedFavorites = localStorage.getItem("lol-favorites");
    let favorites: FavoritePlayer[] = [];

    if (savedFavorites) {
      try {
        favorites = JSON.parse(savedFavorites);
      } catch (e) {
        console.error("Erreur lors du parsing des favoris:", e);
        favorites = [];
      }
    }

    // Vérifier si le joueur existe déjà
    const existingIndex = favorites.findIndex(
      (f) =>
        f.gameName.toLowerCase() === gameName.toLowerCase() &&
        f.tagLine.toLowerCase() === tagLine.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Supprimer le joueur des favoris
      favorites.splice(existingIndex, 1);
      setIsFavorite(false);
    } else {
      // Ajouter le joueur aux favoris
      const newFavorite: FavoritePlayer = {
        id: `${gameName.toLowerCase()}-${tagLine.toLowerCase()}`,
        gameName: gameName,
        tagLine: tagLine.startsWith("#") ? tagLine.substring(1) : tagLine,
        lastSearched: Date.now(),
        profileIconId,
      };
      favorites.push(newFavorite);
      setIsFavorite(true);
    }

    // Sauvegarder les favoris mis à jour
    localStorage.setItem("lol-favorites", JSON.stringify(favorites));
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Empêche la propagation du clic
        toggleFavorite();
      }}
      className={`absolute bottom-0 right-0 p-2 rounded-full transition-all duration-300 transform translate-x-1/4 translate-y-1/4 shadow-lg ${
        isFavorite
          ? "bg-pink-600 hover:bg-pink-700"
          : "bg-slate-700 hover:bg-slate-600"
      }`}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`w-5 h-5 ${
          isFavorite ? "text-white fill-current" : "text-slate-300"
        }`}
      />
    </button>
  );
};

export default ProfileFavoriteButton;
