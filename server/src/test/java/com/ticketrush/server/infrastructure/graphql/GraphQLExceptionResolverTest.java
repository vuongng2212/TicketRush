package com.ticketrush.server.infrastructure.graphql;

import graphql.GraphQLError;
import graphql.execution.ExecutionStepInfo;
import graphql.execution.ResultPath;
import graphql.language.Field;
import graphql.language.SourceLocation;
import graphql.schema.DataFetchingEnvironment;
import org.junit.jupiter.api.Test;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GraphQLExceptionResolverTest {

    // Subclass the production class to expose the protected resolveToSingleError method
    static class ExposedResolver extends GraphQLExceptionResolver {
        public GraphQLError resolveToSingleErrorPublic(Throwable ex, DataFetchingEnvironment env) {
            return resolveToSingleError(ex, env);
        }
    }

    @Test
    void resolveIllegalArgumentExceptionToBadRequest() {
        GraphQLError error = invoke(new IllegalArgumentException("bad input"));
        assertThat(error).isNotNull();
        assertThat(error.getErrorType()).isEqualTo(ErrorType.BAD_REQUEST);
        assertThat(error.getMessage()).isEqualTo("bad input");
    }

    @Test
    void resolveAccessDeniedExceptionToForbidden() {
        GraphQLError error = invoke(new AccessDeniedException("nope"));
        assertThat(error).isNotNull();
        assertThat(error.getErrorType()).isEqualTo(ErrorType.FORBIDDEN);
        assertThat(error.getMessage()).contains("Access denied").contains("nope");
    }

    @Test
    void resolveAuthenticationExceptionToUnauthorized() {
        GraphQLError error = invoke(new BadCredentialsException("bad creds"));
        assertThat(error).isNotNull();
        assertThat(error.getErrorType()).isEqualTo(ErrorType.UNAUTHORIZED);
        assertThat(error.getMessage()).contains("Authentication failed").contains("bad creds");
    }

    @Test
    void resolveGenericExceptionToInternalError() {
        GraphQLError error = invoke(new RuntimeException("boom"));
        assertThat(error).isNotNull();
        assertThat(error.getErrorType()).isEqualTo(ErrorType.INTERNAL_ERROR);
        assertThat(error.getMessage()).contains("Internal server error").contains("boom");
    }

    private GraphQLError invoke(Throwable ex) {
        return new ExposedResolver().resolveToSingleErrorPublic(ex, mockEnv("field"));
    }

    private DataFetchingEnvironment mockEnv(String fieldName) {
        DataFetchingEnvironment env = mock(DataFetchingEnvironment.class);
        Field field = Field.newField(fieldName).sourceLocation(new SourceLocation(1, 1)).build();
        ExecutionStepInfo executionStepInfo = mock(ExecutionStepInfo.class);
        when(executionStepInfo.getPath()).thenReturn(ResultPath.rootPath().segment(fieldName));
        when(env.getExecutionStepInfo()).thenReturn(executionStepInfo);
        when(env.<graphql.language.Field>getField()).thenReturn(field);
        return env;
    }
}
