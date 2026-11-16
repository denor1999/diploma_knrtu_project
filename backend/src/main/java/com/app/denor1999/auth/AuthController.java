package com.app.denor1999.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

	private static final Logger log = LoggerFactory.getLogger(AuthController.class);

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public AuthRequests.UserResponse register(@RequestBody AuthRequests.RegisterRequest request) {
		log.info("Регистрация: {}", request.email());
		AuthRequests.UserResponse created = authService.register(request);
		log.info("Пользователь сохранён id={} email={}", created.id(), created.email());
		return created;
	}

	@PostMapping("/login")
	public AuthRequests.UserResponse login(@RequestBody AuthRequests.LoginRequest request) {
		log.info("Вход: {}", request.email());
		AuthRequests.UserResponse user = authService.login(request);
		log.info("Вход выполнен id={} email={}", user.id(), user.email());
		return user;
	}

}
