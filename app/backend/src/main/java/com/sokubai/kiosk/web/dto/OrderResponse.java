package com.sokubai.kiosk.web.dto;

import com.sokubai.kiosk.model.OrderEntity;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        int orderNo,
        int total,
        String status,
        Instant createdAt,
        List<OrderLineResponse> items
) {
    public static OrderResponse from(OrderEntity order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNo(),
                order.getTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getLines().stream().map(OrderLineResponse::from).toList()
        );
    }
}
