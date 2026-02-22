import React, { useState, useEffect } from "react";
import WorkoutForm from "./WorkoutForm";

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5555/workouts")
      .then((r) => r.json())
      .then((data) => setWorkouts(Array.isArray(data) ? data : []))
      .catch(() => console.log("Waiting for server..."));
  }, []);

  const handleRestore = () => {
    fetch("http://localhost:5555/reset", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setWorkouts(data);
        window.location.reload();
      });
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5555/workouts/${id}`, { method: "DELETE" })
      .then((r) => {
        if (r.ok) {
          setWorkouts(workouts.filter((w) => w.id !== id));
        }
      });
  };

  // SORTING LOGIC: Newest date first
  const finalSorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

  // FILTERING LOGIC
  const displayedWorkouts = finalSorted.filter((w) => {
    const searchLow = searchTerm.toLowerCase();
    const durationMatch = w.duration_minutes?.toString().includes(searchLow);
    const notesMatch = w.notes?.toLowerCase().includes(searchLow);
    const exerciseMatch = w.workout_exercises?.some(we => 
      we.exercise.name.toLowerCase().includes(searchLow)
    );
    const categoryMatch = w.workout_exercises?.some(we => 
      we.exercise.category.toLowerCase().includes(searchLow)
    );

    return notesMatch || durationMatch || exerciseMatch || categoryMatch;
  });

  const getBadgeStyle = (category) => {
    const colors = {
      Chest: "#e84118", Back: "#4b7bec", Legs: "#20bf6b", Core: "#f7b731", Arms: "#a55eea"
    };
    return {
      backgroundColor: colors[category] || "#718093",
      color: "white", padding: "4px 10px", borderRadius: "15px",
      fontSize: "11px", fontWeight: "bold", textTransform: "uppercase"
    };
  };

  return (
    <div style={{ 
      backgroundColor: "#f0f2f5", 
      minHeight: "100vh", 
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center" 
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ width: "100%", maxWidth: "450px", textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#2f3640", fontSize: "3rem", marginBottom: "20px" }}>Fitness Tracker</h1>
        
        <button 
          onClick={handleRestore} 
          style={{ 
            width: "100%", padding: "12px", backgroundColor: "#28a745", 
            color: "white", border: "none", borderRadius: "5px", 
            cursor: "pointer", fontWeight: "bold", fontSize: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          Reset App Data
        </button>
      </div>

      {/* FORM SECTION */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "40px" }}>
        <WorkoutForm onAddWorkout={(newW) => setWorkouts([...workouts, newW])} />
      </div>

      <hr style={{ width: "100%", maxWidth: "800px", margin: "20px 0 40px 0", border: "0", borderTop: "2px solid #ddd" }} />

      {/* SEARCH SECTION */}
      <div style={{ width: "100%", maxWidth: "450px", marginBottom: "40px" }}>
        <input 
          type="text"
          placeholder="Search by area, exercise, or duration..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: "12px 20px", width: "100%", boxSizing: "border-box",
            borderRadius: "25px", border: "1px solid #ccc", fontSize: "16px", 
            outline: "none", boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}
        />
      </div>

      {/* GRID SECTION */}
      <div style={{ 
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "25px", width: "100%", maxWidth: "1200px"
      }}>
        {displayedWorkouts.map((w) => {
          const focusArea = w.workout_exercises?.[0]?.exercise?.category || "Misc";

          return (
            <div key={w.id} style={{ 
              backgroundColor: "white", padding: "20px", borderRadius: "12px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#2f3640" }}>{w.date}</h3>
                <span style={getBadgeStyle(focusArea)}>{focusArea}</span>
              </div>
              
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <p style={{ margin: "5px 0" }}><strong>⏱ Duration:</strong> {w.duration_minutes} mins</p>
                {w.notes && <p style={{ fontStyle: "italic", color: "#636e72", margin: "5px 0" }}>"{w.notes}"</p>}
              </div>
              
              {/* UPDATED EXERCISE LIST WITH SETS/REPS/VOLUME */}
              <div style={{ flexGrow: 1, textAlign: "left" }}>
                <strong style={{ fontSize: "14px", color: "#2f3640" }}>Exercises:</strong>
                <ul style={{ paddingLeft: "0", marginTop: "8px", listStyleType: "none" }}>
                  {w.workout_exercises?.map(we => (
                    <li key={we.id} style={{ fontSize: "14px", marginBottom: "10px", borderLeft: `3px solid ${getBadgeStyle(focusArea).backgroundColor}`, paddingLeft: "10px" }}>
                      <div style={{ fontWeight: "600", color: "#2f3640" }}>{we.exercise.name}</div>
                      <div style={{ fontSize: "13px", color: "#747d8c" }}>
                        {we.sets} sets × {we.reps} reps 
                        <span style={{ marginLeft: "8px", color: "#2ecc71", fontWeight: "bold" }}>
                          ({we.sets * we.reps} total)
                        </span>
                      </div>
                    </li>
                  )) || <li>No exercises logged</li>}
                </ul>
              </div>
              
              <button 
                onClick={() => handleDelete(w.id)}
                style={{ 
                  marginTop: "20px", padding: "10px", backgroundColor: "#ff7675", 
                  color: "white", border: "none", borderRadius: "6px", 
                  cursor: "pointer", fontWeight: "bold"
                }}
              >
                Delete Workout
              </button>
            </div>
          );
        })}
      </div>
      {displayedWorkouts.length === 0 && <h3 style={{color: "#95a5a6", textAlign: "center", width: "100%"}}>No results found.</h3>}
    </div>
  );
}

export default App;