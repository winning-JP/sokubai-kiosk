package com.sokubai.kiosk.repository;

import com.sokubai.kiosk.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
