package com.app.denor1999.subscription;

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
@Table(name = "subscriptions")
public class Subscription {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private UserAccount user;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "route_id")
	private FlightRoute route;

	@Column(nullable = false)
	private int targetPrice;

	@Column(nullable = false)
	private boolean active;

	@Column(nullable = false)
	private LocalDate departureDate;

	@Column(nullable = false)
	private Instant createdAt;

	protected Subscription() {
	}

	public Subscription(UserAccount user, FlightRoute route, int targetPrice, boolean active, LocalDate departureDate) {
		this.user = user;
		this.route = route;
		this.targetPrice = targetPrice;
		this.active = active;
		this.departureDate = departureDate;
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public UserAccount getUser() {
		return user;
	}

	public FlightRoute getRoute() {
		return route;
	}

	public int getTargetPrice() {
		return targetPrice;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public LocalDate getDepartureDate() {
		return departureDate;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

}
