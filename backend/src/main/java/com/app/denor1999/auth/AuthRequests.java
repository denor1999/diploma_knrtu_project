package com.app.denor1999.auth;

import java.time.Instant;

public final class AuthRequests {

	private AuthRequests() {
	}

	public record RegisterRequest(String name, String email, String password) {
	}

	public record LoginRequest(String email, String password) {
	}

	public record UserResponse(String token, Long id, String name, String email, String role, Instant createdAt) {
	}

}
