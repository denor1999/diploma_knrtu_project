package com.app.denor1999.forecast;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/forecasts", "/forecasts"})
public class ForecastController {

	private static final Logger log = LoggerFactory.getLogger(ForecastController.class);

	private final ForecastService forecasts;

	public ForecastController(ForecastService forecasts) {
		this.forecasts = forecasts;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ForecastDtos.ForecastResponse create(@RequestBody ForecastDtos.CreateRequest request) {
		log.info("Прогноз: {} → {} на {}", request.from(), request.to(), request.date());
		return forecasts.create(request);
	}

	@GetMapping
	public List<ForecastDtos.HistoryItem> history(@RequestParam Long userId) {
		return forecasts.history(userId);
	}

	@GetMapping("/quote")
	public ForecastDtos.ForecastResponse quote(
			@RequestParam String from,
			@RequestParam String to,
			@RequestParam(required = false) java.time.LocalDate date) {
		return forecasts.quote(from, to, date);
	}

	@GetMapping("/{id}")
	public ForecastDtos.ForecastResponse one(@PathVariable Long id) {
		return forecasts.one(id);
	}

}
