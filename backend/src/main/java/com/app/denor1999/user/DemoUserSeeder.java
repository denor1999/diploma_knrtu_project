package com.app.denor1999.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DemoUserSeeder implements CommandLineRunner {

	private final UserRepository users;
	private final PasswordEncoder passwordEncoder;
	private final String name;
	private final String email;
	private final String password;

	public DemoUserSeeder(
			UserRepository users,
			@Value("${app.demo.name:}") String name,
			@Value("${app.demo.email:}") String email,
			@Value("${app.demo.password:}") String password,
			PasswordEncoder passwordEncoder) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.name = name;
		this.email = email;
		this.password = password;
	}

	@Override
	public void run(String... args) {
		if (email == null || email.isBlank() || password == null || password.isBlank() || users.existsByEmail(email)) {
			return;
		}
		users.save(new UserAccount(name, email, passwordEncoder.encode(password), "user"));
	}

}
