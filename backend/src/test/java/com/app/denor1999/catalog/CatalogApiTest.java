package com.app.denor1999.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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
@AutoConfigureMockMvc
class CatalogApiTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void listsSeededRoutesAndCreatesForecast() throws Exception {
		mockMvc.perform(get("/api/routes"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(4)))
				.andExpect(jsonPath("$[0].originCode").exists());

		mockMvc.perform(post("/api/forecasts")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"from":"SVO","to":"AER","date":"2026-11-24","userId":1}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.from").value("SVO"))
				.andExpect(jsonPath("$.to").value("AER"))
				.andExpect(jsonPath("$.rec").value("buy"))
				.andExpect(jsonPath("$.current").value(8400))
				.andExpect(jsonPath("$.factors.length()").value(4));

		mockMvc.perform(get("/api/forecasts").param("userId", "1"))
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
		mockMvc.perform(get("/api/subscriptions").param("userId", "1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(2)));

		String body = mockMvc.perform(post("/api/subscriptions")
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
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"active":false}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.active").value(false));

		mockMvc.perform(delete("/api/subscriptions/" + id))
				.andExpect(status().isNoContent());
	}

}
