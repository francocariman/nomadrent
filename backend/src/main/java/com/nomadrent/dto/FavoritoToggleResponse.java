package com.nomadrent.dto;

/** favorito=true → quedó marcado (con su id); favorito=false → se quitó. */
public record FavoritoToggleResponse(boolean favorito, Long favoritoId) {}
