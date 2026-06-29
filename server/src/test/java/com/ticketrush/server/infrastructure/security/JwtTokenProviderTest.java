package com.ticketrush.server.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private static final String SECRET = "test-secret-test-secret-test-secret-test-secret-1234";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, 3_600_000L);
    }

    @Test
    void generateTokenWithEmailAndExtraClaims() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", "abc-123");
        claims.put("roles", List.of("ROLE_USER"));

        String token = jwtTokenProvider.generateToken("user@example.com", claims);

        assertThat((CharSequence) token).isNotBlank();
        assertThat(jwtTokenProvider.extractUsername(token)).isEqualTo("user@example.com");
        String userId = jwtTokenProvider.extractClaim(token, c -> (String) c.get("userId"));
        assertThat(userId).isEqualTo("abc-123");
    }

    @Test
    void generateTokenFromUserDetails() {
        UserDetails userDetails = new User("user@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtTokenProvider.generateToken(userDetails);

        assertThat((CharSequence) token).isNotBlank();
        assertThat(jwtTokenProvider.extractUsername(token)).isEqualTo("user@example.com");
    }

    @Test
    void extractUsernameReturnsSubject() {
        String token = jwtTokenProvider.generateToken("subject@example.com", new HashMap<>());

        assertThat(jwtTokenProvider.extractUsername(token)).isEqualTo("subject@example.com");
    }

    @Test
    void extractExpirationReturnsFutureDate() {
        String token = jwtTokenProvider.generateToken("u@example.com", new HashMap<>());
        Date expiration = jwtTokenProvider.extractExpiration(token);

        assertThat(expiration).isAfter(new Date(System.currentTimeMillis() - 1000));
    }

    @Test
    void extractClaimReturnsValue() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom", "value-1");
        String token = jwtTokenProvider.generateToken("u@example.com", claims);

        String custom = jwtTokenProvider.extractClaim(token, c -> (String) c.get("custom"));
        assertThat(custom).isEqualTo("value-1");
    }

    @Test
    void validateTokenReturnsTrueForMatchingUser() {
        UserDetails userDetails = new User("u@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtTokenProvider.generateToken(userDetails);

        assertThat(jwtTokenProvider.validateToken(token, userDetails)).isTrue();
    }

    @Test
    void validateTokenReturnsFalseForDifferentUser() {
        UserDetails userDetails = new User("u@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        UserDetails otherUser = new User("other@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtTokenProvider.generateToken(userDetails);

        assertThat(jwtTokenProvider.validateToken(token, otherUser)).isFalse();
    }

    @Test
    void validateTokenReturnsFalseForExpiredToken() {
        // 2 second expiration so we can sleep past it comfortably
        JwtTokenProvider shortLived = new JwtTokenProvider(SECRET, 2_000L);
        UserDetails userDetails = new User("u@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        String token = shortLived.generateToken(userDetails);

        try {
            Thread.sleep(3_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // validateToken propagates ExpiredJwtException for expired tokens
        assertThatThrownBy(() -> shortLived.validateToken(token, userDetails))
                .isInstanceOf(Exception.class);
    }

    @Test
    void extractUsernameThrowsOnInvalidToken() {
        assertThatThrownBy(() -> jwtTokenProvider.extractUsername("not-a-real-jwt"))
                .isInstanceOf(Exception.class);
    }
}
