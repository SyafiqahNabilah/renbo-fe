# RenBoNow Frontend

RenBoNow is a role-based peer-to-peer rental platform frontend built with React and Vite. It is designed for a Spring Boot backend and supports three user roles:

- `Renter` to browse items and submit rental requests
- `Owner` to list items, review requests, and track earnings
- `Admin` to monitor users and transactions

The app targets a Malaysia-based rental marketplace flow, with examples such as cameras, tools, camping gear, music equipment, and event gear.

## What This Project Includes

- Public landing page for marketing and onboarding
- Authentication flow with signup, login, logout, and local session restore
- Role-based navigation and dashboards
- Item browsing and item detail flow for renters
- Item creation and update flow for owners
- Transaction/request management screens
- Admin overview screens for users and transactions
- Test data seeding script for local demos

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Lucide React icons
- Fetch API for backend communication

## Backend Dependency

This repository is the frontend only. It expects a backend API to be running, by default at:

```bash
http://localhost:8080
```

You can override that with:

```bash
VITE_API_URL=http://your-backend-url
```

The frontend currently talks to endpoints under:

- `/user`
- `/item`
- `/transaction`

Based on the current code, the backend is expected to provide:

- login and registration
- item CRUD
- transaction/request lifecycle actions
- user listing and deactivation
- multipart item image upload support

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint the code:

```bash
npm run lint
```

## Seeding Demo Data

The repository includes `seed.js` for populating a local backend with sample users, items, and rental requests.

Run it after the backend is available at `http://localhost:8080`:

```bash
node seed.js
```

What it seeds:

- 5 owner accounts
- 3 renter accounts
- sample inventory across multiple categories
- sample rental requests

Default seeded password:

```bash
Test1234!
```

## Project Structure

```text
src/
  api/          API wrappers for auth, items, users, and transactions
  components/   Layout and reusable UI components
  constants/    Navigation and status configuration
  context/      Authentication state and session persistence
  hooks/        Shared data-loading hooks
  pages/        Landing, auth, renter, owner, and admin screens
  utils/        API response normalization and transformation helpers
public/         Static assets
seed.js         Local demo data seeder
```

## Current Notes

- Session state is stored in `localStorage`
- The app normalizes backend enum values like `OWNER`, `RENTER`, and transaction statuses for UI display
- Some dashboard metrics are still placeholders and marked in code as items to replace with real backend-derived values
- The footer and seed script indicate the intended full stack is Spring Boot + React

## Repository Purpose

This repository is suitable as:

- the frontend for a rental marketplace coursework/project
- a demo app for role-based marketplace flows
- a base for continued development and GitHub portfolio presentation

## Suggested GitHub Description

If you want a short GitHub repository description, this would fit:

> React + Vite frontend for a peer-to-peer rental marketplace with renter, owner, and admin flows, built to integrate with a Spring Boot backend.
