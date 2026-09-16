package com.sokubai.kiosk.service;

import com.sokubai.kiosk.model.Item;
import com.sokubai.kiosk.repository.ItemRepository;
import com.sokubai.kiosk.web.dto.ItemRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "頒布物が見つかりません"));
    }

    @Transactional
    public Item create(ItemRequest request) {
        validate(request);
        Item item = new Item();
        apply(item, request);
        return itemRepository.save(item);
    }

    @Transactional
    public Item update(Long id, ItemRequest request) {
        validate(request);
        Item item = findById(id);
        apply(item, request);
        return itemRepository.save(item);
    }

    @Transactional
    public void delete(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "頒布物が見つかりません");
        }
        itemRepository.deleteById(id);
    }

    private void validate(ItemRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "名前は必須です");
        }
        if (request.price() < 0 || request.stock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "価格と在庫は0以上です");
        }
    }

    private void apply(Item item, ItemRequest request) {
        item.setName(request.name().trim());
        item.setCategory(request.category());
        item.setPrice(request.price());
        item.setStock(request.stock());
        item.setEmoji(request.emoji() == null || request.emoji().isBlank() ? "📦" : request.emoji().trim());
        item.setDescription(request.description() == null ? "" : request.description().trim());
        item.setSelling(request.selling());
    }
}
