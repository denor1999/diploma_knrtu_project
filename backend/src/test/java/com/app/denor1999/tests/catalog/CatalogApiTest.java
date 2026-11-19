package com.app.denor1999.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class CatalogApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Value("${app.demo.email}")
	private String demoEmail;

	@Value("${app.demo.password}")
	private String demoPassword;

	@Test
	void listsSeededRoutesAndCreatesForecast() throws Exception {
		String token = login(demoEmail, demoPassword);

		mockMvc.perform(get("/api/routes"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(4)))
				.andExpect(jsonPath("$[0].originCode").exists());

		mockMvc.perform(post("/api/forecasts")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"from":"SVO","to":"AER","date":"2026-11-24","userId":999}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.from").value("SVO"))
				.andExpect(jsonPath("$.to").value("AER"))
				.andExpect(jsonPath("$.rec").value("buy"))
				.andExpect(jsonPath("$.current").value(8400))
				.andExpect(jsonPath("$.factors.length()").value(4));

		mockMvc.perform(get("/api/forecasts"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(get("/api/forecasts").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));

		mockMvc.perform(get("/api/forecasts/quote")
						.param("from", "SVO")
						.param("to", "KZN")
						.param("date", "2026-11-24"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.to").value("KZN"))
				.andExpect(jsonPath("$.current").value(5200));
	}

	@Test
	void managesSubscriptionsForDemoUser() throws Exception {
		String token = login(demoEmail, demoPassword);

		mockMvc.perform(get("/api/subscriptions").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));

		String body = mockMvc.perform(post("/api/subscriptions")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"userId":1,"from":"SVO","to":"LED","date":"2026-11-24","target":3900}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.to").value("LED"))
				.andExpect(jsonPath("$.active").value(true))
				.andReturn()
				.getResponse()
				.getContentAsString();

		String id = body.replaceAll(".*\"id\":(\\d+).*", "$1");

		mockMvc.perform(patch("/api/subscriptions/" + id)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"active":false}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.active").value(false));

		String stranger = registerToken("stranger-" + System.nanoTime() + "@example.ru");
		mockMvc.perform(delete("/api/subscriptions/" + id).header("Authorization", "Bearer " + stranger))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/subscriptions/" + id).header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());
	}

	private String login(String email, String password) throws Exception {
		String body = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"%s","password":"%s"}
								""".formatted(email, password)))
				.andExpect(status().isOk())
				.andReturn()
				.getResponse()
				.getContentAsString();
		return tokenFrom(body);
	}

	private String registerToken(String email) throws Exception {
		String body = mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Чужой","email":"%s","password":"%s"}
								""".formatted(email, demoPassword)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse()
				.getContentAsString();
		return tokenFrom(body);
	}

	private static String tokenFrom(String body) {
		String marker = "\"token\":\"";
		int start = body.indexOf(marker);
		if (start < 0) {
			throw new IllegalStateException("token missing");
		}
		start += marker.length();
		int end = body.indexOf('"', start);
		return body.substring(start, end);
	}

}
