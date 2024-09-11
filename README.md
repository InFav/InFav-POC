# Prerequisites

Make sure you have the following installed on your system:

- **Node.js**: You can download it from [Node.js official website](https://nodejs.org/). Choose the **LTS version** for stability.
- **npm** (Node Package Manager): This is automatically installed when you install Node.js.
# Clone the Repository

To get the project on your local machine, follow these steps:

1. Open your **Terminal** (macOS/Linux) or **Command Prompt** (Windows).
2. Run the following command to clone the repository:

```bash
git clone https://github.com/InFav/InFav-POC.git
```

Once the repository is cloned, navigate into the project folder:

```bash
cd InFav-POC
```

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

# Create a Branch and Push Changes for Review

Once you've set up the frontend and backend, and made your changes to the code, follow these steps to create a new branch and push the changes to the remote repository for review.

### Step 1: Create a New Branch

Open your **Terminal** (macOS/Linux) or **Command Prompt** (Windows), and ensure you are inside the project folder:

```bash
cd InFav-POC
```
Create a new branch to work on. Replace your-branch-name with a name that describes your work:

```bash
git checkout -b your-branch-name
```
Stage and Commit Your Changes

After making your code changes, stage the files for commit:

```bash
git add .
```

Commit the staged changes with a descriptive message:

```bash
git commit -m "Your commit message"
```
Push the Branch to GitHub

Push your newly created branch to the remote repository:

```bash
git push origin your-branch-name
```
Create a Pull Request

Go to the repository on GitHub: https://github.com/InFav/InFav-POC.git.

After pushing your branch, you will see an option to create a Pull Request. Click on the "Compare & pull request" button.
Add a meaningful title and description to your pull request, and then submit it for review.

Your team will now be able to review the changes before merging them into the main branch.

# Summary of Commands

- **Clone Repository**:
  - Clone the repository: `git clone https://github.com/InFav/InFav-POC.git`
  - Navigate to the project folder: `cd InFav-POC`

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

- **Create and Push a Branch**:
  - Create a new branch: `git checkout -b your-branch-name`
  - Stage changes: `git add .`
  - Commit changes: `git commit -m "Your commit message"`
  - Push the branch: `git push origin your-branch-name`

- **Create a Pull Request**:
  - Go to the repository on GitHub and create a pull request for your branch.
