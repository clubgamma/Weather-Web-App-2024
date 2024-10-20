const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const dateTime = document.getElementById("current-date");
const forecasts = document.getElementById("forecasts");
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

// Function to fetch weather data by city name
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
      window.location = "http://127.0.0.1:5500/Weather-Web-App-2024/weather_info.html"; 
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
    for (let i = 0; i < forecastData.list.length; i += 7) { 
      forecastInfo.push(forecastData.list[i]);
    }

    populateForecasts();
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

function populateForecasts() {
  forecasts.innerHTML = ""; 

  for (let forecast of forecastInfo) {
    const date = new Date(forecast.dt * 1000); 
    const day = daysOfWeek[date.getDay()];
    const temperature = forecast.main.temp;
    const weatherDescription = forecast.weather[0].description;
    const icon = forecast.weather[0].icon;

    const forecastElement = document.createElement('div');
    forecastElement.classList.add('forecast');
    forecastElement.style.display = "flex";
    forecastElement.style.justifyContent = "space-between";
    forecastElement.style.padding = "5px"; 
    forecastElement.style.borderRadius = "5px"; 

    forecastElement.innerHTML = `
      <div class="forecast-date" style="padding: 2px; border-radius: 5px;">${day}</div>
      <div class="forecast-desc" style="padding: 2px; border-radius: 5px;">${weatherDescription}</div> 
      <div class="forecast-temp" style="padding: 2px; border-radius: 5px;">${temperature} °C</div>
    `;

    forecasts.appendChild(forecastElement);
  }
}

const currentDate = new Date();
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = daysOfWeek[currentDate.getDay()];
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const day = String(currentDate.getDate()).padStart(2, "0");
const formattedDate = `${day}-${month}-${year}`;
dateTime.textContent = `${formattedDate} / ${currentDay}`;