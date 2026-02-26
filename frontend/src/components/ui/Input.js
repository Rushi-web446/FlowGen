import React, { useState } from "react";
import "./Input.css";

const Input = () => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Topic:", topic);
  };

  return (
    <div className="input-container">
      <h1 className="input-title">
        What do you want to learn today?
      </h1>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          className="input-field"
          placeholder="Provide some text about the topic you want to master..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />

        <button type="submit" className="submit-btn">
          Create Course
        </button>
      </form>
    </div>
  );
};

export default Input;
