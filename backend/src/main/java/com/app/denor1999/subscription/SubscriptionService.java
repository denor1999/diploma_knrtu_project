package com.app.denor1999.subscription;

import com.app.denor1999.auth.ApiException;
import com.app.denor1999.auth.CurrentUser;
import com.app.denor1999.route.Airports;
import com.app.denor1999.route.FlightRoute;
import com.app.denor1999.route.RouteRepository;
import com.app.denor1999.user.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class SubscriptionService {

	private static final Map<String, Integer> DISTANCES = Map.of(
			"AER", 1360,
			"KZN", 720,
			"KGD", 1090,
			"LED", 635);

	private final SubscriptionRepository subscriptions;
	private final CurrentUser currentUser;
	private final RouteRepository routes;

	public SubscriptionService(SubscriptionRepository subscriptions, CurrentUser currentUser, RouteRepository routes) {
		this.subscriptions = subscriptions;
		this.currentUser = currentUser;
		this.routes = routes;
	}

	@Transactional(readOnly = true)
	public List<SubscriptionDtos.SubscriptionResponse> list() {
		Long userId = currentUser.require().getId();
		return subscriptions.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(SubscriptionDtos.SubscriptionResponse::from)
				.toList();
	}

	@Transactional
	public SubscriptionDtos.SubscriptionResponse create(SubscriptionDtos.CreateRequest request) {
		if (request.target() == null || request.target() < 1000) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Укажите целевую цену от 1 000 ₽.");
		}
		String from = Airports.require(request.from(), "Откуда");
		String to = Airports.require(request.to(), "Куда");
		LocalDate date = request.date() == null ? LocalDate.of(2026, 11, 24) : request.date();
		UserAccount user = currentUser.require();
		FlightRoute route = routes.findByOriginCodeAndDestinationCode(from, to)
				.orElseGet(() -> routes.save(new FlightRoute(from, to, DISTANCES.getOrDefault(to, 900), false)));
		Subscription saved = subscriptions.save(new Subscription(user, route, request.target(), true, date));
		return SubscriptionDtos.SubscriptionResponse.from(saved);
	}

	@Transactional
	public SubscriptionDtos.SubscriptionResponse patch(Long id, SubscriptionDtos.PatchRequest request) {
		Subscription subscription = owned(id);
		if (request.active() != null) {
			subscription.setActive(request.active());
		}
		return SubscriptionDtos.SubscriptionResponse.from(subscription);
	}

	@Transactional
	public void delete(Long id) {
		subscriptions.delete(owned(id));
	}

	private Subscription owned(Long id) {
		Subscription subscription = subscriptions.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Подписка не найдена."));
		if (!subscription.getUser().getId().equals(currentUser.require().getId())) {
			throw new ApiException(HttpStatus.NOT_FOUND, "Подписка не найдена.");
		}
		return subscription;
	}

}
