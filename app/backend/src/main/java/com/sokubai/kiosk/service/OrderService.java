package com.sokubai.kiosk.service;

import com.sokubai.kiosk.model.Item;
import com.sokubai.kiosk.model.OrderEntity;
import com.sokubai.kiosk.model.OrderLine;
import com.sokubai.kiosk.repository.ItemRepository;
import com.sokubai.kiosk.repository.OrderRepository;
import com.sokubai.kiosk.web.dto.CreateOrderRequest;
import com.sokubai.kiosk.web.dto.OrderLineRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;

    public OrderService(OrderRepository orderRepository, ItemRepository itemRepository) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderEntity> findAll() {
        return orderRepository.findAllWithLines();
    }

    @Transactional
    public OrderEntity create(CreateOrderRequest request) {
        if (request.lines() == null || request.lines().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "カートが空です");
        }

        Map<Long, Integer> qtyByItem = new HashMap<>();
        for (OrderLineRequest line : request.lines()) {
            if (line.itemId() == null || line.qty() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "数量が不正です");
            }
            qtyByItem.merge(line.itemId(), line.qty(), Integer::sum);
        }

        Map<Long, Item> items = new HashMap<>();
        for (Long itemId : qtyByItem.keySet()) {
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "頒布物が見つかりません"));
            int qty = qtyByItem.get(itemId);
            if (!item.isSelling()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, item.getName() + " は現在販売していません");
            }
            if (item.getStock() < qty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, item.getName() + " の在庫が足りません");
            }
            items.put(itemId, item);
        }

        OrderEntity order = new OrderEntity();
        order.setOrderNo(orderRepository.findMaxOrderNo() + 1);
        order.setStatus("受け渡し待ち");

        int total = 0;
        for (Map.Entry<Long, Integer> entry : qtyByItem.entrySet()) {
            Item item = items.get(entry.getKey());
            int qty = entry.getValue();
            item.setStock(item.getStock() - qty);
            itemRepository.save(item);

            OrderLine line = new OrderLine();
            line.setItemId(item.getId());
            line.setName(item.getName());
            line.setPrice(item.getPrice());
            line.setEmoji(item.getEmoji());
            line.setQty(qty);
            order.addLine(line);
            total += item.getPrice() * qty;
        }
        order.setTotal(total);
        return orderRepository.save(order);
    }

    @Transactional
    public OrderEntity toggleStatus(Long id) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "注文が見つかりません"));
        if ("渡し済み".equals(order.getStatus())) {
            order.setStatus("受け渡し待ち");
        } else {
            order.setStatus("渡し済み");
        }
        return orderRepository.save(order);
    }
}
