package com.app.denor1999.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

	List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);

}
