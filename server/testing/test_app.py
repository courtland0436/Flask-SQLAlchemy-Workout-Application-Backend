import sys
import os
import pytest
from datetime import date # Added this import

# Add the parent directory (server) to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from models import db, Workout, Exercise, WorkoutExercise

@pytest.fixture
def client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
        with app.app_context():
            db.drop_all()

# --- THE UPDATED TESTS ---

def test_workout_creation_with_notes(client):
    """Test that a workout saves its notes to the database."""
    with app.app_context():
        # Changed date=None to date.today()
        w = Workout(date=date.today(), duration_minutes=30, notes="Recovery day")
        db.session.add(w)
        db.session.commit()
        
        saved_w = Workout.query.first()
        assert saved_w.notes == "Recovery day"

def test_workout_exercise_volume(client):
    """Test that reps and sets are saved correctly in the join table."""
    with app.app_context():
        # Changed date=None to date.today()
        w = Workout(date=date.today(), duration_minutes=45)
        ex = Exercise(name="Bench Press", category="Chest")
        db.session.add_all([w, ex])
        db.session.commit()
        
        we = WorkoutExercise(workout_id=w.id, exercise_id=ex.id, reps=12, sets=3)
        db.session.add(we)
        db.session.commit()
        
        saved_we = WorkoutExercise.query.first()
        assert saved_we.reps == 12
        assert saved_we.sets == 3

def test_invalid_category_raises_error(client):
    """Test that the model @validates prevents invalid categories."""
    with app.app_context():
        with pytest.raises(ValueError):
            ex = Exercise(name="Dance", category="Zumba")
            db.session.add(ex)
            db.session.commit()