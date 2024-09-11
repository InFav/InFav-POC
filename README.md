# Prerequisites

Make sure you have the following installed on your system:

- **Node.js**: You can download it from [Node.js official website](https://nodejs.org/). Choose the **LTS version** for stability.
- **npm** (Node Package Manager): This is automatically installed when you install Node.js.

# Frontend Setup (infav_ui folder)

### Step 1: Navigate to the Frontend Folder

Open your **Terminal** (macOS/Linux) or **Command Prompt** (Windows).

Navigate to the frontend folder (`infav_ui`) by typing the following command:

 ```bash
 cd infav_ui
 ```

  ### Step 2: Install Dependencies
  Once you are inside the infav_ui folder, install all necessary packages by running:

  ```bash
  npm install
  ```

This will install all the required packages needed for the frontend.

### Step 3: Run the Frontend
After the dependencies are installed, run the frontend by executing:

```bash
npm run dev
```
This will start a development server, and you can view the frontend in your web browser by visiting:
```
http://localhost:5173/
```

# Backend Setup

You don’t need to navigate to any specific folder for the backend. Simply follow these steps.

### Step 1: Install Backend Dependencies

In the **Terminal** or **Command Prompt**, while in the root of the project, run the following command to install backend dependencies:

   ```bash
npm install
```

This will install all the required packages for the backend.

### Step 2: Run the Backend Server
If you encounter the following error:

```bash
'ts-node' is not recognized as an internal or external command,
operable program or batch file.
```
You need to install ts-node globally by running:

```bash
npm install -g ts-node
```

Once ts-node is installed, you can start the backend server by running:
```
bash
ts-node server/server.ts
```

The backend server should now be running at:

```bash
http://localhost:8080
```

# Summary of Commands

- **Frontend**:
  - Navigate to `infav_ui`: `cd infav_ui`
  - Install frontend dependencies: `npm install`
  - Run frontend: `npm run dev`
  - Access frontend at: `http://localhost:5173/login`

- **Backend**:
  - Install backend dependencies: `npm install`
  - Install `ts-node` if needed: `npm install -g ts-node`
  - Run backend: `ts-node server/server.ts`
  - Access backend at: `http://localhost:8080`
