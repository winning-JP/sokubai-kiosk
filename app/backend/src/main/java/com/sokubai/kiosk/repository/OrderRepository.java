package com.sokubai.kiosk.repository;

import com.sokubai.kiosk.model.OrderEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @Query("select coalesce(max(o.orderNo), 20) from OrderEntity o")
    int findMaxOrderNo();

    @Query("select distinct o from OrderEntity o left join fetch o.lines order by o.id desc")
    List<OrderEntity> findAllWithLines();
}
