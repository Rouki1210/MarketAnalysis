## Running MarketAnalysisBackend with Docker

### Requirements
- **.NET Version:** 8.0 (as specified in the Dockerfile)
- **Docker Compose:** Uses `docker-compose.yml` for multi-container orchestration

### Build & Run Instructions
1. Ensure Docker and Docker Compose are installed.
2. From the project root, build and start the service:
   ```sh
   docker compose up --build
   ```
   This will build the image using the provided `Dockerfile` and start the backend service.

### Service Details
- **Service Name:** `csharp-marketanalysisbackend`
- **Ports Exposed:**
  - 8080 (mapped to host 8080)
  - 8081 (mapped to host 8081)
- **Network:** Uses a custom bridge network `backendnet` (defined in `docker-compose.yml`)
- **User:** Runs as a non-root user (`appuser`) for improved security
- **Restart Policy:** `unless-stopped` (service will restart unless explicitly stopped)
- **Init:** Uses Docker's `init` for proper signal handling

### Environment Variables
- No required environment variables are specified in the Docker or Compose files. If you add a `.env` file, uncomment the `env_file` line in `docker-compose.yml`.

### Special Configuration
- If you add database or other services, update `docker-compose.yml` and use the `depends_on` field as needed.
- The application is published and run from `/app/publish` inside the container.

---
*This section was updated to reflect the current Docker setup for MarketAnalysisBackend. Please ensure any future changes to Dockerfiles or Compose files are reflected here.*
