**Local Docker (development) — Persistence & safe operations**

- **Purpose:** Run backend, frontend and a local Postgres for development using `docker-compose.local.yml`.
- **Persistence:** Postgres data is stored in a named volume `db_data`. Uploaded files are mapped to `./backend/uploads`. These will persist across container restarts and host reboots.

- **Restart policy:** Services use `restart: always` so containers will be restarted automatically (including after Docker/host reboot and after manual Stop).

- **Start stack:**
  ```bash
  docker compose -f docker-compose.local.yml up -d --build
  ```

- **Stop stack (safe):** Stops containers but keeps data and images. Containers may be restarted automatically by Docker due to `restart: always`.
  ```bash
  docker compose -f docker-compose.local.yml stop
  ```

- **Completely remove stack (DESTROYS data):** This will remove containers and the Postgres volume (data loss).
  ```bash
  docker compose -f docker-compose.local.yml down -v
  ```

- **View status / logs / useful commands:**
  - `docker compose -f docker-compose.local.yml ps`
  - `docker compose -f docker-compose.local.yml logs -f backend`
  - `docker volume ls`

- **Database seed (create admin):** From repo root:
  ```bash
  node backend/scripts/seed-admin.js postgresql://postgres:postgres@localhost:5432/loeitech
  ```

- **Notes & cautions:**
  - Avoid `down -v` unless you intend to delete DB data.
  - If you want containers to stop and *not* restart automatically after you manually stop them, change `restart: always` → `restart: unless-stopped` in `docker-compose.local.yml` and recreate the stack.

  ## Backups (recommended)

  - Create a backup directory and run the included PowerShell scripts from the repository root.

    - Backup database:
      ```powershell
      .\scripts\backup-db.ps1
      ```

    - Backup uploads:
      ```powershell
      .\scripts\backup-uploads.ps1
      ```

    - Full backup (DB + uploads):
      ```powershell
      .\scripts\backup-all.ps1
      ```

  Backups are saved to the `backups/` folder with timestamps. Store those off-machine for disaster recovery.

File references:
- Compose: [docker-compose.local.yml](docker-compose.local.yml)
- Backend uploads folder: [backend/uploads](backend/uploads)
