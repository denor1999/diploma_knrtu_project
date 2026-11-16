package com.app.denor1999.route;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RouteRepository extends JpaRepository<FlightRoute, Long> {

	Optional<FlightRoute> findByOriginCodeAndDestinationCode(String originCode, String destinationCode);

}
