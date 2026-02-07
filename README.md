# Graduation Project Frontend (Admin & User Portal)

This is the frontend client for the Graduation Project (Đồ Án), a web application for managing tourism data, creating travel routes, and administrative approvals.

## Overview

The frontend provides a modern, responsive interface for:
- **Browsing Tourism Points:** Interactive maps and detailed information.
- **Route Planning:** Create and customize travel routes with drag-and-drop support.
- **Service Providers:** View and manage local service listings.
- **User Dashboard:** Track requests and account settings.
- **Admin Portal:** Manage content, approve user requests, and oversee the system.

Built with **React 19**, **Vite**, and **Tailwind CSS**.

## Tech Stack

- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS + PostCSS
- **Routing:** React Router DOM (v7)
- **Maps:** Leaflet & React Leaflet (OpenStreetMap integration)
- **State/Auth:** Context API (AuthContext)
- **HTTP Client:** Axios
- **Drag & Drop:** @dnd-kit (for route ordering)
- **Icons:** Lucide React
- **Dates:** Day.js

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- The [Backend API](../backend) running locally or remotely.

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

You can use `npm`, `yarn`, or `pnpm`. We recommend `npm` for consistency with the backend.

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the frontend root:

```bash
touch .env
```

Add the following configuration (adjust if your backend runs elsewhere):

```env
VITE_API_URL=http://localhost:5001
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
├── src/
│   ├── assets/       # Static images and icons
│   ├── components/   # Reusable UI components (Navbar, Cards, Maps)
│   ├── contexts/     # Global state (Auth, Theme)
│   ├── layouts/      # Page layouts (MainLayout, AdminLayout)
│   ├── pages/        # Route components (Home, Dashboard, Login)
│   ├── services/     # API service functions (Axios wrappers)
│   ├── App.jsx       # Main App component & Routes
│   └── main.jsx      # Entry point
├── public/           # Static public assets
├── .env              # Environment variables
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies and scripts
```

## Key Features

- **Interactive Maps:** View tourism points and routes on an interactive map using Leaflet.
- **Role-Based Access:**
    - **Guest:** View public points and routes.
    - **User:** detailed views, submit edit requests.
    - **Lecturer/Approver:** Review and approve/reject requests.
    - **Admin:** Full system control.
- **Drag & Drop Routes:** Easily reorder stops in a travel route.
- **Responsive Design:** Optimized for desktop and mobile.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with HMR. |
| `npm run build` | Build the app for production to the `dist` folder. |
| `npm run lint` | Run ESLint to check for code quality issues. |
| `npm run preview` | Locally preview the production build. |

## Deployment

To deploy the frontend to a static host (Vercel, Netlify, etc.):

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder.**

**Note for SPA Routing:** Ensure your host is configured to rewrite all 404s to `index.html` so that React Router handles the paths.

## Troubleshooting

- **Map not loading:** Ensure you have internet access (Leaflet tiles are fetched from OpenStreetMap).
- **API Errors:** Check that the `VITE_API_URL` is correct and the backend server is running. CORS errors usually mean the backend isn't configured to accept requests from your frontend port.
