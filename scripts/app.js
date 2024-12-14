import { APIKEY } from './environment.js';



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

let cityNames = [];
let citySearchTimeout;


// let date1 = document.getElementById('date1')
// let date2 = document.getElementById('date2')
// let date3 = document.getElementById('date3')
// let date4 = document.getElementById('date4')
// let date5 = document.getElementById('date5')



function apiCall() {
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
            console.log(data);
            const dailyTemperatures = processTemperatures(data);

            getCurrentWeatherData(data);

            updateDateDisplay(data);

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
    const dailyTemperatures = processTemperatures(data);
    console.log("Daily Temperatures:");
    let dateCounter = 1;
    
    Object.entries(dailyTemperatures).forEach(([date, temps]) => {
        const dateElement = document.getElementById(`date${dateCounter}`);
        
        const currentDate = new Date(date);
        
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const weekdayName = weekdays[currentDate.getDay()];
        
        if (dateElement) {
            dateElement.textContent = weekdayName;
        }
        
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
        if (index === 0) {
            const day0HighTemp = document.getElementById('day0HighTemp');
            const day0LowTemp = document.getElementById('day0LowTemp');

            if (day0LowTemp && day0HighTemp) {
                const lowF = celsiusToFahrenheit(temps.minTemp);
                const highF = celsiusToFahrenheit(temps.maxTemp);
                day0HighTemp.textContent = `Low: ${lowF.toFixed(1)}°F`;
                day0LowTemp.textContent = `High: ${highF.toFixed(1)}°F`;
            }

            const day1HighTempCopy = document.getElementById('day1HighTemp-copy');
            const day1LowTempCopy = document.getElementById('day1LowTemp-copy');
            const day1HighTempCopyTwo = document.getElementById('day1HighTemp-copyTwo');

            if (day1HighTempCopy && day1LowTempCopy) {
                const highF = celsiusToFahrenheit(temps.maxTemp);
                const lowF = celsiusToFahrenheit(temps.minTemp);
                day1HighTempCopy.textContent = `High: ${highF.toFixed(1)}°F`;
                day1LowTempCopy.textContent = `Low: ${lowF.toFixed(1)}°F`;
            }

            if (day1HighTempCopyTwo) {
                const highF = celsiusToFahrenheit(temps.maxTemp);
                day1HighTempCopyTwo.textContent = `${highF.toFixed(1)}°F`;
            }
        } else {
            const dayIndex = index + 1;
            const highTempElement = document.getElementById(`day${dayIndex}HighTemp`);
            const lowTempElement = document.getElementById(`day${dayIndex}LowTemp`);
            
            const highTempCopyElement = document.getElementById(`day${dayIndex}HighTemp-copy`);

            if (highTempElement && lowTempElement) {
                const highF = celsiusToFahrenheit(temps.maxTemp);
                const lowF = celsiusToFahrenheit(temps.minTemp);
                highTempElement.textContent = `High: ${highF.toFixed(1)}°F`;
                lowTempElement.textContent = `Low: ${lowF.toFixed(1)}°F`;
                
                if (highTempCopyElement) {
                    highTempCopyElement.textContent = `${highF.toFixed(1)}°F`;
                }
            }
        }
    });
}

function processTemperatures(data) {
    const temperaturesByDay = {};

    data.list.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];

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






function updateStarImage() {
    const locationString = locationSearch.value;
    const starImage = document.getElementById('saveBtn').querySelector('img') || document.createElement('img');
    
    if (savedLocations.includes(locationString)) {
        starImage.src = 'assets/FavoriteStar.png';
    } else {
        starImage.src = 'assets/greyStar.png';
    }
    
    if (!document.getElementById('saveBtn').querySelector('img')) {
        document.getElementById('saveBtn').appendChild(starImage);
    }
}

function saveCurrentLocation() {
    const locationString = locationSearch.value;
    if (!savedLocations.includes(locationString)) {
        savedLocations.push(locationString);
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        updateSavedLocationsList();
        updateStarImage();
    }
}

saveBtn.addEventListener('click', function(){
    saveCurrentLocation();
    loadSavedLocation();
});

function loadSavedLocation(locationString) {
    locationSearch.value = locationString;
    locationSearch.dispatchEvent(new Event('change'));
    updateStarImage(); 
}

function updateSavedLocationsList() {
    const savedLocationsList = document.getElementById('savedLocationsList');
    if (savedLocationsList) {
        savedLocationsList.innerHTML = '';
        savedLocations.forEach((location, index) => {
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            div.style.display = 'flex'; 
            div.style.alignItems = 'center'; 

            const loadButton = document.createElement('button');
            loadButton.textContent = location;
            loadButton.style.whiteSpace = 'nowrap'; 
            loadButton.style.overflow = 'hidden'; 
            loadButton.style.textOverflow = 'ellipsis'; 
            loadButton.onclick = () => loadSavedLocation(location);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = `<img src="assets/FavoriteStar.png" alt="Delete" style="width: 20px; height: 20px;">`;
            deleteButton.style.marginLeft = '5px'; 
            deleteButton.onclick = () => {
                savedLocations.splice(index, 1);
                localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
                updateSavedLocationsList();
                updateStarImage(); 
            };

            div.appendChild(loadButton);
            div.appendChild(deleteButton);
            savedLocationsList.appendChild(div);
        });
    }
}

let savedLocationsList = document.getElementById('savedLocationsList');
if (!savedLocationsList) {
    savedLocationsList = document.createElement('div');
    savedLocationsList.id = 'savedLocationsList';
    savedLocationsList.style.display = 'none';
    document.body.appendChild(savedLocationsList);
}

openSaveBtn.addEventListener('click', function() {
    const savedLocationsList = document.getElementById('savedLocationsList');
    if (savedLocationsList) {
        if (savedLocationsList.style.display === 'none') {
            savedLocationsList.style.display = 'block';
            updateSavedLocationsList();
        } else {
            savedLocationsList.style.display = 'none';
        }
    }
});

locationSearch.addEventListener('change', function() {
    updateStarImage();
});

updateStarImage();







function setupCityAutocomplete() {
    const locationSearch = document.getElementById('locationSearch');
    const autocompleteList = document.createElement('ul');
    autocompleteList.id = 'autocompleteList';
    autocompleteList.style.position = 'absolute';
    autocompleteList.style.listStyleType = 'none';
    autocompleteList.style.margin = '0';
    autocompleteList.style.padding = '0';
    autocompleteList.style.maxHeight = '200px';
    autocompleteList.style.overflowY = 'auto';
    autocompleteList.style.border = '1px solid #ddd';
    autocompleteList.style.display = 'none';
    autocompleteList.style.backgroundColor = 'white';
    autocompleteList.style.width = locationSearch.offsetWidth + 'px';

    locationSearch.parentNode.insertBefore(autocompleteList, locationSearch.nextSibling);

    locationSearch.addEventListener('input', function() {
        const userInput = this.value.trim();
        
        if (citySearchTimeout) {
            clearTimeout(citySearchTimeout);
        }

        if (userInput.length < 2) {
            autocompleteList.style.display = 'none';
            return;
        }

        citySearchTimeout = setTimeout(() => {
            fetchCitySuggestions(userInput);
        }, 300);
    });

    document.addEventListener('click', function(e) {
        if (e.target !== locationSearch && e.target !== autocompleteList) {
            autocompleteList.style.display = 'none';
        }
    });

    function fetchCitySuggestions(query) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${APIKEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(cities => {
                autocompleteList.innerHTML = '';

                if (cities.length > 0) {
                    autocompleteList.style.display = 'block';
                    
                    cities.forEach(city => {
                        const listItem = document.createElement('li');
                        const cityString = city.state 
                            ? `${city.name}, ${city.state}, ${city.country}`
                            : `${city.name}, ${city.country}`;
                        
                        listItem.textContent = cityString;
                        listItem.style.padding = '10px';
                        listItem.style.cursor = 'pointer';
                        listItem.style.borderBottom = '1px solid #eee';
                        listItem.style.color = 'black';
                        listItem.style.backgroundColor = 'white';

                        listItem.addEventListener('click', () => {
                            locationSearch.value = cityString;
                            autocompleteList.style.display = 'none';
                            locationSearch.dispatchEvent(new Event('change'));
                        });

                        autocompleteList.appendChild(listItem);
                    });
                } else {
                    autocompleteList.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching city suggestions:', error);
                autocompleteList.style.display = 'none';
            });
    }
}

document.addEventListener('DOMContentLoaded', setupCityAutocomplete);











locationSearch.addEventListener('change', function () {
    const input = this.value;

    const parts = input.split(',').map(part => part.trim());

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





