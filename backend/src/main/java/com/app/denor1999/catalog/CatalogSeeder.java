package com.app.denor1999.catalog;

import com.app.denor1999.forecast.Forecast;
import com.app.denor1999.forecast.ForecastCalculator;
import com.app.denor1999.forecast.ForecastRepository;
import com.app.denor1999.route.FlightRoute;
import com.app.denor1999.route.RouteRepository;
import com.app.denor1999.subscription.Subscription;
import com.app.denor1999.subscription.SubscriptionRepository;
import com.app.denor1999.user.UserAccount;
import com.app.denor1999.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Order(2)
public class CatalogSeeder implements CommandLineRunner {

	private static final LocalDate DEMO_DATE = LocalDate.of(2026, 11, 24);

	private final UserRepository users;
	private final RouteRepository routes;
	private final SubscriptionRepository subscriptions;
	private final ForecastRepository forecasts;
	private final ForecastCalculator calculator;
	private final ObjectMapper objectMapper;
	private final String demoEmail;

	public CatalogSeeder(
			UserRepository users,
			RouteRepository routes,
			SubscriptionRepository subscriptions,
			ForecastRepository forecasts,
			ForecastCalculator calculator,
			ObjectMapper objectMapper,
			@Value("${app.demo.email:}") String demoEmail) {
		this.users = users;
		this.routes = routes;
		this.subscriptions = subscriptions;
		this.forecasts = forecasts;
		this.calculator = calculator;
		this.objectMapper = objectMapper;
		this.demoEmail = demoEmail;
	}

	@Override
	public void run(String... args) {
		if (routes.count() > 0) {
			return;
		}
		FlightRoute sochi = routes.save(new FlightRoute("SVO", "AER", 1360, false));
		FlightRoute kazan = routes.save(new FlightRoute("SVO", "KZN", 720, false));
		FlightRoute kaliningrad = routes.save(new FlightRoute("SVO", "KGD", 1090, false));
		routes.save(new FlightRoute("SVO", "LED", 635, false));

		UserAccount demo = users.findByEmail(demoEmail).orElse(null);
		if (demo == null) {
			return;
		}
		subscriptions.save(new Subscription(demo, sochi, 7900, true, DEMO_DATE));
		subscriptions.save(new Subscription(demo, kazan, 4800, true, DEMO_DATE));
		saveForecast(demo, sochi, DEMO_DATE);
		saveForecast(demo, kaliningrad, DEMO_DATE);
	}

	private void saveForecast(UserAccount user, FlightRoute route, LocalDate date) {
		ForecastCalculator.Quote quote = calculator.build(route.getOriginCode(), route.getDestinationCode(), date);
		try {
			forecasts.save(new Forecast(
					route,
					user,
					date,
					quote.expected(),
					quote.current(),
					quote.low(),
					quote.high(),
					quote.rec(),
					objectMapper.writeValueAsString(quote.factors())));
		}
		catch (JsonProcessingException exception) {
			throw new IllegalStateException(exception);
		}
	}

}
