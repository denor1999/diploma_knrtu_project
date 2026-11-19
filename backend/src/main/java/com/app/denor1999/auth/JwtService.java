package com.app.denor1999.auth;

import com.app.denor1999.user.UserAccount;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class JwtService {

	private final JwtEncoder encoder;
	private final Duration ttl;

	public JwtService(JwtEncoder encoder, @Value("${app.jwt.ttl-hours:168}") long ttlHours) {
		this.encoder = encoder;
		this.ttl = Duration.ofHours(ttlHours);
	}

	public String issue(UserAccount user) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(user.getEmail())
				.issuedAt(now)
				.expiresAt(now.plus(ttl))
				.claim("uid", user.getId())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

}
