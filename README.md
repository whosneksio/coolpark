# CoolPark

A parking app for browsing spots, reserving them, and managing payments (school project).

See the use case diagram: [`docs/uml.drawio`](docs/uml.drawio).

## Tech stack

- **Next.js** / **React** / **TypeScript** - app framework and UI
- **Tailwind CSS** - styling
- **Prisma** (Postgres) - database ORM
- **Redis** - caching / sessions support
- **Zod** - schema validation
- **Bun** - package manager and test runner
- **Docker Compose** - local Postgres and Redis

## Features

### Guest
- View a parking map with reduced information

### Account
- Register and verify email
- Open a user page with the full parking map
- Add vehicles and payment methods
- Recharge balance or apply for a monthly subscription
- View transaction history

### Reservation flow
1. Select a parking spot (optionally from the map)
2. Choose a payment method and saved vehicle (add vehicle info if needed)
3. Pay for the spot
4. View the receipt and parking information
