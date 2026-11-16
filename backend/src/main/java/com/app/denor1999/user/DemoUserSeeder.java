package com.app.denor1999.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserSeeder implements CommandLineRunner {

	static final String EMAIL = "ozhgixinv@list.ru";
	static final String PASSWORD = "Ivan1234";

	private final UserRepository users;
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public DemoUserSeeder(UserRepository users) {
		this.users = users;
	}

	@Override
	public void run(String... args) {
		if (users.existsByEmail(EMAIL)) {
			return;
		}
		users.save(new UserAccount("Иван Ожгихин", EMAIL, passwordEncoder.encode(PASSWORD), "user"));
	}

}
