package com.app.denor1999.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthRateLimitFilter extends OncePerRequestFilter {

	private static final int LIMIT = 30;
	private static final long WINDOW_MS = 60_000;
	private static final Set<String> PATHS = Set.of(
			"/api/auth/login",
			"/api/auth/register",
			"/auth/login",
			"/auth/register");

	private final ConcurrentHashMap<String, Counter> windows = new ConcurrentHashMap<>();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!"POST".equalsIgnoreCase(request.getMethod()) || !PATHS.contains(request.getRequestURI())) {
			filterChain.doFilter(request, response);
			return;
		}
		if (!allow(request.getRemoteAddr())) {
			AuthResponses.tooManyRequests(response);
			return;
		}
		filterChain.doFilter(request, response);
	}

	private boolean allow(String key) {
		long now = System.currentTimeMillis();
		Counter counter = windows.compute(key, (ignored, existing) -> {
			if (existing == null || now - existing.start >= WINDOW_MS) {
				return new Counter(now, 1);
			}
			existing.count++;
			return existing;
		});
		return counter.count <= LIMIT;
	}

	private static final class Counter {
		private final long start;
		private int count;

		private Counter(long start, int count) {
			this.start = start;
			this.count = count;
		}
	}

}
