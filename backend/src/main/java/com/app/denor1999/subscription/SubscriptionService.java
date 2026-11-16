package com.app.denor1999.subscription;

import com.app.denor1999.auth.ApiException;
import com.app.denor1999.route.FlightRoute;
import com.app.denor1999.route.RouteRepository;
import com.app.denor1999.user.UserAccount;
import com.app.denor1999.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SubscriptionService {

	private static final Map<String, Integer> DISTANCES = Map.of(
			"AER", 1360,
			"KZN", 720,
			"KGD", 1090,
			"LED", 635);

	private final SubscriptionRepository subscriptions;
	private final UserRepository users;
	private final RouteRepository routes;

	public SubscriptionService(SubscriptionRepository subscriptions, UserRepository users, RouteRepository routes) {
		this.subscriptions = subscriptions;
		this.users = users;
		this.routes = routes;
	}

	@Transactional(readOnly = true)
	public List<SubscriptionDtos.SubscriptionResponse> list(Long userId) {
		if (userId == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Укажите пользователя.");
		}
		return subscriptions.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(SubscriptionDtos.SubscriptionResponse::from)
				.toList();
	}

	@Transactional
	public SubscriptionDtos.SubscriptionResponse create(SubscriptionDtos.CreateRequest request) {
		if (request.userId() == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Укажите пользователя.");
		}
		if (request.target() == null || request.target() < 1000) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Укажите целевую цену от 1 000 ₽.");
		}
		String from = requireAirport(request.from(), "Откуда");
		String to = requireAirport(request.to(), "Куда");
		LocalDate date = request.date() == null ? LocalDate.of(2026, 11, 24) : request.date();
		UserAccount user = users.findById(request.userId())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Пользователь не найден."));
		FlightRoute route = routes.findByOriginCodeAndDestinationCode(from, to)
				.orElseGet(() -> routes.save(new FlightRoute(from, to, DISTANCES.getOrDefault(to, 900), false)));
		Subscription saved = subscriptions.save(new Subscription(user, route, request.target(), true, date));
		return SubscriptionDtos.SubscriptionResponse.from(saved);
	}

	@Transactional
	public SubscriptionDtos.SubscriptionResponse patch(Long id, SubscriptionDtos.PatchRequest request) {
		Subscription subscription = subscriptions.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Подписка не найдена."));
		if (request.active() != null) {
			subscription.setActive(request.active());
		}
		return SubscriptionDtos.SubscriptionResponse.from(subscription);
	}

	@Transactional
	public void delete(Long id) {
		if (!subscriptions.existsById(id)) {
			throw new ApiException(HttpStatus.NOT_FOUND, "Подписка не найдена.");
		}
		subscriptions.deleteById(id);
	}

	private String requireAirport(String value, String field) {
		if (value == null || value.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Укажите аэропорт: " + field + ".");
		}
		return value.trim().toUpperCase(Locale.ROOT);
	}

}
