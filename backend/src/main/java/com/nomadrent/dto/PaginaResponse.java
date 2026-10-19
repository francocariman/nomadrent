package com.nomadrent.dto;

import java.util.List;

public record PaginaResponse<T>(
        List<T> content,
        int page,
        int size,
        int totalPages,
        long totalElements
) {}
