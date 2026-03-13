# 🔍 DevLens — GitHub Profile Viewer

> A sleek Next.js app to search and explore GitHub profiles in real-time — featuring live autocomplete suggestions, full repository browsing, and language statistics.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![GitHub API](https://img.shields.io/badge/GitHub-REST%20API-181717?style=for-the-badge&logo=github)

---

## ✨ Features

- **🔍 Live Autocomplete** — Type a username and see matching GitHub profiles appear instantly. Click to view any profile in one click.
- **📚 Full Repository List** — View every single public repository a user has, with progressive "Load More" loading (not the repo code)
- **💻 Language Statistics** — See the top programming languages used across all repositories.
- **🎨 Animated UI** — Smooth hover effects, fade-in animations, shimmer transitions, and a beautiful gradient theme.
- **📱 Fully Responsive** — Works seamlessly on desktop, tablet, and mobile.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sumaiya-SE/Devlens.git

# 2. Navigate into the project
cd devlens

# Make sure You have Node.js downloaded then,

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **React 18** | Component-based UI |
| **GitHub REST API** | Fetching user and repository data |
| **CSS3** | Animations, gradients, responsive layout |

---

## 📁 Project Structure

```
Devlens/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Main page & search logic
│   └── globals.css        # Global styles & animations
├── components/
│   ├── SearchBar.js       # Search input with autocomplete dropdown
│   ├── UserProfile.js     # Profile card (avatar, bio, stats)
│   ├── RepoCard.js        # Individual repository card
│   └── LanguageStats.js   # Language breakdown display
└── package.json

```

---

## 🔑 API Usage

This project uses the public [GitHub REST API](https://docs.github.com/en/rest) — **no API key required**.

| Endpoint | Used For |
|---|---|
| `/search/users?q={query}` | Live autocomplete suggestions |
| `/users/{username}` | Fetching user profile data |
| `/users/{username}/repos` | Fetching all repositories |

> **Rate Limit:** GitHub allows 60 requests/hour for unauthenticated users, which is plenty for personal use.

---

## 💡 What I Learned

- Setting up a **Next.js 14 project** with the App Router
- Using **React hooks** (`useState`, `useEffect`, `useRef`)
- Fetching data from a **public REST API**
- Building **reusable components** in React
- Implementing **debouncing** for search performance

---

## 👤 Author

- GitHub: [@Sumaiya](https://github.com/Sumaiya-SE)
- LinkedIn: [@Sumaiya-Shahudheen](https://www.linkedin.com/in/sumaiya-shahudheen/)

---

⭐ If you found this useful, consider giving it a star and connect me through LinkedIn!
