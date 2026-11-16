package com.app.denor1999.route;

public final class RouteDtos {

	private RouteDtos() {
	}

	public record RouteResponse(Long id, String originCode, String destinationCode, int distanceKm, boolean international) {
		public static RouteResponse from(FlightRoute route) {
			return new RouteResponse(
					route.getId(),
					route.getOriginCode(),
					route.getDestinationCode(),
					route.getDistanceKm(),
					route.isInternational());
		}
	}

}
