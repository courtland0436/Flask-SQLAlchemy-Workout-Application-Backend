import React, { useState, useEffect } from "react";

function WorkoutForm({ onAddWorkout }) {
  const [allExercises, setAllExercises] = useState([]);
  const [status, setStatus] = useState("idle"); // NEW: 'idle', 'loading', or 'success'
  const [formData, setFormData] = useState({
    date: "",
    duration_minutes: "",
    notes: "",
    category: "",
    selectedExercises: [] 
  });

  useEffect(() => {
    fetch("http://localhost:5555/exercises")
      .then((r) => r.json())
      .then((data) => setAllExercises(data));
  }, []);

  const filteredExercises = allExercises.filter(ex => ex.category === formData.category);

  const handleToggleExercise = (id) => {
    const isSelected = formData.selectedExercises.some(ex => ex.exercise_id === id);
    if (isSelected) {
      setFormData({
        ...formData,
        selectedExercises: formData.selectedExercises.filter(ex => ex.exercise_id !== id)
      });
    } else {
      setFormData({
        ...formData,
        selectedExercises: [...formData.selectedExercises, { exercise_id: id, sets: 3, reps: 10 }]
      });
    }
  };

  const handleUpdateDetail = (id, field, value) => {
    setFormData({
      ...formData,
      selectedExercises: formData.selectedExercises.map(ex => 
        ex.exercise_id === id ? { ...ex, [field]: parseInt(value) || 0 } : ex
      )
    });
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (formData.selectedExercises.length === 0) {
      alert("Please select at least one exercise!");
      return;
    }

    // Set status to loading to provide feedback and prevent double-clicks
    setStatus("loading");

    fetch("http://localhost:5555/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("POST failed");
      })
      .then((newWorkout) => {
        onAddWorkout(newWorkout);
        setFormData({ date: "", duration_minutes: "", notes: "", category: "", selectedExercises: [] });
        
        // Show success state
        setStatus("success");

        // Revert back to original button after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("idle");
        alert("Something went wrong saving your workout.");
      });
  }

  const fieldContainerStyle = { 
    display: "flex", 
    flexDirection: "column", 
    marginBottom: "15px",
    width: "100%",
    alignItems: "center"
  };

  const inputStyle = { 
    padding: "10px", 
    borderRadius: "5px", 
    border: "1px solid #ccc",
    fontSize: "14px",
    width: "100%", 
    maxWidth: "100%", 
    boxSizing: "border-box" 
  };

  const labelStyle = { 
    marginBottom: "5px", 
    width: "100%", 
    textAlign: "left", 
    fontSize: "14px" 
  };

  // DYNAMIC BUTTON STYLE
  const buttonStyle = { 
    width: "100%", 
    padding: "12px", 
    backgroundColor: status === "success" ? "#2ecc71" : "#28a745", // Green turns to bright green on success
    color: "white", 
    border: "none", 
    borderRadius: "6px", 
    fontWeight: "bold", 
    cursor: status === "loading" ? "not-allowed" : "pointer",
    fontSize: "16px",
    marginTop: "10px",
    transition: "all 0.3s ease" // Smooth color transition
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      backgroundColor: "white", padding: "25px", borderRadius: "12px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px", 
      boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#2f3640" }}>Add New Workout</h2>
      
      <div style={fieldContainerStyle}>
        <label style={labelStyle}><strong>Date</strong></label>
        <input 
          type="date" 
          style={inputStyle} 
          value={formData.date} 
          onChange={(e) => setFormData({...formData, date: e.target.value})} 
          required 
        />
      </div>

      <div style={fieldContainerStyle}>
        <label style={labelStyle}><strong>Duration (minutes)</strong></label>
        <input 
          type="number" 
          placeholder="e.g. 45"
          style={inputStyle} 
          value={formData.duration_minutes} 
          onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})} 
          required 
        />
      </div>

      <div style={fieldContainerStyle}>
        <label style={labelStyle}><strong>Focus Area</strong></label>
        <select 
          style={inputStyle} 
          value={formData.category} 
          onChange={(e) => setFormData({...formData, category: e.target.value, selectedExercises: []})} 
          required
        >
          <option value="" disabled>Select Focus Area</option>
          {['Chest', 'Back', 'Legs', 'Core', 'Arms'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={fieldContainerStyle}>
        <label style={labelStyle}><strong>Select Exercises</strong></label>
        <div style={{ 
          ...inputStyle, 
          minHeight: "100px", 
          maxHeight: "200px", 
          overflowY: "auto", 
          backgroundColor: "#f9f9f9" 
        }}>
          {formData.category ? (
            filteredExercises.map(ex => {
              const selectedData = formData.selectedExercises.find(s => s.exercise_id === ex.id);
              return (
                <div key={ex.id} style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input 
                        type="checkbox" 
                        id={`check-${ex.id}`}
                        checked={!!selectedData} 
                        onChange={() => handleToggleExercise(ex.id)} 
                        style={{ cursor: "pointer" }}
                    />
                    <label htmlFor={`check-${ex.id}`} style={{ marginLeft: "10px", fontSize: "14px", cursor: "pointer" }}>{ex.name}</label>
                  </div>
                  
                  {selectedData && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", marginLeft: "25px" }}>
                      <input 
                        type="number" 
                        style={{ width: "55px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }} 
                        value={selectedData.sets} 
                        onChange={(e) => handleUpdateDetail(ex.id, 'sets', e.target.value)} 
                      />
                      <span style={{ fontSize: "12px", alignSelf: "center" }}>sets ×</span>
                      <input 
                        type="number" 
                        style={{ width: "55px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }} 
                        value={selectedData.reps} 
                        onChange={(e) => handleUpdateDetail(ex.id, 'reps', e.target.value)} 
                      />
                      <span style={{ fontSize: "12px", alignSelf: "center" }}>reps</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: "13px", color: "#95a5a6", textAlign: "center", marginTop: "30px" }}>
              Select a Focus Area to see exercises.
            </p>
          )}
        </div>
      </div>

      <div style={fieldContainerStyle}>
        <label style={labelStyle}><strong>Notes</strong></label>
        <textarea 
          placeholder="How did it go?"
          style={{ ...inputStyle, height: "60px", resize: "none" }} 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})} 
        />
      </div>

      <button 
        type="submit" 
        style={buttonStyle}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Saving..." : status === "success" ? "✓ Saved!" : "Save Workout"}
      </button>

      {status === "success" && (
        <p style={{ color: "#2ecc71", fontSize: "12px", marginTop: "10px", fontWeight: "bold" }}>
          Workout successfully logged!
        </p>
      )}
    </form>
  );
}

export default WorkoutForm;