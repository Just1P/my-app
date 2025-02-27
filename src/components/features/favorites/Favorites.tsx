// src/components/features/favorites/Favorites.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useFavorites } from "@/context/FavoritesContext";
import { FavoritePlayer } from "@/types/riotTypes";

interface FavoritesProps {
  onSelectPlayer: (gameName: string, tagLine: string) => void;
  currentGameName?: string;
  currentTagLine?: string;
  profileIconId?: number;
}

const Favorites: React.FC<FavoritesProps> = ({
  onSelectPlayer,
  currentGameName,
  currentTagLine,
  profileIconId,
}) => {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="text-center p-2">
        <p className="text-sm text-slate-400">
          Aucun favori. Ajoutez des joueurs en cliquant sur l'icône ❤️
        </p>
      </div>
    );
  }

  // Trier les favoris par date de dernière recherche (plus récents en premier)
  const sortedFavorites = [...favorites].sort(
    (a, b) => b.lastSearched - a.lastSearched
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-blue-300">Favoris</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sortedFavorites.map((favorite) => (
          <button
            key={favorite.id}
            onClick={() => onSelectPlayer(favorite.gameName, favorite.tagLine)}
            className={`flex items-center p-2 rounded-lg transition-all ${
              currentGameName?.toLowerCase() ===
                favorite.gameName.toLowerCase() &&
              currentTagLine?.toLowerCase() === favorite.tagLine.toLowerCase()
                ? "bg-blue-700/50 border border-blue-500"
                : "bg-slate-800/50 hover:bg-slate-700/50"
            }`}
          >
            {favorite.profileIconId ? (
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/profileicon/${favorite.profileIconId}.png`}
                alt={favorite.gameName}
                className="w-8 h-8 rounded-full mr-2"
                width={32}
                height={32}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 mr-2 flex items-center justify-center">
                <span className="text-xs">{favorite.gameName[0]}</span>
              </div>
            )}
            <div className="text-left overflow-hidden">
              <div className="text-xs font-medium truncate w-full">
                {favorite.gameName}
              </div>
              <div className="text-xs text-slate-400 truncate w-full">
                #{favorite.tagLine}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
