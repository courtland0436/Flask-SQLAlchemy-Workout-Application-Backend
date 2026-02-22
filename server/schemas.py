from marshmallow import Schema, fields, validate
from models import Workout, Exercise, WorkoutExercise

class ExerciseSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    category = fields.Str()
    equipment_needed = fields.Bool()
    
    class Meta:
        model = Exercise

class WorkoutExerciseSchema(Schema):
    id = fields.Int(dump_only=True)
    reps = fields.Int()
    sets = fields.Int()
    duration_seconds = fields.Int()
    workout_id = fields.Int()
    exercise_id = fields.Int()
    
    # This nests the Exercise details (name, category) so React can display them
    exercise = fields.Nested(ExerciseSchema, only=("name", "category"))

    class Meta:
        model = WorkoutExercise

class WorkoutSchema(Schema):
    id = fields.Int(dump_only=True)
    date = fields.Date(required=True)
    duration_minutes = fields.Int()
    notes = fields.Str()
    
    # CRITICAL: This allows the WorkoutCard to see the list of exercises
    # Ensure 'workout_exercises' matches the backref/relationship in models.py
    workout_exercises = fields.List(fields.Nested(WorkoutExerciseSchema))

    class Meta:
        model = Workout

# Initialize instances
workout_schema = WorkoutSchema()
workouts_schema = WorkoutSchema(many=True) # Used for the list of 4 cards
exercise_schema = ExerciseSchema()
exercises_schema = ExerciseSchema(many=True)