const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const dateTime = document.getElementById("current-date");
const suggestionsBox = document.getElementById('suggestions');
const suggestions = document.getElementsByClassName('suggestion');
const loadingIndicator = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
let forecastInfo = []; 
let debounceTimeout;

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
