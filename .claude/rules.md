# Co-working Rules for Claude Code and Codex

# Role Division
- **Claude Code (Sonnet/Opus):** Responsible for complex logic, system planning, DDD architecture design, writing script logic (e.g., Redis Lua script), and configuring RabbitMQ. Limit reasoning to medium maximum.
- **Codex:** Responsible for fixing syntax errors, implementing CRUD operations, simple bug fixing, and small tasks.

# Git Protocol
- Create branch using format: `<Name>/<scope>/<description>` from `dev`.
- Commit messages must follow Conventional Commits format.
- Always run local tests (backend `./mvnw test`, frontend `pnpm lint`) before requesting a merge or pushing to `main`.

# Tech Stack Strict Standards
- **Java:** Use Java 21 features (like Record types, Virtual Threads, Pattern Matching). Prefer Lombok for boilerplate reduction. Strictly enforce DDD boundaries in package structure.
- **GraphQL:** Use Schema-first approach. Place schemas under `src/main/resources/graphql/` and use Spring for GraphQL annotations.
- **Next.js:** Next.js 14+ App Router standard. No `any` types in TypeScript.
- **Testing:** Integration tests must run against real database instances (using Testcontainers or docker-compose active test profile) rather than heavily stubbed mocks for critical transaction code.
