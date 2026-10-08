package com.hydroalert;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hydroalert.dto.LoginRequest;
import com.hydroalert.entity.User;
import com.hydroalert.repository.UserRepository;
import com.hydroalert.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Automated tests for Spring Security & JWT Authentication.
 *
 * Requirements covered:
 * 7. Valid login credentials should return a JWT.
 * 8. Invalid login credentials should return 401 Unauthorized.
 * 9. Protected APIs should reject requests without a valid JWT.
 * 10. Protected APIs should accept requests with a valid JWT.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityAndJwtAuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        // Ensure test user exists in the database
        if (!userRepository.existsByUsername("operator")) {
            userRepository.save(new User("operator", "operator123"));
        }
    }

    @Test
    @DisplayName("Requirement 7: Valid login credentials should return a JWT")
    void testValidLoginReturnsJwt() throws Exception {
        LoginRequest loginRequest = new LoginRequest("operator", "operator123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.username", is("operator")));
    }

    @Test
    @DisplayName("Requirement 8: Invalid login credentials should return 401 Unauthorized")
    void testInvalidLoginReturnsUnauthorized() throws Exception {
        // 1. Test incorrect password
        LoginRequest badPasswordRequest = new LoginRequest("operator", "incorrect_password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPasswordRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", containsString("Invalid username or password")));

        // 2. Test nonexistent user
        LoginRequest unknownUserRequest = new LoginRequest("nonexistent_user", "some_password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unknownUserRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("Requirement 9: Protected APIs should reject requests without a valid JWT")
    void testProtectedApisRejectRequestWithoutToken() throws Exception {
        // 1. Water flow readings endpoint
        mockMvc.perform(get("/api/flow/readings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.status", is(401)));

        // 2. Active incidents endpoint
        mockMvc.perform(get("/api/incidents/active"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.status", is(401)));

        // 3. Incident history endpoint
        mockMvc.perform(get("/api/incidents/history"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.status", is(401)));

        // 4. Request with malformed / fake token should also be rejected
        mockMvc.perform(get("/api/flow/readings")
                        .header("Authorization", "Bearer invalid.fake.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Requirement 10: Protected APIs should accept requests with a valid JWT")
    void testProtectedApisAcceptRequestWithValidToken() throws Exception {
        // Step 1: Login to acquire a valid JWT token
        LoginRequest loginRequest = new LoginRequest("operator", "operator123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = jsonNode.get("token").asText();
        assertNotNull(token);
        assertFalse(token.isBlank());

        // Step 2: Access protected water flow readings using Authorization: Bearer <token>
        mockMvc.perform(get("/api/flow/readings")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$[0].location", notNullValue()))
                .andExpect(jsonPath("$[0].flowRate", notNullValue()));

        // Step 3: Access protected active incidents using the same token
        mockMvc.perform(get("/api/incidents/active")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));

        // Step 4: Access protected incident history
        mockMvc.perform(get("/api/incidents/history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("Health Check: GET /api/health should be publicly accessible without authentication")
    void testHealthCheckEndpointPubliclyAccessible() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", containsString("HydroAlert")))
                .andExpect(jsonPath("$.database", notNullValue()))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }
}
