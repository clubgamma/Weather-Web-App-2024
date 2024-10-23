const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const dateTime = document.getElementById("current-date");
let forecastInfo = []; 

if (searchBtn) {
  searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();
    if (city !== "") {
      getWeatherByCity(city);
      getForecastByCity(city);
    } else {
      alert("Please enter a city name.");
    }
  });
}

function getWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("weatherData", JSON.stringify(data));
    })
    .catch((error) => {
      alert(`${city} not found. Please try again...`);
      cityInput.value = "";
    });
}

function getForecastByCity(city) {
  const apiUrl2 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  fetch(apiUrl2)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("forecastData", JSON.stringify(data));
      window.location = "weather_info.html"; 
    })
    .catch((error) => {
      alert(`${city} not found. Please try again...`);
      cityInput.value = "";
    });
}

window.onload = function () {
  const weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
  const forecastData = JSON.parse(sessionStorage.getItem("forecastData"));

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
  const chanceOfRain = document.getElementById("chance-of-rain");

  cityName.textContent = data.name;
  temperature.textContent = `${data.main.temp} °C`;
  weatherDesc.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity} %`;

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

    const dayElem = card.querySelector('.day');
    const tempElem = card.querySelector('.temp');
    const iconElem = card.querySelector('.icon');
    const statusElem = card.querySelector('.status');

    dayElem.textContent = day;
    tempElem.textContent = temperature;
    iconElem.className = `fas fa-3x ${iconClass}`;
    statusElem.textContent = weatherDescription;
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