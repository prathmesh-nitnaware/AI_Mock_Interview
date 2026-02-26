import React from 'react';
import '../components.css'; // Adjusted path based on your file tree

const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  icon = null, // Optional icon component (e.g. from lucide-react)
  className = '' // Allows passing extra classes for spacing
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-glass-label" htmlFor={name}>{label}</label>}
      
      <div className="input-glass-wrapper">
        {icon && <span className="input-glass-icon">{icon}</span>}
        
        <input
          id={name}
          className={`input-glass-field ${icon ? 'has-icon' : ''}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
};

export default InputField;