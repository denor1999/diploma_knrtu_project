package com.app.denor1999.route;

import com.app.denor1999.auth.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/routes", "/routes"})
public class RouteController {

	private final RouteRepository routes;

	public RouteController(RouteRepository routes) {
		this.routes = routes;
	}

	@GetMapping
	public List<RouteDtos.RouteResponse> list(
			@RequestParam(required = false) String from,
			@RequestParam(required = false) String to) {
		if (from != null && to != null) {
			return routes.findByOriginCodeAndDestinationCode(Airports.require(from, "Откуда"), Airports.require(to, "Куда"))
					.map(RouteDtos.RouteResponse::from)
					.map(List::of)
					.orElseGet(List::of);
		}
		return routes.findAll().stream().map(RouteDtos.RouteResponse::from).toList();
	}

	@GetMapping("/{id}")
	public RouteDtos.RouteResponse one(@PathVariable Long id) {
		return routes.findById(id)
				.map(RouteDtos.RouteResponse::from)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Маршрут не найден."));
	}

}
