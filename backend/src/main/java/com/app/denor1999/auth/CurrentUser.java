package com.app.denor1999.auth;

import com.app.denor1999.user.UserAccount;
import com.app.denor1999.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

	private final UserRepository users;

	public CurrentUser(UserRepository users) {
		this.users = users;
	}

	public UserAccount require() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Войдите в аккаунт.");
		}
		return users.findByEmail(authentication.getName())
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Войдите в аккаунт."));
	}

}
