package com.sokubai.kiosk.web.dto;

import java.util.List;

public record CreateOrderRequest(List<OrderLineRequest> lines) {
}
