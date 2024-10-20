const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const errorMsg = document.getElementById("error-msg");
const feelsLike = document.getElementById("feels_like");
const grndLevel = document.getElementById("grnd_level");
const pressure = document.getElementById("pressure");
const seaLevel = document.getElementById("sea_level");
const avgTemp = document.getElementById("avg_temp");
const dateTime = document.getElementById("current-date");

if (searchBtn) {
  searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();
    if (city !== "") {
      getWeatherByCity(city); 
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
      window.location.href = "weather_info.html";
    })
    .catch(() => {
      alert(`${cityInput.value} city not found. Please try again...`);
      cityInput.value = "";
    });
}

window.onload = function () {
  const weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
  if (weatherData) {
    updateWeatherInfo(weatherData);
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
  feelsLike.textContent = `Feel : ${data.main.feels_like} °C`;
  grndLevel.textContent = `Ground Level : ${data.main.grnd_level} hPa`;
  pressure.textContent = `Pressure : ${data.main.pressure} Pa`;
  seaLevel.textContent = `Sea Level : ${data.main.sea_level} hPa`; 
  avgTemp.textContent = `Avg. Temp : ${data.main.temp_max / 2 + data.main.temp_min / 2} °C`;

  if (data.rain && data.rain["1h"]) {
    chanceOfRain.textContent = `Chance of Rain : ${data.rain["1h"]} %`;
  } else {
    chanceOfRain.textContent = "Chance of Rain : N/A";
  }
};


const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDate = new Date();
const currentDay = daysOfWeek[currentDate.getDay()];

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
const day = String(currentDate.getDate()).padStart(2, '0');

const formattedDate = `${day}-${month}-${year}`;
dateTime.textContent = `${formattedDate} / ${currentDay}`;