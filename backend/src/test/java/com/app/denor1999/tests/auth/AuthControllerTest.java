package com.app.denor1999.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Import(TestData.class)
@TestPropertySource(locations = "classpath:testdata.properties", encoding = "UTF-8")
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private TestData testData;

	@Test
	void registersAndReturnsCurrentUser() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(registerJson(testData.getRegisterName(), testData.getRegisterEmail(), testData.getRegisterPassword())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.email").value(testData.getRegisterEmail().toLowerCase()))
				.andExpect(jsonPath("$.name").value(testData.getRegisterName()));
	}

	@Test
	void rejectsWeakPasswordAndDuplicateEmail() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(registerJson(testData.getWeakName(), testData.getWeakEmail(), testData.getWeakPassword())))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.detail").value("Добавьте хотя бы одну заглавную букву."));

		String demoEmail = testData.getDemoEmail();
		String mixedCaseEmail = Character.toUpperCase(demoEmail.charAt(0)) + demoEmail.substring(1);
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(registerJson(testData.getDuplicateName(), mixedCaseEmail, testData.getDemoPassword())))
				.andExpect(status().isConflict());
	}

	@Test
	void logsInDemoUserAndRejectsWrongPassword() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson(testData.getDemoEmail(), testData.getDemoPassword())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value(testData.getDemoName()));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson(testData.getDemoEmail(), testData.getWrongPassword())))
				.andExpect(status().isUnauthorized());
	}

	private static String registerJson(String name, String email, String password) {
		return """
				{"name":"%s","email":"%s","password":"%s"}
				""".formatted(name, email, password);
	}

	private static String loginJson(String email, String password) {
		return """
				{"email":"%s","password":"%s"}
				""".formatted(email, password);
	}

}
