# TrackIt

TrackIt helps students discover opportunities, save them, apply, and track application progress from one place.

## Project Structure

- `front-end/` - Next.js web application.
- `back-end/` - Express and MongoDB API.
- `docker-compose.yml` - Production-style local deployment for both services.

## Environment

Copy the example files and fill in real values:

```bash
cp .env.example .env
cp back-end/.env.example back-end/.env
cp front-end/.env.example front-end/.env
```

Required backend variables:

```bash
PORT=6487
DB_URI=mongodb://mongo:27017/trackit
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Required frontend variable:

```bash
NEXT_PUBLIC_API_URL=http://localhost:6487
```

## Local Development

Run the API:

```bash
cd back-end
npm install
npm run dev
```

Run the web app:

```bash
cd front-end
npm install
npm run dev
```

The frontend expects the backend at `NEXT_PUBLIC_API_URL`. The backend allows browser requests from `CLIENT_URL`.

## Docker

Build and start both services:

```bash
docker compose up --build
```

Then open:

- Web app: `http://localhost:3000`
- API health check: `http://localhost:6487/health`
