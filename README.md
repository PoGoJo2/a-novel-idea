# A Novel Idea

A full-stack book club platform. Readers pick a book, join its weekly online reading group
(choosing one of two meeting times), keep up with weekly reading goals and notes, and ask an
AI reading helper for book recommendations, review links, where to buy, and spoiler-safe study notes.

**Live site:** https://anovelidea-pi.vercel.app
**Live API:** https://a-novel-idea.vercel.app/api/health

Planning, user stories, design, database schema and the AI feature design are in the [`docs/`](docs) folder.

---

## Features

**Everyone**
- Browse the book catalog by title, author, genre and meeting day
- See which groups are open, coming soon, already started, or still finding a leader
- Ask the AI reading helper ("Ask AI" button, or the mascot on the home page)

**Members (signed in)**
- **My Meetings:** join a group at one of its two weekly times, switch times, or leave; see the next meeting with its video link
- **My Library:** heart favorites, save books for later, and ask to be told when a new group starts
- **Meet the Leaders:** read each leader's profile, history and favorite reads
- Weekly reading goals and catch-up notes for missed sessions; book one-on-one times with a leader
- Send feedback, reviews or complaints
- **My account:** see your details and change your password

**Leaders**
- **Leader tools:** see the classes you lead, volunteer for classes that need a leader, set weekly goals and notes, offer one-on-one times, and mark a class finished
- Edit your public leader profile
- Scheduling rules: a leader can never have two meetings that overlap, and at most 3 meetings a day

**Administrator**
- Club overview with numbers at a glance
- Create and edit groups and books, retire books
- **People:** change roles, remove or restore a disruptive member, and **reset a forgotten password** with a temporary one
- Approve or decline leader volunteer requests, and see scheduling problems for each leader
- Read and resolve complaints and reviews

**Passwords**
- Members change their own password from **My account** (they must type their current password)
- "Forgot your password?" on the log-in page sends a request to the administrator, who sets a temporary password; the member must choose their own the next time they log in
- Changing a password signs out every older login on other devices

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Presentation | React 18, Vite, React Router 6, Context API, plain CSS (light and dark themes) |
| Application | Node.js, Express REST API, JSON Web Tokens, express-validator, Helmet, bcrypt |
| Data | MongoDB Atlas, Mongoose |
| AI | Claude API (optional) with a built-in, no-cost fallback |
| Testing | Jest and Supertest |
| Hosting | Vercel (two projects from this repository: `server` and `client`) |

```
a-novel-idea/
├── client/        React app (pages, components, context, services, styles, public images)
├── server/        Express API (routes → controllers → services → Mongoose models)
│   ├── src/seed/  scripts that fill or fix the database
│   └── tests/     Jest + Supertest tests
└── docs/          planning, requirements and design documents
```

---

## Run it on your computer

You need Node.js 18 or newer and a MongoDB database (a free MongoDB Atlas cluster works).

**1. Backend**
```bash
cd server
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env   (then fill in your values)
npm run seed                # optional: sample books, groups and test accounts
npm run dev                 # http://localhost:5000/api/health
```

**2. Frontend** (in a second terminal, while the backend keeps running)
```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```
In development the frontend sends `/api` requests to the backend on port 5000 (see `client/vite.config.js`).

**3. Tests**
```bash
cd server
npm test
```

---

## Environment variables

Never commit a real `.env` file. The examples are in `server/.env.example` and `client/.env.example`.

**Server**

| Name | What it is |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign logins |
| `JWT_EXPIRES_IN` | How long a login lasts, for example `7d` |
| `CLIENT_URL` | The website's address, for CORS (`http://localhost:5173` locally) |
| `NODE_ENV` | `development` locally, `production` when deployed (hides error details) |
| `PORT` | Local port, default `5000` |
| `ANTHROPIC_API_KEY` | Optional. Turns on the Claude-powered answers |
| `AI_MODEL` | Optional. Which Claude model to use |

**Client**

| Name | What it is |
| --- | --- |
| `VITE_API_URL` | Only when deployed: the API address ending in `/api` |

---

## Deployment (Vercel, free plan)

Both parts are deployed from this repository as two Vercel projects. Every push to `main` redeploys both.

1. **Server project:** root directory `server`. Vercel runs the Express app (`src/app.js`) as a serverless function; the app connects to MongoDB on the first request. Add the server environment variables above, with `NODE_ENV=production` and `CLIENT_URL` set to the website's address.
2. **Client project:** root directory `client`, framework preset Vite, with `VITE_API_URL` set to the server's address plus `/api`. `client/vercel.json` sends every page address to `index.html` so refreshing any page works.
3. **MongoDB Atlas:** the network access list allows Vercel to connect.

---

## The AI feature: the reading helper

The reading helper is part of the main workflow: a reader describes what they like, gets books from the club's own catalog with open groups, and can view or join the book from the answer.

What it does:
1. **Find my book:** recommends books from the catalog by genre, mood, title or author, with the group's meeting times and seats left
2. **Review links** and **where to buy:** links to reviews, bookstores, libraries and ebooks
3. **Study notes and insights:** themes and discussion questions, limited to the reader's current week so there are no spoilers

How it works:
- The chat sends the question to `POST /api/ai/chat`. The server works out what is being asked, looks up real books and groups in MongoDB, and builds the answer.
- When `ANTHROPIC_API_KEY` is set, the server asks the Claude API to write the reply and only lets it talk about those books. The book cards (with **View** and **Join**) always come from the database, never from the AI. Without a key (as on the free live site), the built-in rules answer the same questions at no cost.
- Purchase and review links are built by the app from the title and author; the AI never supplies prices or web addresses.
- Study notes are saved, so the same request does not call the AI twice.
- No emails, names or passwords are sent to the AI. Requests are rate limited, and if the AI fails, the built-in answer is used and the rest of the site keeps working.

---

## Security

- Passwords are hashed with bcrypt and never returned by the API
- Role checks on the server (`member`, `leader`, `admin`) for every protected route
- Input validation on every route, Helmet headers, CORS limited to the website's address
- Changing or resetting a password ends older logins; a temporary password must be replaced at the next log-in
- The forgot-password page gives the same answer for every email, so it cannot be used to find out who has an account
- Error details are hidden in production

---

## Test accounts

`npm run seed` creates sample accounts for a **local** database (`admin@example.com`, `leader@example.com`, `member@example.com`, development password `password123`).

The live site does **not** use that password. Logins for grading are shared with the instructor separately.

---

## How AI was used to build this project

I used Claude (Anthropic) as a coding assistant throughout the build. I decided the features, rules and design, and Claude helped me plan the stages, write and explain the code, write tests, fix bugs, and walk through deployment step by step. I reviewed and ran every change, tested each feature in the browser, and asked for changes until it matched my wireframes. The illustrations (book covers, characters, page borders) were created with AI image tools from my own descriptions, and Claude helped prepare them for the site. More detail is in the project documentation in `docs/`.
