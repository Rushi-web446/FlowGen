import React from 'react';
import './Input.css';

const Input = ({ label, error, ...props }) => {
    return (
        <div className="input-container">
            {label && <label className="input-label">{label}</label>}
            <input
                className={`custom-input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default Input;
