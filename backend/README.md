# HydroAlert – Spring Boot + MySQL + Spring Security & JWT + React

Full-stack architecture for **HydroAlert – Real-Time Water Leakage Detection & Instant Alert System** (College Final-Year Project).

Built with **Java 17+**, **Spring Boot 3.x**, **Spring Security 6.x**, **JJWT**, **Spring Data JPA**, **Hibernate**, **MySQL**, and **React + TypeScript (Vite)**.

---

## 1. Database Architecture & JPA Entities

The backend uses **Spring Data JPA & Hibernate** to map domain objects to relational MySQL tables. Hibernate automatically manages schema creation/updates (`spring.jpa.hibernate.ddl-auto=update`).

### Database Tables:

| Table | Entity Class | Primary Key | Description |
| :--- | :--- | :--- | :--- |
| `users` | `User.java` | `id` (BIGINT AUTO_INCREMENT) | Stores operator / supervisor login credentials (`username`, `password`). |
| `water_readings` | `WaterReading.java` | `id` (BIGINT AUTO_INCREMENT) | Persists real-time water telemetry records (`location`, `flow_rate`, `timestamp`, `leakage_status`). |
| `incidents` | `Incident.java` | `id` (BIGINT AUTO_INCREMENT) | Persists leakage incidents through lifecycle (`location`, `flow_rate`, `detection_time`, `status`, `acknowledgement_time`, `resolution_time`). |

---

## 2. Quick Setup & MySQL Instructions

### Step 1: Create the MySQL Database
Log in to your local MySQL server (via MySQL Workbench, phpMyAdmin, or MySQL CLI terminal) and run:

```sql
CREATE DATABASE hydroalert_db;
```

---

### Step 2: Configure Database Credentials
Open `backend/src/main/resources/application.properties` and verify or set your MySQL username and password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hydroalert_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Automatically creates and updates MySQL tables matching JPA Entities
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Token Settings
hydroalert.app.jwtSecret=HydroAlertWaterLeakageDetectionSecretKey2026SecureJWTKeyCollegeFinalYearProjectSecret
hydroalert.app.jwtExpirationMs=86400000
```

---

### Step 3: Start the Spring Boot Backend
Make sure MySQL server is running, then run:

```bash
cd backend
mvn spring-boot:run
```

Once started, the backend runs on:
`http://localhost:8080`

---

## 3. Spring Security & JWT Architecture (Step 10)

### How JWT Authentication Works:
1. **Unprotected Login Route**: `POST /api/auth/login` is accessible without authentication.
2. **Credential Verification**: Validates incoming username and password against the MySQL `users` table via `UserDetailsServiceImpl`.
3. **Token Issuance**: If valid, generates a signed HMAC-SHA256 JSON Web Token (JWT) containing the username subject and a 24-hour expiration time.
4. **Protected Endpoints**: All requests to `/api/flow/**` and `/api/incidents/**` are intercepted by `AuthTokenFilter`.
5. **Token Verification**: `AuthTokenFilter` extracts the `Authorization: Bearer <token>` header, verifies the signature and expiration using `JwtUtils`, and sets the user's security context.
6. **401 Unauthorized**: If the header is missing, expired, or tampered with, `AuthEntryPointJwt` immediately halts the request and returns an HTTP 401 JSON error.

---

## 4. REST API Endpoints & Protection Matrix

| HTTP Method | Endpoint | Access Rule | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | **Public** (Permit All) | Authenticates credentials and returns Bearer JWT token. |
| `OPTIONS` | `/**` | **Public** (Permit All) | Allows browser CORS preflight checks. |
| `GET` | `/api/flow/readings` | **Protected (JWT)** | Fetches current water flow telemetry from MySQL. |
| `GET` | `/api/flow/simulate` | **Protected (JWT)** | Instructs backend to generate simulated reading and evaluate 8.0 L/min rule. |
| `POST` | `/api/flow/reading` | **Protected (JWT)** | Ingests a new reading. Spikes trigger `ACTIVE` incident. |
| `GET` | `/api/incidents/active` | **Protected (JWT)** | Retrieves all current active or acknowledged incidents. |
| `PUT` | `/api/incidents/{id}/acknowledge` | **Protected (JWT)** | Transitions incident `ACTIVE` &rarr; `ACKNOWLEDGED`. |
| `PUT` | `/api/incidents/{id}/resolve` | **Protected (JWT)** | Transitions incident `ACKNOWLEDGED` &rarr; `RESOLVED`. |
| `GET` | `/api/incidents/history` | **Protected (JWT)** | Retrieves resolved incident history from MySQL. |

---

## 5. How to Test Successful and Failed Login

### A. Testing Successful Login (curl)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "operator", "password": "operator123"}'
```
**Expected Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "operator",
  "name": "Primary Operator",
  "role": "Field Engineer"
}
```

### B. Testing Access to Protected API with JWT
```bash
TOKEN="<PASTE_TOKEN_FROM_STEP_A_HERE>"

curl -X GET http://localhost:8080/api/flow/readings \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Response (`200 OK`):** Returns the flow readings for Block A, B, and C.

### C. Testing Access Without JWT Token (Should Fail)
```bash
curl -X GET http://localhost:8080/api/flow/readings
```
**Expected Response (`401 Unauthorized`):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource. Please provide a valid Bearer JWT token.",
  "path": "/api/flow/readings"
}
```

### D. Testing Failed Login with Wrong Password
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "operator", "password": "wrongpassword"}'
```
**Expected Response (`401 Unauthorized`):**
```json
{
  "error": "Invalid username or password"
}
```

---

## 6. How to Run Both Frontend and Backend

### Terminal 1: Start the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*(Runs on `http://localhost:8080`)*

### Terminal 2: Start the React + TypeScript Frontend
```bash
npm run dev
```
*(Runs on `http://localhost:3000`)*

---

## 7. Automated Tests (JUnit & Spring Boot Testing)

HydroAlert includes automated tests covering leakage evaluation, incident lifecycle transitions, and Spring Security JWT protection:

### Test Classes & Coverage:

| Test Class | Requirements Tested | Description |
| :--- | :--- | :--- |
| **`WaterLeakageDetectionTest.java`** | Req 1, 2, 3 | Verifies flow rates < 8.0 L/min are `NORMAL`, rates &ge; 8.0 L/min are `POSSIBLE_LEAKAGE`, and anomalies create an `ACTIVE` incident. |
| **`IncidentLifecycleWorkflowTest.java`** | Req 4, 5, 6 | Verifies `ACTIVE` &rarr; `ACKNOWLEDGED`, `ACKNOWLEDGED` &rarr; `RESOLVED`, resolution history lookup, and enforcement of strict sequential progression. |
| **`SecurityAndJwtAuthenticationTest.java`** | Req 7, 8, 9, 10 | Verifies valid login returns a Bearer JWT, wrong password returns `401 Unauthorized`, unauthenticated requests are rejected with `401`, and valid tokens grant access to protected APIs. |

### How to Run the Tests:

```bash
cd backend

# Run all automated tests
mvn test

# Run a specific test class
mvn test -Dtest=WaterLeakageDetectionTest
mvn test -Dtest=IncidentLifecycleWorkflowTest
mvn test -Dtest=SecurityAndJwtAuthenticationTest
```

### Expected Test Results:
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.hydroalert.WaterLeakageDetectionTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.hydroalert.IncidentLifecycleWorkflowTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.hydroalert.SecurityAndJwtAuthenticationTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

---

## 8. Git and Docker Readiness

### A. Git Configuration & Hygiene
- **Root `.gitignore`**: Excludes `node_modules/`, `dist/`, build artifacts, IntelliJ/VSCode/Eclipse files, OS files (`.DS_Store`), logs, secret files (`*.key`, `*.pem`, `.env*`), and Docker volumes.
- **Backend `.gitignore`**: Excludes Maven `target/`, compiled `.class` files, packaging artifacts (`*.jar`, `*.war`), and local H2 database files.

### B. Dockerfile for Backend
Located at `backend/Dockerfile`, uses a lightweight **multi-stage build**:
- **Stage 1 (Builder)**: Uses `maven:3.9-eclipse-temurin-17-alpine` to compile and package the executable JAR.
- **Stage 2 (Runtime)**: Uses `eclipse-temurin:17-jre-alpine` running as a non-root user (`appuser`) on port 8080.

### C. Building & Running the Backend Docker Image

1. **Build the Docker Image**:
   ```bash
   cd backend
   docker build -t hydroalert-backend .
   ```

2. **Run the Standalone Container**:
   ```bash
   # Connects to host machine's MySQL
   docker run -p 8080:8080 \
     -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/hydroalert_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" \
     -e SPRING_DATASOURCE_USERNAME="root" \
     -e SPRING_DATASOURCE_PASSWORD="root" \
     hydroalert-backend
   ```

### D. Running with Docker Compose (Recommended)
You can run the entire backend and database stack with a single command from the project root:

```bash
docker compose up --build
```

This will automatically:
1. Start a **MySQL 8.0** container on port `3306` with database `hydroalert_db` and persistent storage.
2. Wait for MySQL to pass its health check.
3. Build and launch the **HydroAlert Spring Boot** backend on port `8080`.

---

## 9. DevOps & Deployment Guide

### A. How to Run Each Component

#### 1. Running MySQL
- **Option 1 (Local Service / XAMPP / Workbench)**:
  Ensure MySQL is running on port `3306`. Create the database:
  ```sql
  CREATE DATABASE hydroalert_db;
  ```
- **Option 2 (Docker Container)**:
  ```bash
  docker run -d --name hydroalert-mysql -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=root \
    -e MYSQL_DATABASE=hydroalert_db \
    mysql:8.0
  ```

#### 2. Running Spring Boot Backend
- Ensure Java 17+ and Maven are installed.
- Set environment variables or use defaults:
  ```bash
  cd backend
  mvn clean package -DskipTests
  mvn spring-boot:run
  ```
  Backend starts on `http://localhost:8080`.

#### 3. Running React Frontend
- Ensure Node.js 18+ is installed.
  ```bash
  npm install
  npm run dev
  ```
  Frontend starts on `http://localhost:3000` (or `http://localhost:5173`).

#### 4. Running Backend via Docker
- **Using Docker Compose (Full Stack Backend + MySQL)**:
  ```bash
  docker compose up --build -d
  ```
- **Verify Running Containers**:
  ```bash
  docker ps
  ```

---

### B. Checking Backend Health
The backend exposes a public, unauthenticated health check endpoint:

```bash
curl http://localhost:8080/api/health
```

**Expected JSON Response:**
```json
{
  "status": "UP",
  "service": "HydroAlert Backend API",
  "version": "1.0.0",
  "timestamp": "2026-09-30T16:15:30.123Z",
  "database": "CONNECTED",
  "databaseProduct": "MySQL"
}
```

---

### C. Safe Environment Configuration
Secrets and credentials are decoupled from source code using environment variables:

| Environment Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Server HTTP port | `8080` |
| `SPRING_DATASOURCE_URL` | JDBC connection URL | `jdbc:mysql://localhost:3306/hydroalert_db...` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | Injected securely |
| `JWT_SECRET` | 32+ character signing secret | Injected securely |
| `JWT_EXPIRATION_MS` | Token lifespan in ms | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `http://localhost:3000,http://localhost:5173` |

See `backend/.env.example` for a ready-to-use template.



