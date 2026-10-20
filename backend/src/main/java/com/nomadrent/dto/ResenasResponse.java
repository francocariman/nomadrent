package com.nomadrent.dto;

import java.util.List;

public record ResenasResponse(double media, long total, List<ResenaResponse> resenas) {}
