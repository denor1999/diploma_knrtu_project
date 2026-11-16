package com.app.denor1999.forecast;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
public class ForecastCalculator {

	static final LocalDate REFERENCE_DATE = LocalDate.of(2026, 11, 2);

	private static final DateTimeFormatter UPDATED_AT = DateTimeFormatter.ofPattern("d MMMM yyyy 'в' HH:mm 'МСК'", Locale.forLanguageTag("ru-RU"));

	private static final Map<String, Profile> PROFILES = Map.of(
			"AER", new Profile(8400, 9000, 8900, 10600, -280, List.of(
					new ForecastDtos.Factor("Сезон поездки", "Спрос на южное направление", 900),
					new ForecastDtos.Factor("Дни до вылета", "", 650),
					new ForecastDtos.Factor("Конкуренция авиакомпаний", "Несколько прямых рейсов", -550),
					new ForecastDtos.Factor("Текущий спрос", "Ниже среднего по маршруту", -300))),
			"KZN", new Profile(5200, 5400, 4500, 5600, -100, List.of(
					new ForecastDtos.Factor("Сезон поездки", "Спокойный осенний спрос", -200),
					new ForecastDtos.Factor("Дни до вылета", "", 150),
					new ForecastDtos.Factor("Конкуренция авиакомпаний", "Прямые рейсы у нескольких перевозчиков", -350),
					new ForecastDtos.Factor("Текущий спрос", "Ниже обычного уровня", -200))),
			"KGD", new Profile(6900, 7200, 6100, 7400, 120, List.of(
					new ForecastDtos.Factor("Сезон поездки", "Интерес к городу вырос умеренно", 250),
					new ForecastDtos.Factor("Дни до вылета", "", 180),
					new ForecastDtos.Factor("Конкуренция авиакомпаний", "Стыковки сдерживают тариф", -700),
					new ForecastDtos.Factor("Текущий спрос", "Близок к среднему по маршруту", -180))),
			"LED", new Profile(4300, 4600, 3900, 5100, -40, List.of(
					new ForecastDtos.Factor("Сезон поездки", "Направление летает часто", -150),
					new ForecastDtos.Factor("Дни до вылета", "", 220),
					new ForecastDtos.Factor("Конкуренция авиакомпаний", "Много рейсов в течение дня", -280),
					new ForecastDtos.Factor("Текущий спрос", "Обычный уровень для ноября", -90))));

	public Quote build(String from, String to, LocalDate date) {
		Profile profile = PROFILES.getOrDefault(to, PROFILES.get("AER"));
		long daysLeft = Math.max(ChronoUnit.DAYS.between(REFERENCE_DATE, date), 0);
		List<ForecastDtos.Factor> factors = profile.factors().stream()
				.map(factor -> "Дни до вылета".equals(factor.title())
						? new ForecastDtos.Factor(factor.title(), daysNote(daysLeft), factor.value())
						: factor)
				.toList();
		int expected = profile.base() + factors.stream().mapToInt(ForecastDtos.Factor::value).sum();
		String rec = expected > profile.current() + 200 ? "buy" : "wait";
		return new Quote(
				from,
				to,
				date,
				profile.current(),
				expected,
				profile.low(),
				profile.high(),
				profile.base(),
				profile.deltaDay(),
				factors,
				rec,
				historySeries(profile.current(), hashCode(to)),
				forecastSeries(profile.current(), expected),
				UPDATED_AT.format(REFERENCE_DATE.atTime(12, 40)),
				REFERENCE_DATE.plusDays(7));
	}

	private List<ForecastDtos.PricePoint> historySeries(int current, int seed) {
		List<ForecastDtos.PricePoint> points = new ArrayList<>();
		double price = Math.round(current * 1.22);
		for (int index = 30; index >= 1; index -= 1) {
			double wave = Math.sin((index + seed) / 2.4) * current * 0.035;
			double drift = ((30.0 - index) / 30.0) * (current - price);
			price = Math.round(price + drift * 0.18 + wave * 0.15);
			points.add(new ForecastDtos.PricePoint(REFERENCE_DATE.minusDays(index), (int) Math.max(1000, price)));
		}
		points.add(new ForecastDtos.PricePoint(REFERENCE_DATE, current));
		return points;
	}

	private List<ForecastDtos.PricePoint> forecastSeries(int current, int expected) {
		List<ForecastDtos.PricePoint> points = new ArrayList<>();
		for (int day = 0; day <= 7; day += 1) {
			double t = day / 7.0;
			double eased = t * t * (3 - 2 * t);
			points.add(new ForecastDtos.PricePoint(REFERENCE_DATE.plusDays(day), (int) Math.round(current + (expected - current) * eased)));
		}
		return points;
	}

	private String daysNote(long daysLeft) {
		if (daysLeft == 0) {
			return "Вылет сегодня";
		}
		return "До поездки осталось " + daysLeft + " " + pluralDays(daysLeft);
	}

	private String pluralDays(long count) {
		long mod10 = count % 10;
		long mod100 = count % 100;
		if (mod10 == 1 && mod100 != 11) {
			return "день";
		}
		if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
			return "дня";
		}
		return "дней";
	}

	private int hashCode(String value) {
		return value.chars().sum();
	}

	record Profile(int current, int base, int low, int high, int deltaDay, List<ForecastDtos.Factor> factors) {
	}

	public record Quote(
			String from,
			String to,
			LocalDate date,
			int current,
			int expected,
			int low,
			int high,
			int base,
			int deltaDay,
			List<ForecastDtos.Factor> factors,
			String rec,
			List<ForecastDtos.PricePoint> history,
			List<ForecastDtos.PricePoint> forecast,
			String updatedAt,
			LocalDate horizonDate) {
	}

}
