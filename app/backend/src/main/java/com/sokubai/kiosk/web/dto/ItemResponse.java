package com.sokubai.kiosk.web.dto;

import com.sokubai.kiosk.model.Item;

public record ItemResponse(
        Long id,
        String name,
        String category,
        int price,
        int stock,
        String emoji,
        String description,
        boolean selling
) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getPrice(),
                item.getStock(),
                item.getEmoji(),
                item.getDescription(),
                item.isSelling()
        );
    }
}
