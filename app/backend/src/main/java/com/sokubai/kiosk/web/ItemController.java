package com.sokubai.kiosk.web;

import com.sokubai.kiosk.model.Item;
import com.sokubai.kiosk.service.ItemService;
import com.sokubai.kiosk.web.dto.ItemRequest;
import com.sokubai.kiosk.web.dto.ItemResponse;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<ItemResponse> list() {
        return itemService.findAll().stream().map(ItemResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ItemResponse get(@PathVariable Long id) {
        return ItemResponse.from(itemService.findById(id));
    }

    @PostMapping
    public ItemResponse create(@RequestBody ItemRequest request) {
        Item item = itemService.create(request);
        return ItemResponse.from(item);
    }

    @PutMapping("/{id}")
    public ItemResponse update(@PathVariable Long id, @RequestBody ItemRequest request) {
        Item item = itemService.update(id, request);
        return ItemResponse.from(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        itemService.delete(id);
    }
}
