package com.app.denor1999.route;

import com.app.denor1999.auth.ApiException;
import org.springframework.http.HttpStatus;

import java.util.Locale;
import java.util.Set;

public final class Airports {

	private static final Set<String> CODES = Set.of("SVO", "DME", "VKO", "AER", "KZN", "KGD", "LED");

	private Airports() {
	}

	public static String require(String value, String field) {
		if (value == null || value.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Укажите аэропорт: " + field + ".");
		}
		String code = value.trim().toUpperCase(Locale.ROOT);
		if (!CODES.contains(code)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Неизвестный аэропорт.");
		}
		return code;
	}

}
