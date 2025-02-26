import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Star,
  StarOff,
  X,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Interface pour un joueur favori
export interface FavoritePlayer {
  id: string;
  gameName: string;
  tagLine: string;
  lastSearched?: number; // timestamp
  profileIconId?: number;
}

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
  const [favorites, setFavorites] = useState<FavoritePlayer[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewFavoriteForm, setShowNewFavoriteForm] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [newTagLine, setNewTagLine] = useState("");

  // Charger les favoris depuis le localStorage au chargement du composant
  useEffect(() => {
    const savedFavorites = localStorage.getItem("lol-favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Erreur lors du chargement des favoris:", e);
        // Réinitialiser en cas d'erreur
        localStorage.removeItem("lol-favorites");
        setFavorites([]);
      }
    }
  }, []);

  // Sauvegarder les favoris dans le localStorage quand ils changent
  useEffect(() => {
    localStorage.setItem("lol-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Mettre à jour le dernier joueur recherché quand currentGameName et currentTagLine changent
  useEffect(() => {
    if (currentGameName && currentTagLine && profileIconId) {
      // Vérifier si le joueur existe déjà dans les favoris
      const existingIndex = favorites.findIndex(
        (f) =>
          f.gameName.toLowerCase() === currentGameName.toLowerCase() &&
          f.tagLine.toLowerCase() === currentTagLine.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Mettre à jour le timestamp du joueur existant
        const updatedFavorites = [...favorites];
        updatedFavorites[existingIndex] = {
          ...updatedFavorites[existingIndex],
          lastSearched: Date.now(),
          profileIconId,
        };
        setFavorites(updatedFavorites);
      }
    }
  }, [currentGameName, currentTagLine, profileIconId, favorites]);

  // Ajouter un nouveau favori
  const addFavorite = () => {
    // Vérifier si les champs sont vides
    if (!newGameName || !newTagLine) {
      return;
    }

    // Vérifier si le joueur existe déjà
    const existingPlayer = favorites.find(
      (f) =>
        f.gameName.toLowerCase() === newGameName.toLowerCase() &&
        f.tagLine.toLowerCase() === newTagLine.toLowerCase()
    );

    if (existingPlayer) {
      // Si le joueur existe déjà, on ne fait rien
      setNewGameName("");
      setNewTagLine("");
      setShowNewFavoriteForm(false);
      return;
    }

    // Ajouter le nouveau joueur
    const newFavorite: FavoritePlayer = {
      id: `${newGameName.toLowerCase()}-${newTagLine.toLowerCase()}`,
      gameName: newGameName,
      tagLine: newTagLine.startsWith("#")
        ? newTagLine.substring(1)
        : newTagLine,
      lastSearched: Date.now(),
      profileIconId:
        currentGameName === newGameName && currentTagLine === newTagLine
          ? profileIconId
          : undefined,
    };

    setFavorites([...favorites, newFavorite]);
    setNewGameName("");
    setNewTagLine("");
    setShowNewFavoriteForm(false);
  };

  // Ajouter le joueur actuellement affiché aux favoris
  const addCurrentPlayerToFavorites = () => {
    if (!currentGameName || !currentTagLine) return;

    // Vérifier si le joueur existe déjà
    const existingPlayer = favorites.find(
      (f) =>
        f.gameName.toLowerCase() === currentGameName.toLowerCase() &&
        f.tagLine.toLowerCase() === currentTagLine.toLowerCase()
    );

    if (existingPlayer) return;

    // Ajouter le joueur actuel
    const newFavorite: FavoritePlayer = {
      id: `${currentGameName.toLowerCase()}-${currentTagLine.toLowerCase()}`,
      gameName: currentGameName,
      tagLine: currentTagLine.startsWith("#")
        ? currentTagLine.substring(1)
        : currentTagLine,
      lastSearched: Date.now(),
      profileIconId,
    };

    setFavorites([...favorites, newFavorite]);
  };

  // Retirer un favori
  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  // Trier les favoris par date de dernière recherche (les plus récents en premier)
  const sortedFavorites = [...favorites].sort((a, b) => {
    return (b.lastSearched || 0) - (a.lastSearched || 0);
  });

  // Vérifier si le joueur actuel est dans les favoris
  const isCurrentPlayerFavorite =
    currentGameName &&
    currentTagLine &&
    favorites.some(
      (f) =>
        f.gameName.toLowerCase() === currentGameName.toLowerCase() &&
        f.tagLine.toLowerCase() === currentTagLine.toLowerCase()
    );

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-sm rounded-xl border border-blue-900/40 overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center text-blue-300">
          <Star className="w-4 h-4 mr-2" />
          <span>Joueurs favoris</span>
          {favorites.length > 0 && (
            <span className="ml-2 bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">
              {favorites.length}
            </span>
          )}
        </div>
        <div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-300" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-blue-900/30">
          {/* Bouton pour ajouter/retirer le joueur actuel des favoris */}
          {currentGameName && currentTagLine && (
            <div className="mb-3">
              <Button
                className={`w-full ${
                  isCurrentPlayerFavorite
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-blue-700 hover:bg-blue-600"
                }`}
                onClick={
                  isCurrentPlayerFavorite
                    ? () =>
                        removeFavorite(
                          `${currentGameName.toLowerCase()}-${currentTagLine.toLowerCase()}`
                        )
                    : addCurrentPlayerToFavorites
                }
                size="sm"
              >
                {isCurrentPlayerFavorite ? (
                  <div className="flex items-center">
                    <StarOff className="w-4 h-4 mr-1" />
                    <span>Retirer {currentGameName} des favoris</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span>Ajouter {currentGameName} aux favoris</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Liste des favoris */}
          {sortedFavorites.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {sortedFavorites.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                >
                  <div
                    className="flex items-center flex-grow cursor-pointer"
                    onClick={() =>
                      onSelectPlayer(player.gameName, player.tagLine)
                    }
                  >
                    {player.profileIconId ? (
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.4.1/img/profileicon/${player.profileIconId}.png`}
                        alt="Profile Icon"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center mr-2">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {player.gameName}
                      </div>
                      <div className="text-blue-300 text-xs">
                        #{player.tagLine}
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-2 p-1 text-slate-500 hover:text-red-400 rounded"
                    onClick={() => removeFavorite(player.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-2">
              Aucun joueur favoris pour le moment
            </div>
          )}

          {/* Formulaire pour ajouter un nouveau favori */}
          {showNewFavoriteForm ? (
            <div className="mt-3 space-y-2">
              <div className="flex space-x-2">
                <Input
                  className="bg-slate-800/70 border-slate-700 text-sm"
                  placeholder="Game Name"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                />
                <Input
                  className="bg-slate-800/70 border-slate-700 text-sm w-24"
                  placeholder="#Tag"
                  value={newTagLine}
                  onChange={(e) => setNewTagLine(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-green-700 hover:bg-green-600"
                  size="sm"
                  onClick={addFavorite}
                >
                  Ajouter
                </Button>
                <Button
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                  size="sm"
                  onClick={() => {
                    setShowNewFavoriteForm(false);
                    setNewGameName("");
                    setNewTagLine("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full mt-3 bg-blue-800/50 hover:bg-blue-700/50"
              size="sm"
              onClick={() => setShowNewFavoriteForm(true)}
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Ajouter un nouveau joueur
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
