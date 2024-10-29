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

// Get weather for current location
function getWeatherByCurrentLocation(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  Promise.all([
      fetch(weatherUrl).then(response => {
          if (!response.ok) throw new Error('Weather data not available');
          return response.json();
      }),
      fetch(forecastUrl).then(response => {
          if (!response.ok) throw new Error('Forecast data not available');
          return response.json();
      })
  ])
  .then(([weatherData, forecastData]) => {
      // Store the data
      sessionStorage.setItem("weatherData", JSON.stringify(weatherData));
      sessionStorage.setItem("forecastData", JSON.stringify(forecastData));

      // Redirect to weather info page
      hideLoading();
      window.location = "weather_info.html";
  })
  .catch(error => {
      console.error("Error fetching weather:", error);
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
      console.log("Data:", data);
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
  // console.log(weatherData);
  if (weatherData && forecastData) {
    updateWeatherInfo(weatherData);
  }

  if (forecastData && forecastData.list) {
    forecastInfo = forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 5); 
    populateForecastCards();
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

     const iconSrc = getWeatherIconClass(forecast.weather[0].icon); 
    const mainSrc = getWeatherIconClass(forecast.weather[0].icon);
    
    const humidityElem = card.querySelector('.humidity');
    const windSpeedElem = card.querySelector('.wind-speed');

    const dayElem = card.querySelector('.day');
    const tempElem = card.querySelector('.temp');
    const iconElem = card.querySelector('.icon');
    const statusElem = card.querySelector('.status');
    const mainElem = document.querySelector(".icons");

    dayElem.textContent = day;
    tempElem.textContent = temperature;
    // iconElem.className = `fas fa-3x ${iconClass}`;
    iconElem.src = iconSrc;
    mainElem.src = mainSrc;
    statusElem.textContent = weatherDescription;

    humidityElem.textContent = `${forecast.main.humidity} %`;
    windSpeedElem.textContent = `${forecast.wind.speed} m/s`;
  });
}

function getWeatherIconClass(icon) {
  const iconMapping = {
    "01d": "./images/clear-sky.png",
    "01n": "./images/clear-sky.png",
    "02d": "./images/cloud-sun.png",
    "02n": "https://openweathermap.org/img/wn/02n@2x.png",
    "03d": "./images/scatter-clouds.png",
    "03n": "./images/scatter-clouds.png", 
    "04d": "./images/partial-cloud.png",
    "04n": "./images/partial-cloud.png",
    "09d": "./images/shower-rain.png",
    "09n": "./images/shower-rain.png",
    "10d": "./images/rainy.png",
    "10n": "https://openweathermap.org/img/wn/10n@2x.png", 
    "11d": "./images/stormy.png",
    "11n": "./images/stormy.png",
    "13d": "./images/snow.png",
    "13n": "./images/snow.png",
    "50d": "./images/mist.png",
    "50n": "./images/mist.png"
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
