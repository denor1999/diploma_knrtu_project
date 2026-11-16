package com.app.denor1999.forecast;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class ForecastDtos {

	private ForecastDtos() {
	}

	public record CreateRequest(String from, String to, LocalDate date, Long userId) {
	}

	public record Factor(String title, String note, int value) {
	}

	public record PricePoint(LocalDate date, int price) {
	}

	public record ForecastResponse(
			Long id,
			Long routeId,
			String from,
			String to,
			LocalDate date,
			int current,
			int expected,
			int low,
			int high,
			int base,
			int deltaDay,
			List<Factor> factors,
			String rec,
			List<PricePoint> history,
			List<PricePoint> forecast,
			String updatedAt,
			LocalDate horizonDate,
			Instant createdAt) {
	}

	public record HistoryItem(
			Long id,
			String from,
			String to,
			LocalDate date,
			String requestedLabel,
			int price,
			String rec) {
	}

}
