import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_cors import CORS 
from models import db, Exercise, Workout, WorkoutExercise
from schemas import workout_schema, workouts_schema, exercises_schema

app = Flask(__name__)
CORS(app) 

# Database Configuration
# Using absolute paths ensures the DB is found regardless of where the script is launched
base_dir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(base_dir, "instance", "app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app, db)
db.init_app(app)

# --- ROUTES ---

@app.route('/exercises', methods=['GET'])
def get_exercises():
    return exercises_schema.dump(Exercise.query.all()), 200


@app.route('/workouts', methods=['GET', 'POST'])
def handle_workouts():
    if request.method == 'GET':
        return workouts_schema.dump(Workout.query.all()), 200
    
    data = request.get_json()
    try:
        # 1. Create the Workout entry
        new_w = Workout(
            date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
            duration_minutes=int(data.get('duration_minutes')),
            notes=data.get('notes')
        )
        db.session.add(new_w)
        db.session.commit()

        # 2. Link exercises with dynamic sets and reps
        exercise_data = data.get('selectedExercises', [])
        
        for item in exercise_data:
            join_entry = WorkoutExercise(
                workout_id=new_w.id, 
                exercise_id=item.get('exercise_id'), 
                reps=item.get('reps', 10), 
                sets=item.get('sets', 3)   
            )
            db.session.add(join_entry)
        
        db.session.commit()
        return workout_schema.dump(new_w), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Server Error: {str(e)}")
        return jsonify({"errors": [str(e)]}), 400


@app.route('/workouts/<int:id>', methods=['DELETE'])
def delete_workout(id):
    workout = Workout.query.get(id)
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    
    db.session.delete(workout)
    db.session.commit()
    return {}, 204


@app.route('/reset', methods=['POST'])
def reset_db():
    """
    This route is a 'Turnkey' lifesaver. It wipes the DB and seeds it 
    with a single click from the frontend.
    """
    try:
        db.session.query(WorkoutExercise).delete()
        db.session.query(Workout).delete()
        db.session.query(Exercise).delete()
        db.session.commit()

        exercise_library = [
            ("Squats", "Legs"), ("Deadlifts", "Legs"), ("Lunges", "Legs"), 
            ("Standing Calf Raise", "Legs"), ("Leg Press", "Legs"), ("Leg Extension", "Legs"),
            ("Bench Press", "Chest"), ("Pushups", "Chest"), ("Chest Fly", "Chest"), ("Incline Press", "Chest"),
            ("Pullups", "Back"), ("Bent Over Rows", "Back"), ("Lat Pulldown", "Back"), ("Single Arm Row", "Back"),
            ("Plank", "Core"), ("Crunches", "Core"), ("Russian Twists", "Core"), ("Leg Raises", "Core"),
            ("Bicep Curls", "Arms"), ("Tricep Dips", "Arms"), ("Skull Crushers", "Arms"), ("Hammer Curls", "Arms")
        ]
        
        ex_objs = []
        for name, cat in exercise_library:
            ex = Exercise(name=name, category=cat)
            ex_objs.append(ex)
            db.session.add(ex)
        db.session.commit()

        # Add some initial sample data
        for i in range(0, 4):
            w = Workout(
                date=datetime.now().date(), 
                duration_minutes=30 + (i * 5), 
                notes=f"Initial Workout #{i+1}"
            )
            db.session.add(w)
            db.session.commit() 
            we = WorkoutExercise(workout_id=w.id, exercise_id=ex_objs[i].id, reps=10, sets=3)
            db.session.add(we)
        
        db.session.commit()
        return workouts_schema.dump(Workout.query.all()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # TURNKEY BOOTSTRAP:
    # This block runs every time the server starts.
    with app.app_context():
        # 1. Create instance folder if missing
        if not os.path.exists(os.path.join(base_dir, 'instance')):
            os.makedirs(os.path.join(base_dir, 'instance'))
        
        # 2. Create tables automatically if they don't exist
        db.create_all()
        print("✅ Database tables initialized.")

    app.run(port=5555, debug=True)