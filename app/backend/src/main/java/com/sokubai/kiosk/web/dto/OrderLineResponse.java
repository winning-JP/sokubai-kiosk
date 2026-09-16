package com.sokubai.kiosk.web.dto;

import com.sokubai.kiosk.model.OrderLine;

public record OrderLineResponse(
        Long itemId,
        String name,
        int price,
        String emoji,
        int qty
) {
    public static OrderLineResponse from(OrderLine line) {
        return new OrderLineResponse(
                line.getItemId(),
                line.getName(),
                line.getPrice(),
                line.getEmoji(),
                line.getQty()
        );
    }
}
