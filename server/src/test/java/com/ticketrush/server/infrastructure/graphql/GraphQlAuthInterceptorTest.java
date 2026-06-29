package com.ticketrush.server.infrastructure.graphql;

import com.ticketrush.server.domain.user.CustomUserDetailsService;
import com.ticketrush.server.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.graphql.server.WebSocketSessionInfo;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import reactor.test.StepVerifier;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GraphQlAuthInterceptorTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @InjectMocks
    private GraphQlAuthInterceptor interceptor;

    private WebSocketSessionInfo sessionInfo;
    private Map<String, Object> attributes;

    @BeforeEach
    void setUp() {
        attributes = new HashMap<>();
        sessionInfo = org.mockito.Mockito.mock(WebSocketSessionInfo.class);
        lenient().when(sessionInfo.getId()).thenReturn("session-1");
        lenient().when(sessionInfo.getAttributes()).thenReturn(attributes);
    }

    @Test
    void handleConnectionInitializationWithBearerToken() {
        UserDetails userDetails = new User("u@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        when(jwtTokenProvider.extractUsername("good-token")).thenReturn("u@example.com");
        when(userDetailsService.loadUserByUsername("u@example.com")).thenReturn(userDetails);
        when(jwtTokenProvider.validateToken("good-token", userDetails)).thenReturn(true);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Authorization", "Bearer good-token");

        StepVerifier.create(interceptor.handleConnectionInitialization(sessionInfo, payload))
                .expectNext(payload)
                .verifyComplete();

        assertThat(attributes).containsKey("securityContext");
    }

    @Test
    void handleConnectionInitializationWithRawToken() {
        UserDetails userDetails = new User("u@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        when(jwtTokenProvider.extractUsername("plain-token")).thenReturn("u@example.com");
        when(userDetailsService.loadUserByUsername("u@example.com")).thenReturn(userDetails);
        when(jwtTokenProvider.validateToken("plain-token", userDetails)).thenReturn(true);

        Map<String, Object> payload = new HashMap<>();
        payload.put("token", "plain-token");

        StepVerifier.create(interceptor.handleConnectionInitialization(sessionInfo, payload))
                .expectNext(payload)
                .verifyComplete();
    }

    @Test
    void handleConnectionInitializationWithInvalidToken() {
        when(jwtTokenProvider.extractUsername("bad-token"))
                .thenThrow(new RuntimeException("invalid"));

        Map<String, Object> payload = new HashMap<>();
        payload.put("Authorization", "Bearer bad-token");

        StepVerifier.create(interceptor.handleConnectionInitialization(sessionInfo, payload))
                .expectNext(payload)
                .verifyComplete();

        assertThat(attributes).doesNotContainKey("securityContext");
    }

    @Test
    void handleConnectionInitializationWithNonStringAuthHeader() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("Authorization", 12345);

        StepVerifier.create(interceptor.handleConnectionInitialization(sessionInfo, payload))
                .expectNext(payload)
                .verifyComplete();

        verify(jwtTokenProvider, never()).extractUsername(anyString());
    }

    @Test
    void handleConnectionInitializationWithEmptyPayload() {
        Map<String, Object> payload = new HashMap<>();

        StepVerifier.create(interceptor.handleConnectionInitialization(sessionInfo, payload))
                .expectNext(payload)
                .verifyComplete();
    }

    @Test
    void handleConnectionInitializationWithValidationFailure() {
        UserDetails userDetails = new User("u@example.com", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        when(jwtTokenProvider.extractUsername("token")).thenReturn("u@example.com");
        when(userDetailsService.loadUserByUsername("u@example.com")).thenReturn(userDetails);
        when(jwtTokenProvider.validateToken("token", userDetails)).thenReturn(false);

        Map<String, Object> payload = new HashMap<>();
        payload.put("Authorization", "Bearer token");

        StepVerifier.create(interceptor.handleConnectionInitialization(sessionInfo, payload))
                .expectNext(payload)
                .verifyComplete();

        assertThat(attributes).doesNotContainKey("securityContext");
    }

    @Test
    void handleConnectionClosedRemovesSession() {
        interceptor.handleConnectionClosed(sessionInfo, 1000, new HashMap<>());

        verify(jwtTokenProvider, never()).extractUsername(anyString());
    }
}
