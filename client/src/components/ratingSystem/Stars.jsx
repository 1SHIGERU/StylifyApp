import React, {useState} from 'react'
import './stars.css'

const Stars = ({ onStarChange }) => {

    const [selectedStars, setSelectedStars] = useState(0);

    const handleStarChange = (event) => {
        const stars = parseInt(event.target.value);
        setSelectedStars(stars);
        if (onStarChange) {
          onStarChange(stars);
        }
      };

    return (
        
            <form class="rating">
                <label>
                    <input type="radio" name="stars" value="1" onChange={handleStarChange}/>
                    <span class="icon">★</span>
                </label>
                <label>
                    <input type="radio" name="stars" value="2" onChange={handleStarChange}/>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                </label>
                <label>
                    <input type="radio" name="stars" value="3" onChange={handleStarChange}/>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                    <span class="icon">★</span>   
                </label>
                <label>
                    <input type="radio" name="stars" value="4" onChange={handleStarChange}/>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                </label>
                <label>
                    <input type="radio" name="stars" value="5" onChange={handleStarChange}/>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                    <span class="icon">★</span>
                </label>
            </form>    
        
    );
}
export default Stars