package com.app.denor1999.auth;

import com.app.denor1999.user.UserAccount;
import com.app.denor1999.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

	private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
	private static final Pattern DIGIT = Pattern.compile("\\d");
	private static final Pattern UPPER = Pattern.compile("[A-ZА-ЯЁ]");

	private final UserRepository users;
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public AuthService(UserRepository users) {
		this.users = users;
	}

	public AuthRequests.UserResponse register(AuthRequests.RegisterRequest request) {
		String name = request.name() == null ? "" : request.name().trim();
		String email = normalizeEmail(request.email());
		String password = request.password() == null ? "" : request.password();
		if (name.length() < 2) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Как к вам обращаться?");
		}
		if (!EMAIL.matcher(email).matches()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Введите корректную почту.");
		}
		String passwordError = passwordError(password);
		if (!passwordError.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, passwordError);
		}
		if (users.existsByEmail(email)) {
			throw new ApiException(HttpStatus.CONFLICT, "Аккаунт с такой почтой уже есть. Войдите.");
		}
		UserAccount user = users.save(new UserAccount(name, email, passwordEncoder.encode(password), "user"));
		return toResponse(user);
	}

	public AuthRequests.UserResponse login(AuthRequests.LoginRequest request) {
		String email = normalizeEmail(request.email());
		String password = request.password() == null ? "" : request.password();
		UserAccount user = users.findByEmail(email).orElse(null);
		if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Неверная почта или пароль.");
		}
		return toResponse(user);
	}

	private AuthRequests.UserResponse toResponse(UserAccount user) {
		return new AuthRequests.UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
	}

	private String normalizeEmail(String email) {
		return email == null ? "" : email.trim().toLowerCase();
	}

	private String passwordError(String password) {
		if (password.length() < 8) {
			return "Добавьте хотя бы 8 символов.";
		}
		if (!DIGIT.matcher(password).find()) {
			return "Добавьте хотя бы одну цифру.";
		}
		if (!UPPER.matcher(password).find()) {
			return "Добавьте хотя бы одну заглавную букву.";
		}
		return "";
	}

}
