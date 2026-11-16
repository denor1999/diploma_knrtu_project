package com.app.denor1999.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void registersAndReturnsCurrentUser() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Анна","email":"Anna@example.ru","password":"Ivan1234"}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.email").value("anna@example.ru"))
				.andExpect(jsonPath("$.name").value("Анна"));
	}

	@Test
	void rejectsWeakPasswordAndDuplicateEmail() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Анна","email":"weak@example.ru","password":"ivan1234"}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.detail").value("Добавьте хотя бы одну заглавную букву."));

		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Иван","email":"Ozhgixinv@list.ru","password":"Ivan1234"}
								"""))
				.andExpect(status().isConflict());
	}

	@Test
	void logsInDemoUserAndRejectsWrongPassword() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"ozhgixinv@list.ru","password":"Ivan1234"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Иван Ожгихин"));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"ozhgixinv@list.ru","password":"wrong"}
								"""))
				.andExpect(status().isUnauthorized());
	}

}
