# A Novel Idea: Planning and Requirements

**Project:** A Novel Idea, an online book club platform
**Stack:** React (presentation) · Node.js + Express (application) · MongoDB + Mongoose (data)
**Document status:** Stage 2 of the build plan. Updated as the project evolves.

---

## 1. Planning

### 1.1 Project idea
A Novel Idea is a full-stack web application for online book clubs organized around the book each member is reading. Every book has a reading group that meets weekly over video (Microsoft Teams or similar). Each book offers **two meeting-time options**, and a member joins by choosing one. Members who cannot attend a session can read the **weekly notes** from that meeting, and may book a limited number of **one-on-one sessions** with the book leader. An **AI reading assistant** helps members find a book, see review and purchase links, and get study notes and discussion questions that do not spoil chapters the group has not reached.

### 1.2 Problem statement
Readers who want to discuss books with others face several problems:

- **Local clubs limit who can join.** Readers in small towns or with niche tastes often cannot find an in-person group for the book they want.
- **Scheduling is hard.** Finding a time that works for a whole group, especially across time zones, often means endless messaging or a club that never meets.
- **Clubs are not matched to what people are reading.** Readers must find a group separately from choosing a book.
- **Missed meetings cause dropouts.** A member who misses one session falls behind and often quits.
- **Book information is scattered.** Reviews, purchase options, summaries, and discussion material live on different sites, and some contain spoilers.

There is no single place where readers anywhere in the country can pick a book, join its group at a convenient time, catch up after a missed meeting, and get reliable reading help.

### 1.3 Target users

| User | Description | Main needs |
|---|---|---|
| **Member (reader)** | Someone anywhere in the country who wants to read a book with others | Browse books, join a group at one of two times, see times in their own time zone, get the video link, RSVP, read weekly notes, book a one-on-one, use the AI assistant |
| **Book leader** | Runs a book's group and its online sessions | Create the group and its two time options, set meeting links, publish weekly notes and one-on-one slots, see attendance |
| **Admin** | Maintains the platform | Manage books, groups, users, and advertising for new artists, libraries, and book businesses |

**Primary audience:** adult hobby readers, students, and community or library book clubs, especially people with busy or irregular schedules or who live far from an in-person club.

### 1.4 Scope

**In scope: core (Must have).** These map directly to the capstone requirements.
- Registration, login, logout, protected routes, and role-based access
- Browsing books and reading groups with filters and search
- Book and group details: description, category (genre), session duration, two meeting times, leader, seats left
- Booking management: join a group by choosing a time, switch time, leave, view my bookings
- Dashboard with my groups and upcoming meetings
- AI reading assistant that recommends books and groups from the real database
- Validation, error handling, responsive design, testing, public deployment

**In scope: planned extras (Should have).** Built after the core works.
- RSVP to weekly meetings and weekly meeting notes for members who missed a session
- Leader tools: create groups and time options, publish notes
- One-on-one sessions with the leader (limited allowance per member)
- AI study notes and discussion questions limited to the group's current week; review and purchase links
- Time zone display, light and dark themes

**Could have (only if time allows).** Admin management screens, advertising placements, waitlist, calendar export.

**Out of scope.**
- A built-in video system (the app stores and shows links to Teams, Zoom, or Meet)
- Automatically creating video meetings through external APIs
- Online payments or selling books
- Native mobile apps (the website is responsive instead)
- Real-time chat between members
- Reproducing copyrighted book text or commercial study guides (AI notes are original summaries and analysis)
- Live bookstore prices or stock (purchase links point to search pages and library catalogs)

**Assumptions and constraints**
- Built by one developer on the required stack: React, Node.js, Express, MongoDB
- Members and leaders have access to a video platform
- The AI API key stays on the server and AI output is cached to control cost
- AI output is labeled as AI-generated and may contain errors

---

## 2. User stories

Priority: **M** = Must, **S** = Should, **C** = Could.

| ID | As a… | I want to… | So that… | Acceptance criteria | Pri |
|---|---|---|---|---|---|
| US-01 | Visitor | register with my name, email, and password | I can use the app | Password at least 8 characters; duplicate email is rejected with a clear message; success signs me in | M |
| US-02 | Member | log in and log out | my account stays private | Wrong credentials show one generic error; logout ends the session; protected pages redirect to login | M |
| US-03 | Visitor | browse books and groups and filter by genre, meeting day, and search | I can find a book I want | Each result shows title, author, genre, both time options, and seats left; empty results show a helpful message | M |
| US-04 | Visitor | open a book's detail page | I understand what I am joining | Page shows description, genre, session duration, both times in my time zone, leader, and seats per time | M |
| US-05 | Member | join a group by choosing one of its two meeting times | I can attend at a time that suits me | Seats drop by one; a full time cannot be chosen; I cannot join the same group twice; I see a confirmation | M |
| US-06 | Member | switch to the group's other meeting time | my schedule can change | Only allowed if the other time has space; seat counts update for both times | M |
| US-07 | Member | leave a group | I can free my seat | A confirmation is shown first; my seat is released | M |
| US-08 | Member | see a dashboard of my groups and upcoming meetings | I know what is next | Shows next meeting with video link, upcoming list, and my groups | M |
| US-09 | Member | ask an AI assistant to help me find a book or group | I can choose faster | Recommendations come from real books in the database; each has a button to open it; errors show a friendly message | M |
| US-10 | Any user | be blocked from pages and actions I am not allowed to use | the system stays secure | No token gives 401; wrong role gives 403; the UI hides actions I cannot use | M |
| US-11 | Member | say whether I am attending a meeting | the leader knows who is coming | RSVP can be changed until the meeting starts | S |
| US-12 | Member | read weekly notes from each meeting | I can catch up if I missed a session | Notes list by week; weeks without notes show "after meeting" | S |
| US-13 | Leader | create a group with two time options, links, and capacity | members can join | Exactly two time options; each has a capacity and video link; the two times cannot be identical | S |
| US-14 | Leader | publish notes after each meeting | absent members can catch up | Only the group's leader can post; notes are tied to a specific meeting | S |
| US-15 | Member | get AI study notes and discussion questions up to my group's current week | I do not get spoilers | Content never goes past the group's current week; labeled AI-generated | S |
| US-16 | Member | see review links and where to buy or borrow the book | I can get a copy | Links are built by the app (not invented by AI); include bookstore search, library catalog, and ebook options | S |
| US-17 | Member | see meeting times in my own time zone | I do not miscalculate | Times stored in UTC and shown in my profile time zone | S |
| US-18 | Member | choose a light or dark theme | the site is comfortable to read | Choice is saved to my profile and applied on every page | S |
| US-19 | Leader | publish one-on-one time slots | members who miss the group can still connect | Slots cannot overlap or be in the past | S |
| US-20 | Member | book a one-on-one with my leader | I stay engaged | Limited to the group's allowance; a slot can be booked by only one member; cancelling at least 24 hours ahead returns the allowance | S |
| US-21 | Admin | manage books and users | the catalog stays accurate | Admin can create, edit, and delete books; cannot delete a book with active groups | C |
| US-22 | Admin | place advertising from artists, libraries, and book businesses | the platform can support partners | Ads display in a labeled sponsored slot | C |
| US-23 | Member | join a waitlist for a full time | I get a seat if one opens | Waitlist order is first come, first served | C |
| US-24 | Member | export a meeting to my calendar | I do not forget | Downloads an .ics file with the video link and time | C |

---

## 3. Functional requirements

| ID | Requirement | Pri | Stories |
|---|---|---|---|
| **Authentication and users** | | | |
| FR-01 | The system shall let a visitor register with name, email, and password; passwords are hashed and never returned by the API | M | US-01 |
| FR-02 | The system shall authenticate users and issue a signed token (JWT) with an expiry | M | US-02 |
| FR-03 | The system shall support logout; the client discards the token | M | US-02 |
| FR-04 | The system shall protect private endpoints and restrict leader and admin actions by role | M | US-10 |
| FR-05 | The system shall let a user set a time zone and a theme preference on their profile | S | US-17, US-18 |
| **Browsing** | | | |
| FR-06 | The system shall list books and reading groups with filtering by genre and meeting day, text search, and pagination | M | US-03 |
| FR-07 | The system shall show book and group details including description, genre, session duration, two time options, leader, and seats left per time | M | US-04 |
| FR-08 | Leaders and admins shall be able to create, update, and delete books and groups; each group shall have exactly two time options with a capacity and video link each | S | US-13, US-21 |
| **Booking management** | | | |
| FR-09 | A member shall be able to join a group by choosing one of its time options | M | US-05 |
| FR-10 | The system shall enforce capacity per time option and allow only one active membership per user per group | M | US-05 |
| FR-11 | A member shall be able to switch to the other time option when space is available | M | US-06 |
| FR-12 | A member shall be able to leave a group, releasing the seat | M | US-07 |
| FR-13 | A member shall be able to view all of their bookings | M | US-08 |
| **Meetings, RSVP, and notes** | | | |
| FR-14 | The system shall generate weekly meetings for each time option, stored in UTC | S | US-17 |
| FR-15 | The system shall show a member's upcoming meetings with video links | M | US-08 |
| FR-16 | A member shall be able to RSVP attending or cannot attend for a meeting | S | US-11 |
| FR-17 | A group's leader shall be able to publish, edit, and delete notes for a meeting | S | US-14 |
| FR-18 | Members of a group shall be able to read that group's weekly notes | S | US-12 |
| **One-on-ones** | | | |
| FR-19 | A leader shall be able to publish one-on-one slots with no overlaps and none in the past | S | US-19 |
| FR-20 | A member shall be able to book a slot within the group's allowance; a slot allows only one active booking | S | US-20 |
| FR-21 | Cancelling at least 24 hours before the slot shall return the allowance | S | US-20 |
| **AI assistant** | | | |
| FR-22 | The system shall provide an AI assistant that answers questions using real books and groups from the database | M | US-09 |
| FR-23 | AI recommendations shall include links to the matching book or group pages so the member can join | M | US-09 |
| FR-24 | AI study notes and discussion questions shall be limited to the group's current week | S | US-15 |
| FR-25 | Review, bookstore, library, and ebook links shall be built by application code, not generated by AI | S | US-16 |
| FR-26 | The system shall cache AI output per book, type, and week to limit cost | S | US-15 |
| FR-27 | If the AI service fails, the app shall show a friendly message and continue to work | M | US-09 |
| **Interface** | | | |
| FR-28 | The interface shall offer light and dark themes | S | US-18 |
| FR-29 | The interface shall be responsive from phone to desktop | M | all |
| FR-30 | Meeting times shall be displayed in the user's time zone | S | US-17 |
| **Quality** | | | |
| FR-31 | The server shall validate all input and return consistent JSON errors | M | all |
| FR-32 | Forms shall show clear validation messages and loading and error states | M | all |
| FR-33 | Admins shall be able to manage advertising placements | C | US-22 |

---

## 4. Non-functional requirements

| ID | Category | Requirement | How it will be verified |
|---|---|---|---|
| NFR-01 | Security | Passwords hashed with bcrypt; JWT secret and database credentials only in environment variables; secrets never committed | Code review; `.gitignore` check; no secrets in repository history |
| NFR-02 | Security | Role checks enforced on the server; users cannot set their own role; HTTP security headers and restricted CORS | Tests for 401 and 403 responses |
| NFR-03 | Security | All input validated on the server; error responses never leak stack traces in production | Validation tests; production error check |
| NFR-04 | Performance | Main pages load in under 3 seconds on a normal connection; API responses (excluding AI) in under 500 ms for typical data | Manual timing; browser dev tools |
| NFR-05 | Usability | Clean, consistent navigation; clear empty, loading, and error states | Manual walkthrough of every flow |
| NFR-06 | Accessibility | Sufficient color contrast; all controls usable by keyboard; form fields have labels; touch targets at least 44 px | Contrast check; keyboard test |
| NFR-07 | Responsiveness | Usable from 360 px phones to wide desktops | Test in browser device mode |
| NFR-08 | Reliability | Central error handling; AI failures degrade gracefully and never break booking | Failure tests with the AI key removed |
| NFR-09 | Data integrity | A time option can never exceed its capacity; a user cannot hold two active memberships in one group | Concurrency and duplicate tests |
| NFR-10 | Time correctness | Times stored in UTC and displayed in the user's time zone, including daylight saving changes | Test with two time zones |
| NFR-11 | Maintainability | Frontend and backend separated; routes, controllers, services, and models in separate files; meaningful names | Code review; folder structure |
| NFR-12 | Privacy | Only the minimum necessary data is sent to the AI service (no emails or passwords) | Review AI request payloads |
| NFR-13 | AI safety | AI output is labeled, avoids spoilers beyond the group's week, and does not invent prices or links | Manual checks of AI responses |
| NFR-14 | Portability | The app is configured only by environment variables and deploys from the repository | Deployment test on Render, Netlify or Vercel, and Atlas |
| NFR-15 | Version control | Meaningful commit messages and at least 15 commits | Git history |
