# Team Workflow

Team Workflow is a small full-stack web application that demonstrates how requests can be
created, assigned, discussed, and audited inside a team.

The project focuses on **clarity of workflow**, **traceability**, and **realistic business logic**,
not on visual polish or authentication complexity.

---

## Overview

**Team Workflow** simulates a simple internal tool where:

- a request is created with details
- a request is assigned to a team member
- the status of a request changes over time
- team members can leave comments
- every important action is recorded in an **audit log** with before/after tracking

This mirrors how real internal tools work in companies.

---

## Key features

- Create requests with title, description, priority, and assignee
- Change request status (OPEN, IN_REVIEW, APPROVED, REJECTED)
- Assign requests to demo users (Alice, Bob, Demo User)
- Request detail page with comments
- Audit Log with readable change history (e.g. `OPEN → REJECTED`)
- Clear empty states and populated states
- Clean separation between frontend, backend, and database

---

## App states: empty vs populated

### Empty state (fresh database)

- No requests are shown on the Requests page
- UI displays a message like **“No requests yet. Create one above.”**
- Audit Log shows **“No audit entries yet.”**

This demonstrates how the app behaves for a new workspace.

### Populated state (after creating requests)

- Requests appear as cards showing:
  - title
  - description
  - status
  - priority
  - assignee
- Clicking a request opens the **Request Detail page**
- Comments can be added to discuss the request
- All actions appear in the **Audit Log** with before/after tracking

Demo data can be loaded using:
- [`api/sql/002_seed.sql`](api/sql/002_seed.sql)

---

## How to use the app

1. Open the **Requests** page
2. Create a new request using the form
3. Assign the request to a demo user
4. Change the request status
5. Click a request to open the **Request Detail page**
6. Add comments to the request
7. Open the **Audit Log** to see all actions and changes

---

## Screenshots

> 📌 **Note:** Screenshots illustrate the app in a populated state.

### Home Page
<img width="1919" height="996" alt="image" src="https://github.com/user-attachments/assets/dc866228-37b9-42f4-a5c7-0cb51ae00a8e" />


### Audit Log
<img width="1904" height="998" alt="image" src="https://github.com/user-attachments/assets/13312151-a748-45fa-9d6f-8072ccc89407" />


### Request
### Admin point of view
<img width="1903" height="994" alt="image" src="https://github.com/user-attachments/assets/6b4e0434-a7a5-4793-9370-44c3ab255ad4" />
### ALice point of view
<img width="1919" height="996" alt="image" src="https://github.com/user-attachments/assets/531ffaaf-706e-40ec-a97b-103070d7ff7d" />



---

## Local development

### Prerequisites

- Node.js (16+)
- PostgreSQL **or** Docker
- `psql` CLI (if not using Docker)

---

### Install dependencies

```bash
# backend
cd api
npm install

# frontend
cd ../web
npm install
