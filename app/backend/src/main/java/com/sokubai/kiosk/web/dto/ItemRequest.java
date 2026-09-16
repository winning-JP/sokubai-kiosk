package com.sokubai.kiosk.web.dto;

public record ItemRequest(
        String name,
        String category,
        int price,
        int stock,
        String emoji,
        String description,
        boolean selling
) {
}
