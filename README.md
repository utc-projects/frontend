# GTVT Hoc Tap - Frontend

This is the frontend application for the GTVT Hoc Tap project, built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/). It provides an interactive map interface and an administration dashboard for managing tourism data.

## Features

- **Interactive Map**: View tourism points, providers, and routes using [Leaflet](https://leafletjs.com/).
- **Admin Dashboard**: Manage users, classes, courses, and approve requests.
- **Request Approval System**: Workflow for students/contributors to submit changes for approval.
- **Role-based Access Control**: Different views for students, lecturers, and admins.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variable:
     ```env
     VITE_API_URL=http://localhost:5001
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint.

## Project Structure

- `src/components`: Reusable UI components (Map layer, Sidebar, etc.).
- `src/pages`: Page components (Admin pages, Dashboard, MapPage).
- `src/contexts`: Context providers (AuthContext).
- `src/services`: API service modules.
- `src/assets`: Static assets.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

[MIT](LICENSE)
