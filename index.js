const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherCard = document.getElementById("weather-card");
const errorMsg = document.getElementById("error-msg");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const weatherDesc = document.getElementById("weather-desc");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();
  if (city !== "") {
    getWeatherByCity(city);
  } else {
    alert("Please enter a city name.");
  }
});

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
      updateWeatherInfo(data);
      cityInput.value = "";
    })
    .catch(() => {
      errorMsg.textContent = "City not found, Please try again.";
      errorMsg.style.display = "block";
      weatherCard.style.display = "none";
    });
}

// Function to fetch weather data by coordinates
function getWeatherByLocation(latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      updateWeatherInfo(data);
    })
    .catch(() => {
      errorMsg.textContent = "Failed to fetch weather data for your location.";
      errorMsg.style.display = "block";
      weatherCard.style.display = "none";
    });
}

// Function to update the weather card with data
function updateWeatherInfo(data) {
  cityName.textContent = data.name;
  temperature.textContent = `${data.main.temp} °C`;
  weatherDesc.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity} %`;
  windSpeed.textContent = `${data.wind.speed} m/s`;

  weatherCard.style.display = "block";
  errorMsg.style.display = "none";
}

// Function to get user's location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByLocation(lat, lon);
      },
      function () {
        errorMsg.textContent = "Location access denied. Cannot fetch weather data.";
        errorMsg.style.display = "block";
        weatherCard.style.display = "none";
      }
    );
  } else {
    errorMsg.textContent = "Geolocation is not supported by this browser.";
    errorMsg.style.display = "block";
  }
}

getUserLocation();
