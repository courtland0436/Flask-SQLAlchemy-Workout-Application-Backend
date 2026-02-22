from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy

db = SQLAlchemy()

# ==========================================================
# JOIN TABLE: WorkoutExercise
# ==========================================================
class WorkoutExercise(db.Model):
    __tablename__ = 'workout_exercises'

    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    
    # Table Constraints: Ensuring reps/sets are integers
    reps = db.Column(db.Integer)
    sets = db.Column(db.Integer)
    duration_seconds = db.Column(db.Integer)

    # Relationships
    workout = db.relationship('Workout', back_populates='workout_exercises')
    exercise = db.relationship('Exercise', back_populates='workout_exercises')

    # Model Validations
    @validates('reps', 'sets', 'duration_seconds')
    def validate_positive_numbers(self, key, value):
        if value is not None and value < 0:
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be negative.")
        return value

    def __repr__(self):
        return f'<WorkoutExercise Workout:{self.workout_id} Exercise:{self.exercise_id}>'


# ==========================================================
# MODEL: Workout
# ==========================================================
class Workout(db.Model):
    __tablename__ = 'workouts'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False) # Table Constraint: Not Null
    duration_minutes = db.Column(db.Integer)
    notes = db.Column(db.Text)

    # Relationship: One-to-Many with the Join Table
    workout_exercises = db.relationship(
        'WorkoutExercise', 
        back_populates='workout', 
        cascade="all, delete-orphan" # Stretch goal: auto-delete join records
    )
    
    # Association Proxy: Reach through join table to get Exercise objects directly
    exercises = association_proxy('workout_exercises', 'exercise')

    # Model Validation
    @validates('duration_minutes')
    def validate_duration(self, key, value):
        if value is not None and value <= 0:
            raise ValueError("Workout duration must be greater than 0 minutes.")
        return value

    def __repr__(self):
        return f'<Workout ID: {self.id} Date: {self.date}>'


# ==========================================================
# MODEL: Exercise
# ==========================================================
class Exercise(db.Model):
    __tablename__ = 'exercises'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True) # Table Constraint: Unique & Not Null
    category = db.Column(db.String)
    equipment_needed = db.Column(db.Boolean, default=False)

    # Relationship: One-to-Many with the Join Table
    workout_exercises = db.relationship(
        'WorkoutExercise', 
        back_populates='exercise', 
        cascade="all, delete-orphan"
    )
    
    # Association Proxy: Reach through join table to get Workout objects directly
    workouts = association_proxy('workout_exercises', 'workout')

    # Model Validation
    @validates('category')
    def validate_category(self, key, value):
        valid_list = ['Chest', 'Back', 'Legs', 'Core', 'Arms']
        if value not in valid_list:
            raise ValueError(f"Category must be one of: {', '.join(valid_list)}")
        return value

    def __repr__(self):
        return f'<Exercise {self.name} ({self.category})>'