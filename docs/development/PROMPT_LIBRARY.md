# Chapter 24: Reusable AI Prompt Library

---
◀️ **[Previous](AI_GUIDELINES.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](CONTRIBUTING.md)** ▶️
---



## 24.1. Prompt Library Categories for Development

### 1. Add a New Module
```text
You are an expert full-stack developer. Generate a new module for the ARCUS platform called [MODULE_NAME]. Create the service file in server/src/modules/[MODULE_NAME]/[MODULE_NAME]Service.ts, keeping controllers thin. Expose Express routes under /api/[MODULE_NAME] in server/src/index.ts, sanitizing text inputs using shared/validation.ts and ensuring the JSON DB fallback path is implemented. Provide DDL migrations for table setup in server/src/database/migrations.ts.
```

### 2. Refactor Safely
```text
Analyze the service method [METHOD_NAME] in [FILE_PATH]. Refactor it to improve readability and complexity while guaranteeing that DTO properties, API response shapes, and database constraints remain backward compatible. Provide a diff block showing the before and after states.
```

### 3. Optimize Performance
```text
Analyze the database query below: [QUERY_SPEC]. Propose B-Tree indexes for PostgreSQL and write audit queries (EXPLAIN ANALYZE) to verify execution speed improvements under 15ms.
```

### 4. Create Migrations
```text
Write an idempotent PostgreSQL migration script in server/src/database/migrations.ts adding a table called [TABLE_NAME] with columns: [COLUMNS]. Ensure it uses "IF NOT EXISTS", adds check constraints for negative balances, and contains corresponding initJsonDb failover maps in initDb.ts.
```

### 5. Review Architecture
```text
Compare the design of the [MODULE_NAME] service layer to the guidelines in Chapter 3 (ADRs) and Chapter 5 (Engineering Principles). Check for any bypassed service layers, un-audited writes, or denormalized table updates.
```

### 6. Build APIs
```text
Expose a new REST API endpoint [HTTP_METHOD] [ROUTE_URI] that expects [PAYLOAD_JSON]. Integrate custom rate limiters and validate scopes using checkIsAdmin or auth middleware. Ensure response shapes conform exactly to DTO property contracts.
```

### 7. Debug Production Issues
```text
Examine the database and ledger schema in PROJECT_BRAIN.md. Write SQL check queries to audit why wallet balances could mismatch the sum of transaction ledger values in buildpoints_ledger.
```

### 8. Generate Tests
```text
Write an integration test suite for the domain service [SERVICE_NAME]. Mock the db.ts query facade and check for proper inventory locks, double-entry wallet adjustments, and reorder levels thresholds warning alerts.
```

### 9. Review SQL Queries
```text
Examine the Express route handler SQL queries below. Identify any direct SQL injection vectors or missing input sanitizers (sanitizeText calls). Propose refactoring queries into parameter-mapped service blocks.
```

### 10. Add Indexes
```text
Review the Database Data Dictionary. Identify which tables (e.g. orders, products) carry high read frequency and lack indexes on target foreign keys. Propose B-Tree DDL indexes statements to decrease latency.
```


---

---
◀️ **[Previous](AI_GUIDELINES.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](CONTRIBUTING.md)** ▶️
