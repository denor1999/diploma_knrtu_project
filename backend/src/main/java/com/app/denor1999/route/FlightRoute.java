package com.app.denor1999.route;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "flight_routes", uniqueConstraints = @UniqueConstraint(columnNames = { "origin_code", "destination_code" }))
public class FlightRoute {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "origin_code", nullable = false, length = 8)
	private String originCode;

	@Column(name = "destination_code", nullable = false, length = 8)
	private String destinationCode;

	@Column(nullable = false)
	private int distanceKm;

	@Column(nullable = false)
	private boolean international;

	protected FlightRoute() {
	}

	public FlightRoute(String originCode, String destinationCode, int distanceKm, boolean international) {
		this.originCode = originCode;
		this.destinationCode = destinationCode;
		this.distanceKm = distanceKm;
		this.international = international;
	}

	public Long getId() {
		return id;
	}

	public String getOriginCode() {
		return originCode;
	}

	public String getDestinationCode() {
		return destinationCode;
	}

	public int getDistanceKm() {
		return distanceKm;
	}

	public boolean isInternational() {
		return international;
	}

}
