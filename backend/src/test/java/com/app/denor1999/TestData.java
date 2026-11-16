package com.app.denor1999.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.TestConfiguration;

@TestConfiguration
public class TestData {

	private final String demoName;
	private final String demoEmail;
	private final String demoPassword;
	private final String registerName;
	private final String registerEmail;
	private final String registerPassword;
	private final String weakName;
	private final String weakEmail;
	private final String weakPassword;
	private final String duplicateName;
	private final String wrongPassword;

	public TestData(
			@Value("${app.demo.name}") String demoName,
			@Value("${app.demo.email}") String demoEmail,
			@Value("${app.demo.password}") String demoPassword,
			@Value("${test.register.name}") String registerName,
			@Value("${test.register.email}") String registerEmail,
			@Value("${test.register.password}") String registerPassword,
			@Value("${test.weak.name}") String weakName,
			@Value("${test.weak.email}") String weakEmail,
			@Value("${test.weak.password}") String weakPassword,
			@Value("${test.duplicate.name}") String duplicateName,
			@Value("${test.wrong.password}") String wrongPassword) {
		this.demoName = demoName;
		this.demoEmail = demoEmail;
		this.demoPassword = demoPassword;
		this.registerName = registerName;
		this.registerEmail = registerEmail;
		this.registerPassword = registerPassword;
		this.weakName = weakName;
		this.weakEmail = weakEmail;
		this.weakPassword = weakPassword;
		this.duplicateName = duplicateName;
		this.wrongPassword = wrongPassword;
	}

	public String getDemoName() {
		return demoName;
	}

	public String getDemoEmail() {
		return demoEmail;
	}

	public String getDemoPassword() {
		return demoPassword;
	}

	public String getRegisterName() {
		return registerName;
	}

	public String getRegisterEmail() {
		return registerEmail;
	}

	public String getRegisterPassword() {
		return registerPassword;
	}

	public String getWeakName() {
		return weakName;
	}

	public String getWeakEmail() {
		return weakEmail;
	}

	public String getWeakPassword() {
		return weakPassword;
	}

	public String getDuplicateName() {
		return duplicateName;
	}

	public String getWrongPassword() {
		return wrongPassword;
	}

}
