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


function apiCall() {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Lodi&appid=${APIKEY}&units=metric`)
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

    return temperaturesByDay;
}

apiCall();


