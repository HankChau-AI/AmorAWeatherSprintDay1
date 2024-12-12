import { APIKEY } from './environment.js';

//Create the apiCall while using the APIKEY from the environment.js file

// function apiCall () {
//     fetch(`api.openweathermap.org/data/2.5/forecast?q=Lodi&appid=${APIKEY}`)
//     .then((response) => {
//         return response.json()
//     })
//     .then((data) => {
//         console.log(data);
//     })
// }



// apiCall();
let locationSearch = document.getElementById("locationSearch");
let Mon
let cityName = '';
let stateCode = '';
let countryCode = '';
let day1HighTemp = document.getElementById("day1HighTemp")
let day1LowTemp = document.getElementById("day1LowTemp")
let day2HighTemp = document.getElementById("day2HighTemp")
let day2LowTemp = document.getElementById("day2LowTemp")
let day3HighTemp = document.getElementById("day3HighTemp")
let day3LowTemp = document.getElementById("day3LowTemp")
let day4HighTemp = document.getElementById("day4HighTemp")
let day4LowTemp = document.getElementById("day4LowTemp")
let day5HighTemp = document.getElementById("day5HighTemp")
let day5LowTemp = document.getElementById("day5LowTemp")

function apiCall() {
    // Construct the query string based on available information
    let query = cityName;
    if (stateCode) query += `,${stateCode}`;
    if (countryCode) query += `,${countryCode}`;

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${APIKEY}&units=metric`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            // Process temperature data
            const dailyTemperatures = processTemperatures(data);

            // Log temperatures in a readable format
            console.log("Daily Minimum and Maximum Temperatures:");
            Object.entries(dailyTemperatures).forEach(([date, temps]) => {
                console.log(`${date}: 
  Minimum Temperature: ${temps.minTemp.toFixed(1)}°C
  Maximum Temperature: ${temps.maxTemp.toFixed(1)}°C`);
            });
        })
        .catch((error) => {
            console.error('Error fetching weather data:', error);
        });
}

function updateTemperatureDisplay(temperaturesByDay) {
    Object.entries(temperaturesByDay).forEach(([date, temps], index) => {
        const dayIndex = index + 1;
        
        try {
            // Update the high temperature display
            const highTempElement = document.getElementById(`day${dayIndex}HighTemp`);
            highTempElement.textContent = `High: ${temps.maxTemp.toFixed(1)}°C`;
            
            // Update the low temperature display
            const lowTempElement = document.getElementById(`day${dayIndex}LowTemp`);
            lowTempElement.textContent = `Low: ${temps.minTemp.toFixed(1)}°C`;
        } catch (error) {
            console.error(`Error updating day ${dayIndex} temperature display:`, error);
        }
    });
}
  
  function processTemperatures(data) {
    // Group temperatures by date
    const temperaturesByDay = {};
  
    // Iterate through the list of forecasts
    data.list.forEach((forecast) => {
      // Convert timestamp to date string
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
  
      // If this date isn't in our collection, create a new entry
      if (!temperaturesByDay[date]) {
        temperaturesByDay[date] = {
          minTemp: forecast.main.temp_min,
          maxTemp: forecast.main.temp_max
        };
      } else {
        // Update min and max temperatures
        temperaturesByDay[date].minTemp = Math.min(
          temperaturesByDay[date].minTemp,
          forecast.main.temp_min
        );
        temperaturesByDay[date].maxTemp = Math.max(
          temperaturesByDay[date].maxTemp,
          forecast.main.temp_max
        );
      }
    });
  
    // Update the temperature display
    updateTemperatureDisplay(temperaturesByDay);
  
    return temperaturesByDay;
  }
  

locationSearch.addEventListener('change', function() {
    // Get the input value
    const input = this.value;
    
    // Split the input by comma and trim whitespace
    const parts = input.split(',').map(part => part.trim());
    
    // Assign parts based on input length
    if (parts.length === 3) {
        cityName = parts[0];
        stateCode = parts[1];
        countryCode = parts[2];
    } else if (parts.length === 2) {
        cityName = parts[0];
        stateCode = parts[1];
        countryCode = ''; // Reset country code
    } else if (parts.length === 1) {
        cityName = parts[0];
        stateCode = '';
        countryCode = '';
    }
    
    // Log the separated variables
    console.log('City:', cityName);
    console.log('State:', stateCode);
    console.log('Country:', countryCode);

    // Call the API
    apiCall();
});


