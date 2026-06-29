package com.ticketrush.server.domain.user;

import com.ticketrush.server.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthGraphQLControllerTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthGraphQLController authGraphQLController;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testRegisterSuccess() {
        AuthGraphQLController.RegisterInput input = new AuthGraphQLController.RegisterInput();
        input.setEmail("new@example.com");
        input.setPassword("password");
        input.setRoles(List.of("USER"));

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        User user = authGraphQLController.register(input);

        assertThat(user.getEmail()).isEqualTo("new@example.com");
        assertThat(user.getRoles()).contains("ROLE_USER");
    }

    @Test
    void testRegisterWithAlreadyPrefixedRole() {
        AuthGraphQLController.RegisterInput input = new AuthGraphQLController.RegisterInput();
        input.setEmail("new@example.com");
        input.setPassword("password");
        input.setRoles(List.of("ROLE_ADMIN"));

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = authGraphQLController.register(input);

        assertThat(user.getRoles()).contains("ROLE_ADMIN");
    }

    @Test
    void testRegisterWithNoRolesDefaultsToUser() {
        AuthGraphQLController.RegisterInput input = new AuthGraphQLController.RegisterInput();
        input.setEmail("new@example.com");
        input.setPassword("password");
        input.setRoles(null);

        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = authGraphQLController.register(input);

        assertThat(user.getRoles()).contains("ROLE_USER");
    }

    @Test
    void testRegisterAlreadyRegistered() {
        AuthGraphQLController.RegisterInput input = new AuthGraphQLController.RegisterInput();
        input.setEmail("existing@example.com");

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(User.builder().build()));

        assertThatThrownBy(() -> authGraphQLController.register(input))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void testLoginSuccess() {
        AuthGraphQLController.LoginInput input = new AuthGraphQLController.LoginInput();
        input.setEmail("user@example.com");
        input.setPassword("password");

        User existing = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .password("encoded")
                .roles(List.of("ROLE_USER"))
                .build();

        UserDetails principal = new org.springframework.security.core.userdetails.User(
                "user@example.com", "encoded",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "encoded",
                principal.getAuthorities());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(auth);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(existing));
        when(jwtTokenProvider.generateToken(org.mockito.ArgumentMatchers.eq("user@example.com"), any()))
                .thenReturn("signed-jwt");

        AuthGraphQLController.AuthPayload payload = authGraphQLController.login(input);

        assertThat(payload.getToken()).isEqualTo("signed-jwt");
        assertThat(payload.getUser()).isEqualTo(existing);
    }

    @Test
    void testLoginUserMissingAfterAuthentication() {
        AuthGraphQLController.LoginInput input = new AuthGraphQLController.LoginInput();
        input.setEmail("ghost@example.com");
        input.setPassword("password");

        UserDetails principal = new org.springframework.security.core.userdetails.User(
                "ghost@example.com", "encoded",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "encoded",
                principal.getAuthorities());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(auth);
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authGraphQLController.login(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void testMeReturnsCurrentUser() {
        User existing = User.builder()
                .email("user@example.com")
                .password("p")
                .roles(List.of("ROLE_USER"))
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                "user@example.com", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(existing));

        User result = authGraphQLController.me();

        assertThat(result).isEqualTo(existing);
    }

    @Test
    void testMeReturnsNullWhenNoAuth() {
        assertThat(authGraphQLController.me()).isNull();
    }

    @Test
    void testMeReturnsNullWhenUserMissing() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "ghost@example.com", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThat(authGraphQLController.me()).isNull();
    }
}
