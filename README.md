# A Novel Idea

A full-stack book club platform. Readers pick a book, join its weekly online
group (choosing one of two meeting times), keep up with weekly notes, and use an
AI reading assistant for recommendations, reviews, where to buy, and study notes.

> Work in progress: this README is expanded at each build stage.

## Tech stack
- **Presentation layer:** React.js (coming in Stage 6)
- **Application layer:** Node.js + Express (REST API)
- **Data layer:** MongoDB + Mongoose

## Run the backend
```bash
cd server
cp .env.example .env        # then fill in your values
npm install
npm run dev                 # http://localhost:5000/api/health
```

## Environment variables (server/.env)
See `server/.env.example`. Never commit your real `.env` file.
