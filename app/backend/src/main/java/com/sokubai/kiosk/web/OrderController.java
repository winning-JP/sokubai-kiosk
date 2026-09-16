package com.sokubai.kiosk.web;

import com.sokubai.kiosk.model.OrderEntity;
import com.sokubai.kiosk.service.OrderService;
import com.sokubai.kiosk.web.dto.CreateOrderRequest;
import com.sokubai.kiosk.web.dto.OrderResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> list() {
        return orderService.findAll().stream().map(OrderResponse::from).toList();
    }

    @PostMapping
    public OrderResponse create(@RequestBody CreateOrderRequest request) {
        OrderEntity order = orderService.create(request);
        return OrderResponse.from(order);
    }

    @PutMapping("/{id}/toggle-status")
    public OrderResponse toggleStatus(@PathVariable Long id) {
        OrderEntity order = orderService.toggleStatus(id);
        return OrderResponse.from(order);
    }
}
