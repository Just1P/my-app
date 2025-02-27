// src/components/features/profile/ProfileFavoriteButton.tsx
"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

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
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const handleToggle = () => {
    if (isFavorite(gameName, tagLine)) {
      removeFavorite(gameName, tagLine);
    } else {
      addFavorite(gameName, tagLine, profileIconId);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
      className={`absolute bottom-0 right-0 p-2 rounded-full transition-all duration-300 transform translate-x-1/4 translate-y-1/4 shadow-lg ${
        isFavorite(gameName, tagLine)
          ? "bg-pink-600 hover:bg-pink-700"
          : "bg-slate-700 hover:bg-slate-600"
      }`}
      aria-label={
        isFavorite(gameName, tagLine)
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
      title={
        isFavorite(gameName, tagLine)
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
    >
      <Heart
        className={`w-5 h-5 ${
          isFavorite(gameName, tagLine)
            ? "text-white fill-current"
            : "text-slate-300"
        }`}
      />
    </button>
  );
};

export default ProfileFavoriteButton;
