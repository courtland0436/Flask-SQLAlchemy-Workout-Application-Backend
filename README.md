# Flask-SQLAlchemy-Workout-Application-Backend - Workout Tracker Application

This is a full-stack web application for logging workouts and managing an exercise library. This project utilizes a React frontend and a Flask/SQLAlchemy backend.

---

## Quick Start (Turnkey Setup)
To get this project running locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/courtland0436/Flask-SQLAlchemy-Workout-Application-Backend.git
   ```

2. **Enter the project directory:**
```
cd Flask-SQLAlchemy-Workout-Application-Backend
```

3. **Run the Setup Script:**
This script installs backend and frontend dependencies and seeds the database.
```
sh setup.sh
```

4. **Launch the Application:**
Open two separate terminal windows:

Terminal 1 (Backend):
    ```bash
    cd server && python app.py
    ```

Terminal 2 (Frontend):
    ```bash
    cd client && npm start
    ```


## Features
Workout Tracking: Log workouts with date, duration, and notes.

Many-to-Many Architecture: Associates multiple exercises with a single workout, including unique sets and reps for each association via a join table.

Exercise Library: A comprehensive list of exercises filtered by muscle group and equipment requirements.

Database Management: Built-in API route and frontend integration to reset and re-seed the database to a default state.


## Project Structure
/client: React.js frontend application.

/server: Flask API and SQLAlchemy models.

setup.sh: Root-level shell script for automated installation.

requirements.txt: Python dependency list.


## API Documentation
Method	Endpoint	Functionality
GET	    /exercises	    Retrieve all exercises
GET	    /workouts	    Retrieve all workout logs
POST	/workouts	    Create a new workout and its exercise associations
DELETE  /workouts/<id>  Remove a workout and related join table records
POST    /reset          Clear all data and re-seed with default values


## Tech Stack
Frontend: React, JavaScript, CSS3

Backend: Python, Flask, Flask-SQLAlchemy, Flask-Marshmallow, Flask-CORS

Database: SQLite3


