package com.ticketrush.server.infrastructure.graphql;

import com.ticketrush.server.domain.user.CustomUserDetailsService;
import com.ticketrush.server.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.graphql.server.WebSocketGraphQlInterceptor;
import org.springframework.graphql.server.WebSocketSessionInfo;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class GraphQlAuthInterceptor implements WebSocketGraphQlInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    // Store user authentications per WebSocket session ID since WebGraphQlInterceptor is stateless but connectionInit payload only arrives once.
    private final Map<String, SecurityContext> sessionAuthMap = new ConcurrentHashMap<>();

    @Override
    public Mono<Object> handleConnectionInitialization(WebSocketSessionInfo sessionInfo, Map<String, Object> connectionInitPayload) {
        log.debug("WebSocket connection initialization payload: {}", connectionInitPayload);
        
        String token = null;
        if (connectionInitPayload != null) {
            Object authHeaderObj = connectionInitPayload.get("Authorization");
            if (authHeaderObj instanceof String authHeader) {
                if (authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            } else {
                Object tokenObj = connectionInitPayload.get("token");
                if (tokenObj instanceof String tokenStr) {
                    token = tokenStr;
                }
            }
        }

        if (token != null) {
            try {
                String userEmail = jwtTokenProvider.extractUsername(token);
                if (userEmail != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                    if (jwtTokenProvider.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        
                        SecurityContext context = SecurityContextHolder.createEmptyContext();
                        context.setAuthentication(authToken);
                        
                        sessionInfo.getAttributes().put("securityContext", context);
                        sessionAuthMap.put(sessionInfo.getId(), context);
                        
                        log.debug("WebSocket session initialized & authenticated for user: {}", userEmail);
                        return Mono.just(connectionInitPayload);
                    }
                }
            } catch (Exception e) {
                log.warn("WebSocket token verification on init failed: {}", e.getMessage());
            }
        }

        return Mono.just(connectionInitPayload);
    }

    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        // Retrieve security context if WebSocket request has session attributes
        SecurityContext context = null;
        if (request instanceof org.springframework.graphql.server.WebSocketGraphQlRequest wsRequest) {
            context = sessionAuthMap.get(wsRequest.getSessionInfo().getId());
        }

        if (context != null) {
            final SecurityContext finalContext = context;
            return chain.next(request)
                    .contextWrite(reactorContext -> reactorContext.put(SecurityContext.class, finalContext));
        }

        return chain.next(request);
    }

    @Override
    public void handleConnectionClosed(WebSocketSessionInfo sessionInfo, int statusCode, Map<String, Object> connectionInitPayload) {
        log.debug("WebSocket connection closed, clearing auth from sessionAuthMap for session: {}", sessionInfo.getId());
        sessionAuthMap.remove(sessionInfo.getId());
    }
}
