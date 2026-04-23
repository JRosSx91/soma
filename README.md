# Soma

Physiological recovery visualization app for substance abstinence.

Soma tracks the biological recovery of the human body during abstinence from 
psychoactive substances, rendering the process as an interactive anatomical 
visualization backed by peer-reviewed medical data.

## Stack

- **Frontend:** React + Vite + TypeScript + TailwindCSS
- **Backend:** NestJS + Prisma + PostgreSQL
- **Shared:** TypeScript monorepo via pnpm workspaces

## Status

Early development. Not ready for use.

## Structure

- `apps/web` — Frontend SPA
- `apps/api` — Backend API
- `packages/shared-types` — Shared TypeScript types
- `docs/` — Medical references and physiological recovery data