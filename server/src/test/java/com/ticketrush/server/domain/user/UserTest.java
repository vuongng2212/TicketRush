package com.ticketrush.server.domain.user;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class UserTest {
    @Test
    void testUserBuilderAndGetters() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("test@example.com")
                .password("password")
                .build();

        assertThat(user.getId()).isEqualTo(userId);
        assertThat(user.getEmail()).isEqualTo("test@example.com");
    }
}
