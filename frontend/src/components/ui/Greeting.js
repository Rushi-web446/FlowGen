import React from "react";
import "./Greeting.css";

const Greeting = ({ user }) => {
  const hour = new Date().getHours();

  const timeGreeting =
    hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="greeting">
      <h1 className="greeting__title">
        Good {timeGreeting}
        <span className="greeting__username">
          {user?.name ? `, ${user.name}` : ""}
        </span>
      </h1>
    </div>
  );
};

export default Greeting;
