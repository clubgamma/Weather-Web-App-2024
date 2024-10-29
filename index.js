const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const dateTime = document.getElementById("current-date");
const suggestionsBox = document.getElementById('suggestions');
const suggestions = document.getElementsByClassName('suggestion');
const loadingIndicator = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const currentLocationBtn = document.getElementById("current-location-btn");
let forecastInfo = []; 
let debounceTimeout;


function getAirQuality(lat, lon) {
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
  return fetch(aqiUrl)
    .then(response => {
      if (!response.ok) throw new Error('Air quality data not available');
      return response.json();
    })
    .then(data => {
      sessionStorage.setItem("aqiData", JSON.stringify(data));
      return data;
    });
}

function updateAQIInfo(data) {
  if (!data || !data.list || !data.list[0]) {
    console.error("Invalid AQI data:", data);
    return;
  }

  const aqiValue = document.getElementById("aqi-value");
  const aqiStatus = document.getElementById("aqi-status");
  const aqiDescription = document.getElementById("aqi-description");
  const aqiIcon = document.querySelector(".air-quality .fas.fa-lungs");

  const aqi = data.list[0].main.aqi;
  
  const aqiStatuses = {
    1: { status: "Good", description: "Air quality is satisfactory, and air pollution poses little or no risk." },
    2: { status: "Fair", description: "Air quality is acceptable; however, some pollutants may be moderate." },
    3: { status: "Moderate", description: "Members of sensitive groups may experience health effects." },
    4: { status: "Poor", description: "Everyone may begin to experience health effects." },
    5: { status: "Very Poor", description: "Health warnings of emergency conditions. Everyone is more likely to be affected." }
  };

  const aqiInfo = aqiStatuses[aqi];
  
  if (aqiValue) aqiValue.textContent = `AQI: ${aqi}`;
  if (aqiStatus) aqiStatus.textContent = `Quality: ${aqiInfo.status}`;
  if (aqiDescription) aqiDescription.textContent = aqiInfo.description;
  if (aqiIcon) aqiIcon.style.color = getAQIColor(aqi);
}

// Get current location button handler
function handleGetCurrentLocation() {
  if (navigator.geolocation) {
      showLoading();
      navigator.geolocation.getCurrentPosition(
          // Success callback
          position => {
              const { latitude, longitude } = position.coords;
              getWeatherByCurrentLocation(latitude, longitude);
          },
          // Error callback
          error => {
              hideLoading();
              handleLocationError(error);
          },
          // Options
          {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
          }
      );
  } else {
      displayErrorMessage("Geolocation is not supported by your browser");
  }
}

// Handle location errors
function handleLocationError(error) {
  let errorMessage;
  switch (error.code) {
      case error.PERMISSION_DENIED:
          errorMessage = "Please allow location access to use this feature.";
          break;
      case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
      case error.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      default:
          errorMessage = "An unknown error occurred getting your location.";
  }
  displayErrorMessage(errorMessage);
}
function getAQIColor(aqi) {
  const colors = {
    1: "#00e400", // Good - Green
    2: "#ffff00", // Fair - Yellow
    3: "#ff7e00", // Moderate - Orange
    4: "#ff0000", // Poor - Red
    5: "#7f0023"  // Very Poor - Purple
  };
  return colors[aqi] || "#cccccc";
}
// Get weather for current location
function getWeatherByCurrentLocation(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  Promise.all([
    fetch(weatherUrl).then(response => response.json()),
    fetch(forecastUrl).then(response => response.json()),
    fetch(aqiUrl).then(response => response.json())
  ])
  .then(([weatherData, forecastData, aqiData]) => {
    sessionStorage.setItem("weatherData", JSON.stringify(weatherData));
    sessionStorage.setItem("forecastData", JSON.stringify(forecastData));
    sessionStorage.setItem("aqiData", JSON.stringify(aqiData));
    hideLoading();
    window.location = "weather_info.html";
  })
  .catch(error => {
    console.error("Error:", error);
    displayErrorMessage("Unable to fetch weather data. Please try again.");
    hideLoading();
  });
}

if (currentLocationBtn) {
  currentLocationBtn.addEventListener("click", handleGetCurrentLocation);
}

function showLoading() {
  loadingIndicator.style.display = "block"; 
}

function hideLoading() {
  loadingIndicator.style.display = "none"; 
}

function displayErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block"; // Show the error message
}

function hideErrorMessage() {
  errorMessage.style.display = "none"; // Hide the error message
}

if (cityInput) {
  cityInput.addEventListener('input', async function() {
    const query = cityInput.value.trim();

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {
      if (query.length > 0) {
        const suggestions = await fetchCities(query);
        displaySuggestions(suggestions);
      } else {
        suggestionsBox.innerHTML = '';
      }
    }, 400);
  });
}

async function fetchCities(query) {
  console.log('api called');
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
  const cities = await response.json();
  return cities.map(city => `${city.name}, ${city.country}`);
}

function displaySuggestions(suggestions) {
  suggestionsBox.innerHTML = '';
  suggestions.forEach(suggestion => {
      const li = document.createElement('li');
      li.classList.add('suggestion');
      li.textContent = suggestion;
      suggestionsBox.appendChild(li);
      li.addEventListener('click', function() {
        cityInput.value = suggestion;
        suggestionsBox.innerHTML = '';
      })
  });
}

const fetchData = () => {
  const city = cityInput.value.trim();
    if (city !== "") {
      showLoading(); 
      getWeatherByCity(city)
        .then(() => {
          //console.log("Fetching weather data for:", city);
          return getForecastByCity(city);
        })
        .then(() => {
        hideLoading(); 
       })
        .catch((error) => {
          console.error("Error in weather/fetch: ", error);
          hideLoading();
        });
    }  else {
      displayErrorMessage("Please enter a city name.");
    }
}

if (searchBtn) {
  searchBtn.addEventListener("click", fetchData);
}

if(cityInput){
  cityInput.addEventListener('keyup',(e) => {
    if(e.key === 'Enter'){
      fetchData();
    }
  })
}

function getWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("weatherData", JSON.stringify(data));
      // Get coordinates for AQI
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      // Fetch AQI data
      return fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    })
    .then(response => response.json())
    .then(aqiData => {
      sessionStorage.setItem("aqiData", JSON.stringify(aqiData));
      hideErrorMessage();
    })
    .catch((error) => {
      displayErrorMessage(`${city} not found. Please try again...`);
      cityInput.value = "";
      hideLoading();
      throw error;
    });
}

function getForecastByCity(city) {
  const apiUrl2 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  return fetch(apiUrl2)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("forecastData", JSON.stringify(data));
      hideErrorMessage(); 
      hideLoading();
      window.location = "weather_info.html"; 
    })
    .catch((error) => {
      displayErrorMessage(`${city} not found. Please try again...`);
      cityInput.value = "";
      hideLoading();
      throw error;
    });
}

window.onload = function () {
  const weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
  const forecastData = JSON.parse(sessionStorage.getItem("forecastData"));
  const aqiData = JSON.parse(sessionStorage.getItem("aqiData"));

  console.log("Weather Data:", weatherData);
  console.log("Forecast Data:", forecastData);
  console.log("AQI Data:", aqiData);

  if (weatherData) {
    updateWeatherInfo(weatherData);
  }

  if (forecastData && forecastData.list) {
    forecastInfo = forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 5); 
    populateForecastCards();
  }

  if (aqiData) {
    updateAQIInfo(aqiData);
  }
};

function updateWeatherInfo(data) {
  const cityName = document.getElementById("city-name");
  const temperature = document.getElementById("temperature");
  const weatherDesc = document.getElementById("weather-desc");
  const humidity = document.getElementById("humidity");
  const windSpeed = document.getElementById("wind-speed");
  const chanceOfRain = document.getElementById("chance-of-rain");

  cityName.textContent = data.name;
  temperature.textContent = `${data.main.temp} °C`;
  weatherDesc.textContent = data.weather[0].description;
  humidity.textContent = `Humidity: ${data.main.humidity} %`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  if (data.rain && data.rain["1h"]) {
    chanceOfRain.textContent = `Chance of Rain : ${data.rain["1h"]} %`;
  } else {
    chanceOfRain.textContent = "Chance of Rain : N/A";
  }
}

function populateForecastCards() {
  const forecastCards = document.querySelectorAll('.forecast-card');

  forecastCards.forEach((card, index) => {
    const forecast = forecastInfo[index];
    const date = new Date(forecast.dt * 1000); 
    const day = daysOfWeek[date.getDay()];
    const temperature = `${Math.round(forecast.main.temp)}°C`;
    const weatherDescription = forecast.weather[0].description;
    const iconClass = getWeatherIconClass(forecast.weather[0].icon);
    const humidityElem = card.querySelector('.humidity');
    const windSpeedElem = card.querySelector('.wind-speed');

    const dayElem = card.querySelector('.day');
    const tempElem = card.querySelector('.temp');
    const iconElem = card.querySelector('.icon');
    const statusElem = card.querySelector('.status');

    dayElem.textContent = day;
    tempElem.textContent = temperature;
    iconElem.className = `fas fa-3x ${iconClass}`;
    statusElem.textContent = weatherDescription;

    humidityElem.textContent = `${forecast.main.humidity} %`;
    windSpeedElem.textContent = `${forecast.wind.speed} m/s`;
  });
}

function getWeatherIconClass(icon) {
  const iconMapping = {
    "01d": "fa-sun",
    "01n": "fa-moon",
    "02d": "fa-cloud-sun",
    "02n": "fa-cloud-moon",
    "03d": "fa-cloud",
    "03n": "fa-cloud",
    "04d": "fa-cloud-meatball",
    "04n": "fa-cloud-meatball",
    "09d": "fa-cloud-showers-heavy",
    "09n": "fa-cloud-showers-heavy",
    "10d": "fa-cloud-sun-rain",
    "10n": "fa-cloud-moon-rain",
    "11d": "fa-bolt",
    "11n": "fa-bolt",
    "13d": "fa-snowflake",
    "13n": "fa-snowflake",
    "50d": "fa-smog",
    "50n": "fa-smog"
  };
  return iconMapping[icon] || "fa-cloud";
}

const currentDate = new Date();
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = daysOfWeek[currentDate.getDay()];
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const day = String(currentDate.getDate()).padStart(2, "0");
const formattedDate = `${day}-${month}-${year}`;
dateTime.textContent = `${formattedDate} / ${currentDay}`;