package com.app.denor1999.auth;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

final class AuthResponses {

	private AuthResponses() {
	}

	static void unauthorized(HttpServletResponse response) throws IOException {
		write(response, HttpServletResponse.SC_UNAUTHORIZED, "Войдите в аккаунт.");
	}

	static void forbidden(HttpServletResponse response) throws IOException {
		write(response, HttpServletResponse.SC_FORBIDDEN, "Недостаточно прав.");
	}

	static void tooManyRequests(HttpServletResponse response) throws IOException {
		write(response, 429, "Слишком много попыток. Подождите минуту.");
	}

	private static void write(HttpServletResponse response, int status, String detail) throws IOException {
		response.setStatus(status);
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.setContentType("application/json");
		response.getWriter().write("{\"detail\":\"" + detail + "\"}");
	}

}
