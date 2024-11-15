import React, { useState } from 'react';
import './stars.css';

const Stars = ({ rating, onStarChange }) => {
  return (
    <form className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star}>
          <input
            type="radio"
            name="stars"
            value={star}
            checked={rating === star} // Sprawdza, czy gwiazdka jest zaznaczona
            onChange={() => onStarChange(star)} // Wywołuje funkcję `onStarChange`
          />
          {Array.from({ length: star }, (_, index) => (
            <span className="icon" key={index}>★</span> // Renderowanie odpowiedniej liczby gwiazdek
          ))}
        </label>
      ))}
    </form>
  );
};

export default Stars;
