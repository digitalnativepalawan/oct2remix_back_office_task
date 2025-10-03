# Back-Office Dashboard

A comprehensive back-office dashboard application built with React and TypeScript to manage labor, materials, tasks, and invoices. This project is structured for a professional development workflow and easy deployment with Firebase.

## Features

-   **📊 Interactive Dashboard:** Get a quick overview of your operations with charts for cost breakdowns (by status and type), monthly costs, and task statuses.
-   **🔧 Labor & Materials Management:** Track labor hours, rates, material quantities, and costs. Mark items as Paid or Unpaid.
-   **✅ Advanced Task Management:** Create and manage tasks with descriptions, notes, checklists, comments, and attachments (images/URLs).
-   **🧾 Invoice Generation:** Automatically generate invoices from unbilled labor and material items. View, print, or save invoices as PDFs.
-   **🔍 Powerful Filtering & Sorting:** Easily search for specific items and filter by status across all modules. Sort data by date.
-   **🔄 Data Import/Export:**
    -   Export data from Labor, Materials, and Tasks tabs to CSV.
    -   Download CSV templates for easy data preparation.
    -   Import data from CSV files to quickly populate your records.
-   **🔗 Quick Links:** Configurable header links for easy access to external tools and resources.
-   **📱 Responsive Design:** A clean, modern, and fully responsive UI that works on all devices.
-   **🔥 Firebase Ready:** Structured for easy deployment to Firebase Hosting.

## Tech Stack

-   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting)

## Project Structure

The project follows a standard structure to keep the code organized and maintainable:

-   `/src`: Contains all the application source code, including components, hooks, types, and utilities.
-   `/src/data/mockData.ts`: Contains mock data used for local development. This file is excluded from "production" builds.
-   `/index.html`: The main HTML entry point for the application.
-   `/firebase.json`: Configuration for Firebase Hosting.
-   `/README.md`: This file.

## Development vs. Production

The application is set up to use mock data for local development and expects a real backend API for production.

-   **Development:** When running the application on `localhost` or `127.0.0.1`, the `useMockData` hook will load sample data from `src/data/mockData.ts`. This allows for easy testing and UI development without needing a backend.
-   **Production:** When deployed to a live server, the `useMockData` hook provides empty arrays. The application is expected to be connected to a database or API to fetch and persist data. The current `localStorage` persistence is suitable for prototyping but should be replaced by a proper backend for a production environment.

## Getting Started in Firebase Studio

This project is optimized to run directly within the Firebase Studio environment.

1.  **Open in Studio:** Open this project in Firebase Studio. The environment will automatically handle the necessary setup.
2.  **Run the App:** The application will start, and you can interact with it in the preview pane. Because the preview is not on `localhost`, it will start with no data.
3.  **Connect to GitHub:** Use the "Save to GitHub" feature in Studio to create a repository for this project, enabling version control and collaboration.

## Deployment to Firebase Hosting

For a production deployment, it is highly recommended to use a build tool like [Vite](https://vitejs.dev/) or [Create React App](https://create-react-app.dev/) to transpile, bundle, and optimize the code.

### Recommended Production Setup

1.  **Initialize a new project with a build tool:**
    ```bash
    # Using Vite (recommended)
    npm create vite@latest my-backoffice-app -- --template react-ts
    ```
2.  **Integrate the Source Code:**
    Copy the contents of the `/src` directory from this project into the `src` directory of your new Vite project. Replace any boilerplate files. Also, copy the `index.html` content to the new `index.html` at the root.
3.  **Install Dependencies:**
    You may need to install additional packages if you extend the functionality.
4.  **Build the Project:**
    This command creates an optimized, static version of your app in a `dist` folder.
    ```bash
    npm install
    npm run build
    ```
5.  **Configure Firebase:**
    Update your `firebase.json` to point to the build output directory.
    ```json
    {
      "hosting": {
        "public": "dist", // Changed from "." to "dist"
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }
    ```
6.  **Deploy:**
    Run the deploy command from your project's root directory.
    ```bash
    firebase deploy --only hosting
    ```
