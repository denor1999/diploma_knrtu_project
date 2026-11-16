package com.app.denor1999.forecast;

import com.app.denor1999.route.FlightRoute;
import com.app.denor1999.user.UserAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "forecasts")
public class Forecast {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "route_id")
	private FlightRoute route;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private UserAccount user;

	@Column(nullable = false)
	private LocalDate departureDate;

	@Column(nullable = false)
	private int predictedPrice;

	@Column(nullable = false)
	private int currentPrice;

	@Column(nullable = false)
	private int lowBound;

	@Column(nullable = false)
	private int highBound;

	@Column(nullable = false, length = 16)
	private String recommendation;

	@Column(nullable = false, length = 4000)
	private String explanation;

	@Column(nullable = false)
	private Instant createdAt;

	protected Forecast() {
	}

	public Forecast(
			FlightRoute route,
			UserAccount user,
			LocalDate departureDate,
			int predictedPrice,
			int currentPrice,
			int lowBound,
			int highBound,
			String recommendation,
			String explanation) {
		this.route = route;
		this.user = user;
		this.departureDate = departureDate;
		this.predictedPrice = predictedPrice;
		this.currentPrice = currentPrice;
		this.lowBound = lowBound;
		this.highBound = highBound;
		this.recommendation = recommendation;
		this.explanation = explanation;
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public FlightRoute getRoute() {
		return route;
	}

	public UserAccount getUser() {
		return user;
	}

	public LocalDate getDepartureDate() {
		return departureDate;
	}

	public int getPredictedPrice() {
		return predictedPrice;
	}

	public int getCurrentPrice() {
		return currentPrice;
	}

	public int getLowBound() {
		return lowBound;
	}

	public int getHighBound() {
		return highBound;
	}

	public String getRecommendation() {
		return recommendation;
	}

	public String getExplanation() {
		return explanation;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
