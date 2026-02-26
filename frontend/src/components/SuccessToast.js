import { useEffect } from "react";
import "./SuccessToast.css";

const SuccessToast = ({ message, duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="success-toast">
      <div className="success-toast-content">
        <span className="success-toast-icon">✅</span>
        <p className="success-toast-message">{message}</p>
      </div>
      <div className="success-toast-progress"></div>
    </div>
  );
};

export default SuccessToast;
