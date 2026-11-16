package com.app.denor1999.subscription;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/subscriptions", "/subscriptions"})
public class SubscriptionController {

	private static final Logger log = LoggerFactory.getLogger(SubscriptionController.class);

	private final SubscriptionService subscriptions;

	public SubscriptionController(SubscriptionService subscriptions) {
		this.subscriptions = subscriptions;
	}

	@GetMapping
	public List<SubscriptionDtos.SubscriptionResponse> list(@RequestParam Long userId) {
		return subscriptions.list(userId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public SubscriptionDtos.SubscriptionResponse create(@RequestBody SubscriptionDtos.CreateRequest request) {
		log.info("Подписка: user={} {} → {}", request.userId(), request.from(), request.to());
		return subscriptions.create(request);
	}

	@PatchMapping("/{id}")
	public SubscriptionDtos.SubscriptionResponse patch(@PathVariable Long id, @RequestBody SubscriptionDtos.PatchRequest request) {
		return subscriptions.patch(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		subscriptions.delete(id);
	}

}
