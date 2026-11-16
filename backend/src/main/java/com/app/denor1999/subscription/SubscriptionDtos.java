package com.app.denor1999.subscription;

import java.time.Instant;
import java.time.LocalDate;

public final class SubscriptionDtos {

	private SubscriptionDtos() {
	}

	public record CreateRequest(Long userId, String from, String to, LocalDate date, Integer target) {
	}

	public record PatchRequest(Boolean active) {
	}

	public record SubscriptionResponse(
			Long id,
			Long userId,
			Long routeId,
			String from,
			String to,
			LocalDate date,
			int target,
			boolean active,
			String email,
			Instant createdAt) {
		public static SubscriptionResponse from(Subscription subscription) {
			return new SubscriptionResponse(
					subscription.getId(),
					subscription.getUser().getId(),
					subscription.getRoute().getId(),
					subscription.getRoute().getOriginCode(),
					subscription.getRoute().getDestinationCode(),
					subscription.getDepartureDate(),
					subscription.getTargetPrice(),
					subscription.isActive(),
					subscription.getUser().getEmail(),
					subscription.getCreatedAt());
		}
	}

}
