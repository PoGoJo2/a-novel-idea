# A Novel Idea

A full-stack book club platform. Readers pick a book, join its weekly online group
(choosing one of two meeting times), keep up with weekly notes, and use an AI reading
assistant for recommendations, reviews, where to buy, and study notes.

> Work in progress. This README grows with each build stage. Planning, requirements, and
> design documents are in the `docs/` folder.

## Tech stack
- **Presentation layer:** React (Vite), React Router, Context API
- **Application layer:** Node.js + Express (REST API)
- **Data layer:** MongoDB Atlas + Mongoose

## Run the backend
```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env, then fill in your values
npm install
npm run seed                # optional: fills the database with sample books and groups
npm run dev                 # http://localhost:5000/api/health
```

## Run the frontend
```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```
In development the frontend sends `/api` requests to the backend on port 5000
(see `client/vite.config.js`), so start the backend first.

## Environment variables
- Backend: see `server/.env.example`. Never commit your real `.env` file.
- Frontend: `client/.env.example` (`VITE_API_URL` is only needed when deployed).

## Sample logins (after `npm run seed`, development only)
`leader@example.com`, `member@example.com`, `admin@example.com`, password `password123`
