const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const dateTime = document.getElementById("current-date");
const forecasts = document.getElementById("forecasts");
let forecastInfo = [];

const currentDate = new Date();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const monthsOfYear = [
  "Null",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentDay = daysOfWeek[currentDate.getDay()];
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const day = String(currentDate.getDate()).padStart(2, "0");
const formattedDate = `${day}-${month}-${year}`;

if (searchBtn) {
  searchBtn.addEventListener("click", function () {
    console.log("Data Loading...");
    const city = cityInput.value.trim();
    console.log("Search Button Clicked, City: ", city);
    if (city !== "") {
      Promise.all([getWeatherByCity(city), getForecastByCity(city)])
        .then(() => {
          window.location = "./weather_info.html";  
          dateTime.textContent = `${formattedDate} / ${currentDay}`;
        })
        .catch(() => {
          alert("Something went wrong. Please try again.");
          cityInput.value = "";
        });
    } else {
      alert("Please enter a city name.");
    }
  });
}

// Function to fetch weather data by city name
async function getWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      console.log(`Weather data for ${city}: `, data);
      sessionStorage.setItem("weatherData", JSON.stringify(data));
    })
    .catch((error) => {
      alert(`${city} not found. Please try again...`);
      cityInput.value = "";
      throw error;
    });
}

async function getForecastByCity(city) {
  const apiUrl2 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

  return fetch(apiUrl2)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      console.log(`Forecast data for ${city}: `, data);
      sessionStorage.setItem("forecastData", JSON.stringify(data));
    })
    .catch((error) => {
      alert(`${city} not found. Please try again...`);
      cityInput.value = "";
      throw error; // Rethrow the error so Promise.all will catch it
    });
}

window.onload = function () {
  const weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
  const forecastData = JSON.parse(sessionStorage.getItem("forecastData"));

  if (weatherData && forecastData) {
    console.log(weatherData);
    console.log(forecastData);
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
  for (let forecast of forecastInfo) {
    let iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
    let img = document.createElement("img");
    img.src = iconUrl;
    img.alt = forecast.weather[0].description;
    const date = new Date(forecast.dt * 1000);
    let dayOfWeek = date.getDay();
    const forecastElement = document.createElement("div");
    forecastElement.classList.add("forecast");
    forecastElement.innerHTML = `
         <div class="forecast-card ${forecast.weather[0].main}">
              <h4 class="day">${forecast.dt_txt.substring(0, 10)} / ${daysOfWeek[dayOfWeek]}</h4>
                  <div class="weather-content">
                      <div class="temp">${forecast.main.temp} °C</div>
                      <img src="${iconUrl}" style="background-color: #adadad; border-radius: 20px; margin-left: 20px;"></img>
                  </div>
              <p class="status">${forecast.weather[0].description}</p>
          </div>
    `;

    forecasts.appendChild(forecastElement);
  }
}
