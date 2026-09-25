# 📝 Daily Tracker & Auth REST API

A light, high-performance RESTful API built with **Node.js (ES Modules)**, **Express.js**, and **Neon Serverless PostgreSQL**. Features secure password hashing with `bcrypt`, CRUD operations for user logs, centralized error handling, and zero-config deployment to **Vercel**.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (ES6+ ES Modules)
* **Framework:** Express.js
* **Database:** PostgreSQL (Hosted on [Neon](https://neon.tech))
* **Database Client:** `pg` (node-postgres with connection pooling)
* **Security:** `bcrypt` / `bcryptjs` password hashing
* **Deployment:** Vercel Serverless Functions

---

## 🚀 Features

* **User Authentication:** Secure registration and login flow with `bcrypt` salt hashing.
* **Log Management:** Full CRUD (Create, Read, Update, Delete) capability for user daily entries.
* **Centralized Async Handling:** Async wrapper to eliminate boilerplate `try...catch` blocks.
* **Production-Ready Security:** Environment variable isolation for database secrets using `dotenv`.
* **Serverless Prepared:** Modularized setup with `vercel.json` for rapid deployment.

---

## 📁 Project Structure

```text
.
├── middleware/
│   └── errorHandler.js    # Async wrapper & centralized error handler
├── public/                # Static assets & frontend UI
├── .env.example           # Example environment template
├── .gitignore             # Git exclusion rules
├── db.js                  # PostgreSQL Pool configuration
├── package.json           # Dependencies and scripts
├── server.js              # Express app routing and configuration
├── vercel.json            # Vercel deployment routing rules
└── README.md              # Project documentation