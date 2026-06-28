## ADDED Requirements

### Requirement: User Registration
The system SHALL expose a GraphQL mutation to allow visitors to register as a new User with an email, a password, and a role.

#### Scenario: Registering a user with unique email
- **WHEN** the `register` mutation is called with an email, password, and roles
- **THEN** the system MUST hash the password using BCrypt, store the user in the database, and return the created User's details.

#### Scenario: Registering a user with duplicate email
- **WHEN** the `register` mutation is called with an already registered email
- **THEN** the system MUST fail and return a GraphQL error indicating the email is already in use.

### Requirement: User Login
The system SHALL expose a GraphQL mutation to authenticate a user and return a JSON Web Token (JWT).

#### Scenario: Login with correct credentials
- **WHEN** the `login` mutation is called with valid email and password credentials
- **THEN** the system MUST verify the credentials and return a response containing the user object and a signed JWT.

#### Scenario: Login with incorrect credentials
- **WHEN** the `login` mutation is called with incorrect email or password credentials
- **THEN** the system MUST fail with an authentication error and return no JWT.

### Requirement: Endpoint Authorization
The system SHALL intercept incoming requests to verify the presence and validity of the JWT in the `Authorization: Bearer <token>` header, restricting access based on user roles.

#### Scenario: Authorized GraphQL query
- **WHEN** a client performs a protected GraphQL operation passing a valid Admin JWT
- **THEN** the server MUST authorize the action and return the expected payload.

#### Scenario: Unauthorized GraphQL query
- **WHEN** a client performs a protected GraphQL operation without a token or with an invalid token
- **THEN** the server MUST return an authorization error and block access.
