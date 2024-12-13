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

let saveBtn = document.getElementById("saveBtn")

let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];


// let date1 = document.getElementById('date1')
// let date2 = document.getElementById('date2')
// let date3 = document.getElementById('date3')
// let date4 = document.getElementById('date4')
// let date5 = document.getElementById('date5')



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
            console.log(data);
            const dailyTemperatures = processTemperatures(data);

            getCurrentWeatherData(data);

            updateDateDisplay(data);

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

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function updateDateDisplay(data) {
    // Update the date elements for the next 5 days
    const dailyTemperatures = processTemperatures(data);
    console.log("Daily Temperatures:");
    let dateCounter = 1;
    
    Object.entries(dailyTemperatures).forEach(([date, temps]) => {
        // Get the element by sequential ID
        const dateElement = document.getElementById(`date${dateCounter}`);
        
        // Convert date from YYYY-MM-DD to MM/DD/YYYY
        const [year, month, day] = date.split('-');
        const formattedDate = `${month}/${day}/${year}`;
        
        // Set the text content of the element to the formatted date
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
        
        // Increment the counter for the next iteration
        dateCounter++;
    });
}

function getCurrentWeatherData(data) {
    const currentWeather = data.list[0];
    const location = `${data.city.name}, ${data.city.country}`;
    const currentTempF = celsiusToFahrenheit(currentWeather.main.temp);
    const currentDate = new Date(currentWeather.dt * 1000).toLocaleDateString();
    const currentCondition = currentWeather.weather[0].description;

    document.getElementById('Location').textContent = location;
    document.getElementById('currentTemp').textContent = `${currentTempF.toFixed(1)}°F`;
    document.getElementById('date').textContent = currentDate;
    document.getElementById('condition').textContent = currentCondition;
}

function updateTemperatureDisplay(temperaturesByDay) {
    Object.entries(temperaturesByDay).forEach(([date, temps], index) => {
        // Check if it's the first day (index 0)
        if (index === 0) {
            // Update first instance
            const day0HighTemp = document.getElementById('day0HighTemp');
            const day0LowTemp = document.getElementById('day0LowTemp');

            if (day0LowTemp && day0HighTemp) {
                const lowF = celsiusToFahrenheit(temps.minTemp);
                const highF = celsiusToFahrenheit(temps.maxTemp);
                day0HighTemp.textContent = `Low: ${lowF.toFixed(1)}°F`;
                day0LowTemp.textContent = `High: ${highF.toFixed(1)}°F`;
            }

            // Update second instance (copy)
            const day1HighTempCopy = document.getElementById('day1HighTemp-copy');
            const day1LowTempCopy = document.getElementById('day1LowTemp-copy');

            if (day1HighTempCopy && day1LowTempCopy) {
                const highF = celsiusToFahrenheit(temps.maxTemp);
                const lowF = celsiusToFahrenheit(temps.minTemp);
                day1HighTempCopy.textContent = `High: ${highF.toFixed(1)}°F`;
                day1LowTempCopy.textContent = `Low: ${lowF.toFixed(1)}°F`;
            }
        } else {
            const dayIndex = index + 1;
            const highTempElement = document.getElementById(`day${dayIndex}HighTemp`);
            const lowTempElement = document.getElementById(`day${dayIndex}LowTemp`);

            if (highTempElement && lowTempElement) {
                const highF = celsiusToFahrenheit(temps.maxTemp);
                const lowF = celsiusToFahrenheit(temps.minTemp);
                highTempElement.textContent = `High: ${highF.toFixed(1)}°F`;
                lowTempElement.textContent = `Low: ${lowF.toFixed(1)}°F`;
            }
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

        // If this date isn't in collection, create a new entry
        if (!temperaturesByDay[date]) {
            temperaturesByDay[date] = {
                minTemp: forecast.main.temp_min,
                maxTemp: forecast.main.temp_max
            };
        } else {

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


    updateTemperatureDisplay(temperaturesByDay);

    return temperaturesByDay;
}






function saveCurrentLocation() {
    const locationString = locationSearch.value;
    if (!savedLocations.includes(locationString)) {
        savedLocations.push(locationString);
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        updateSavedLocationsList();
    }
}

saveBtn.addEventListener('click', function(){
    saveCurrentLocation();
})

// Add this function to load a saved location
function loadSavedLocation(locationString) {
    locationSearch.value = locationString;
    // Trigger the existing change event handler
    locationSearch.dispatchEvent(new Event('change'));
}

// Add this function to display the saved locations
function updateSavedLocationsList() {
    const savedLocationsList = document.getElementById('savedLocationsList');
    if (savedLocationsList) {
        savedLocationsList.innerHTML = '';
        savedLocations.forEach((location, index) => {
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            
            const loadButton = document.createElement('button');
            loadButton.textContent = location;
            loadButton.onclick = () => loadSavedLocation(location);
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.onclick = () => {
                savedLocations.splice(index, 1);
                localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
                updateSavedLocationsList();
            };
            
            div.appendChild(loadButton);
            div.appendChild(deleteButton);
            savedLocationsList.appendChild(div);
        });
    }
}

locationSearch.addEventListener('change', function () {
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
        countryCode = '';
    } else if (parts.length === 1) {
        cityName = parts[0];
        stateCode = '';
        countryCode = '';
    }

    console.log('City:', cityName);
    console.log('State:', stateCode);
    console.log('Country:', countryCode);

    apiCall();
});

