#!/usr/bin/env python3
import os
from app import app, db
from models import Workout, Exercise, WorkoutExercise
from datetime import date

# Ensure the instance folder exists before seeding
base_dir = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.join(base_dir, 'instance')

with app.app_context():
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
    
    # Create the tables if they don't exist yet
    db.create_all()

    print("Emptying database...")
    WorkoutExercise.query.delete()
    Workout.query.delete()
    Exercise.query.delete()

    print("Seeding exercises...")
    ex = {
        "bench": Exercise(name="Bench Press", category="Chest", equipment_needed=True),
        "pushups": Exercise(name="Push-ups", category="Chest", equipment_needed=False),
        "dips": Exercise(name="Dips", category="Arms", equipment_needed=True),
        "incline": Exercise(name="Incline Bench Press", category="Chest", equipment_needed=True),
        "squats": Exercise(name="Squats", category="Legs", equipment_needed=True),
        "deadlifts": Exercise(name="Deadlifts", category="Back", equipment_needed=True),
        "pullups": Exercise(name="Pull-ups", category="Back", equipment_needed=True),
        "rows": Exercise(name="Rows", category="Back", equipment_needed=True),
        "lunges": Exercise(name="Lunges", category="Legs", equipment_needed=False),
        "calves": Exercise(name="Standing Calf Raise", category="Legs", equipment_needed=True),
        "plank": Exercise(name="Planks", category="Core", equipment_needed=False),
        "crunches": Exercise(name="Crunches", category="Core", equipment_needed=False),
        "mountain": Exercise(name="Mountain Climbers", category="Core", equipment_needed=False)
    }
    db.session.add_all(ex.values())
    db.session.commit()

    print("Seeding workouts...")
    w_chest = Workout(date=date.today(), duration_minutes=60, notes="Heavy chest day")
    w_back = Workout(date=date.today(), duration_minutes=45, notes="Focus on pull movements")
    w_legs = Workout(date=date.today(), duration_minutes=75, notes="Leg day is the best day")
    w_core = Workout(date=date.today(), duration_minutes=30, notes="Quick core circuit")
    w_arms = Workout(date=date.today(), duration_minutes=45, notes="Biceps and triceps")
    
    db.session.add_all([w_chest, w_back, w_legs, w_core, w_arms])
    db.session.commit()

    print("Creating links (WorkoutExercises)...")
    links = [
        WorkoutExercise(workout=w_chest, exercise=ex["bench"], reps=10, sets=3),
        WorkoutExercise(workout=w_chest, exercise=ex["pushups"], reps=20, sets=3),
        WorkoutExercise(workout=w_back, exercise=ex["deadlifts"], reps=5, sets=5),
        WorkoutExercise(workout=w_back, exercise=ex["pullups"], reps=10, sets=3),
        WorkoutExercise(workout=w_legs, exercise=ex["squats"], reps=12, sets=4),
        WorkoutExercise(workout=w_core, exercise=ex["squats"], reps=15, sets=3),
    ]
    
    db.session.add_all(links)
    db.session.commit()

    print("Seeding complete! Your database is now populated.")