# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install                 # Install dependencies (runs electron-rebuild for sqlite3)
npm run electron:dev        # Start development (Vite + Electron concurrently)
npm run electron:build      # Build for production (type-check + vite build + electron-builder)
npm run type-check          # TypeScript type checking with vue-tsc
npm run dev                 # Vite dev server only (without Electron)
npm run build               # Build Vue app only (type-check + vite build)
```

## Architecture Overview

This is an Electron + Vue 3 desktop application for tracking gym/club members and their memberships.

### Two-Process Architecture

**Main Process (Electron - `electron/`):**
- `main.mjs` - App entry, window creation, IPC handler registration
- `database.js` - Sequelize/SQLite initialization, exports `databaseReady` promise
- `preload.js` - Exposes `window.electron` API with IPC methods to renderer

**Renderer Process (Vue - `src/`):**
- Vue 3 with Composition API, TypeScript, Tailwind CSS + DaisyUI
- vue-i18n for internationalization (Bulgarian/English, default: Bulgarian)

### IPC Communication Pattern

1. **IPC Constants** (`electron/ipc/ipcConstant.js`) - Central channel name definitions
2. **IPC Handlers** (`electron/ipc/*Handlers.js`) - Register handlers with `ipcMain.handle()`
3. **Preload Bridge** (`electron/preload.js`) - Exposes typed methods via `contextBridge`
4. **Frontend Access** - Components call `window.electron.ipcRenderer.invoke(channel, ...args)`
5. **Composables** (`src/composables/`) - Vue composables wrap IPC calls (e.g., `useMember.ts`)

### Data Layer

**Models** (`electron/models/`) - Sequelize models with soft delete via `deletedAt`:
- `Member` - firstName, lastName, nickname, description
- `Membership` - name, description, days, type ('time'|'training'), trainings
- `MemberMembership` - Links members to memberships with dates and training counts
- `Notification` - Membership expiration alerts
- `TrainingLog` - Training session records

**Associations** (`electron/associations.js`):
- Member hasMany MemberMembership
- Membership hasMany MemberMembership
- MemberMembership hasOne Notification, hasMany TrainingLog

**Repositories** (`electron/repositories/`) - Extend `BaseRepository` for CRUD operations with soft delete pattern.

### Key Technical Details

- Database path: `app.getPath('userData')/database.sqlite`
- Safe migrations via ALTER TABLE in `database.js` (catches "column exists" errors)
- Type definitions for Electron API in `src/types/electron.d.ts`
- IPC channel constants mirrored in `src/types/ipcConstant.d.ts`
- Path aliases: `@` → `src/`, `@electron` → `electron/`

### Google Drive Backup

Backup handlers (`electron/ipc/backupHandlers.js`) integrate with Google Drive API using OAuth2 for database backup/restore functionality.
