// src/context/FavoritesContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { FavoritePlayer } from "@/types/riotTypes";

// Constante pour la clé de stockage
const FAVORITES_STORAGE_KEY = "lol-favorites";

// Types pour le state et les actions
type FavoritesState = {
  favorites: FavoritePlayer[];
};

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: FavoritePlayer }
  | { type: "REMOVE_FAVORITE"; payload: { gameName: string; tagLine: string } }
  | { type: "SET_FAVORITES"; payload: FavoritePlayer[] };

// Création du context
const FavoritesContext = createContext<
  | {
      state: FavoritesState;
      dispatch: React.Dispatch<FavoritesAction>;
    }
  | undefined
>(undefined);

// Reducer pour gérer les actions
function favoritesReducer(
  state: FavoritesState,
  action: FavoritesAction
): FavoritesState {
  switch (action.type) {
    case "ADD_FAVORITE":
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };
    case "REMOVE_FAVORITE":
      return {
        ...state,
        favorites: state.favorites.filter(
          (f) =>
            !(
              f.gameName.toLowerCase() ===
                action.payload.gameName.toLowerCase() &&
              f.tagLine.toLowerCase() === action.payload.tagLine.toLowerCase()
            )
        ),
      };
    case "SET_FAVORITES":
      return {
        ...state,
        favorites: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, { favorites: [] });

  // Charger les favoris depuis localStorage au montage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        dispatch({
          type: "SET_FAVORITES",
          payload: parsedFavorites,
        });
      } catch (e) {
        console.error("Erreur lors du chargement des favoris:", e);
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
      }
    }
  }, []);

  // Sauvegarder les favoris dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(state.favorites)
    );
  }, [state.favorites]);

  return (
    <FavoritesContext.Provider value={{ state, dispatch }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook pour utiliser le context
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  const { state, dispatch } = context;

  return {
    favorites: state.favorites,
    addFavorite: (
      gameName: string,
      tagLine: string,
      profileIconId?: number
    ) => {
      // Vérifier si le joueur existe déjà
      if (isFavorite(gameName, tagLine, state.favorites)) return;

      dispatch({
        type: "ADD_FAVORITE",
        payload: {
          id: `${gameName.toLowerCase()}-${tagLine.toLowerCase()}`,
          gameName,
          tagLine: tagLine.startsWith("#") ? tagLine.substring(1) : tagLine,
          lastSearched: Date.now(),
          profileIconId,
        },
      });
    },
    removeFavorite: (gameName: string, tagLine: string) => {
      dispatch({
        type: "REMOVE_FAVORITE",
        payload: { gameName, tagLine },
      });
    },
    isFavorite: (gameName: string, tagLine: string) => {
      return isFavorite(gameName, tagLine, state.favorites);
    },
  };
}

// Fonction utilitaire pour vérifier si un joueur est dans les favoris
function isFavorite(
  gameName: string,
  tagLine: string,
  favorites: FavoritePlayer[]
): boolean {
  return favorites.some(
    (f) =>
      f.gameName.toLowerCase() === gameName.toLowerCase() &&
      f.tagLine.toLowerCase() === tagLine.toLowerCase()
  );
}
