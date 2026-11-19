package com.app.denor1999.forecast;

import com.app.denor1999.auth.ApiException;
import com.app.denor1999.auth.CurrentUser;
import com.app.denor1999.route.Airports;
import com.app.denor1999.route.FlightRoute;
import com.app.denor1999.route.RouteRepository;
import com.app.denor1999.user.UserAccount;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ForecastService {

	private static final DateTimeFormatter HISTORY_LABEL = DateTimeFormatter.ofPattern("d MMM, HH:mm", Locale.forLanguageTag("ru-RU"));
	private static final Map<String, Integer> DISTANCES = Map.of(
			"AER", 1360,
			"KZN", 720,
			"KGD", 1090,
			"LED", 635);

	private final ForecastCalculator calculator;
	private final ForecastRepository forecasts;
	private final RouteRepository routes;
	private final CurrentUser currentUser;
	private final ObjectMapper objectMapper;

	public ForecastService(
			ForecastCalculator calculator,
			ForecastRepository forecasts,
			RouteRepository routes,
			CurrentUser currentUser,
			ObjectMapper objectMapper) {
		this.calculator = calculator;
		this.forecasts = forecasts;
		this.routes = routes;
		this.currentUser = currentUser;
		this.objectMapper = objectMapper;
	}

	public ForecastDtos.ForecastResponse quote(String from, String to, LocalDate date) {
		String origin = Airports.require(from, "Откуда");
		String destination = Airports.require(to, "Куда");
		LocalDate departure = date == null ? LocalDate.of(2026, 11, 24) : date;
		ForecastCalculator.Quote quote = calculator.build(origin, destination, departure);
		Long routeId = routes.findByOriginCodeAndDestinationCode(origin, destination)
				.map(FlightRoute::getId)
				.orElse(null);
		return toQuoteResponse(routeId, quote);
	}

	@Transactional
	public ForecastDtos.ForecastResponse create(ForecastDtos.CreateRequest request) {
		String from = Airports.require(request.from(), "Откуда");
		String to = Airports.require(request.to(), "Куда");
		if (from.equals(to)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Выберите разные аэропорты вылета и прилёта.");
		}
		LocalDate date = request.date() == null ? LocalDate.of(2026, 11, 24) : request.date();
		FlightRoute route = routes.findByOriginCodeAndDestinationCode(from, to)
				.orElseGet(() -> routes.save(new FlightRoute(from, to, DISTANCES.getOrDefault(to, 900), false)));
		UserAccount user = currentUser.require();
		ForecastCalculator.Quote quote = calculator.build(from, to, date);
		Forecast saved = forecasts.save(new Forecast(
				route,
				user,
				date,
				quote.expected(),
				quote.current(),
				quote.low(),
				quote.high(),
				quote.rec(),
				writeJson(quote.factors())));
		return toQuoteResponse(saved.getId(), saved.getRoute().getId(), saved.getCreatedAt(), quote);
	}

	@Transactional(readOnly = true)
	public ForecastDtos.ForecastResponse one(Long id) {
		Forecast forecast = forecasts.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Прогноз не найден."));
		UserAccount owner = forecast.getUser();
		if (owner == null || !owner.getId().equals(currentUser.require().getId())) {
			throw new ApiException(HttpStatus.NOT_FOUND, "Прогноз не найден.");
		}
		ForecastCalculator.Quote quote = calculator.build(
				forecast.getRoute().getOriginCode(),
				forecast.getRoute().getDestinationCode(),
				forecast.getDepartureDate());
		return toQuoteResponse(forecast.getId(), forecast.getRoute().getId(), forecast.getCreatedAt(), quote);
	}

	private ForecastDtos.ForecastResponse toQuoteResponse(Long routeId, ForecastCalculator.Quote quote) {
		return toQuoteResponse(null, routeId, null, quote);
	}

	private ForecastDtos.ForecastResponse toQuoteResponse(Long id, Long routeId, Instant createdAt, ForecastCalculator.Quote quote) {
		return new ForecastDtos.ForecastResponse(
				id,
				routeId,
				quote.from(),
				quote.to(),
				quote.date(),
				quote.current(),
				quote.expected(),
				quote.low(),
				quote.high(),
				quote.base(),
				quote.deltaDay(),
				quote.factors(),
				quote.rec(),
				quote.history(),
				quote.forecast(),
				quote.updatedAt(),
				quote.horizonDate(),
				createdAt);
	}

	@Transactional(readOnly = true)
	public List<ForecastDtos.HistoryItem> history() {
		Long userId = currentUser.require().getId();
		return forecasts.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.limit(8)
				.map(this::toHistory)
				.toList();
	}

	private ForecastDtos.HistoryItem toHistory(Forecast forecast) {
		return new ForecastDtos.HistoryItem(
				forecast.getId(),
				forecast.getRoute().getOriginCode(),
				forecast.getRoute().getDestinationCode(),
				forecast.getDepartureDate(),
				HISTORY_LABEL.format(forecast.getCreatedAt().atZone(ZoneId.of("Europe/Moscow"))),
				forecast.getCurrentPrice(),
				forecast.getRecommendation());
	}

	private String writeJson(List<ForecastDtos.Factor> factors) {
		try {
			return objectMapper.writeValueAsString(factors);
		}
		catch (JsonProcessingException exception) {
			throw new IllegalStateException(exception);
		}
	}

}
