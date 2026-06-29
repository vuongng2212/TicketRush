package com.ticketrush.server.domain.user;

import com.ticketrush.server.infrastructure.security.JwtTokenProvider;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AuthGraphQLController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public User me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @MutationMapping
    public User register(@Argument RegisterInput input) {
        if (userRepository.findByEmail(input.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        List<String> roles = input.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = List.of("ROLE_USER");
        } else {
            // Ensure roles format is correct (must start with ROLE_)
            roles = roles.stream()
                    .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase())
                    .toList();
        }

        User user = User.builder()
                .email(input.getEmail())
                .password(passwordEncoder.encode(input.getPassword()))
                .roles(roles)
                .build();

        return userRepository.save(user);
    }

    @MutationMapping
    public AuthPayload login(@Argument LoginInput input) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found after authentication"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("roles", user.getRoles());

        String token = jwtTokenProvider.generateToken(user.getEmail(), claims);

        AuthPayload payload = new AuthPayload();
        payload.setToken(token);
        payload.setUser(user);
        return payload;
    }

    @Data
    public static class RegisterInput {
        private String email;
        private String password;
        private List<String> roles;
    }

    @Data
    public static class LoginInput {
        private String email;
        private String password;
    }

    @Data
    public static class AuthPayload {
        private String token;
        private User user;
    }
}
