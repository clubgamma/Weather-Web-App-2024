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



function getUVIndex(lat, lon) {
  const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
  return fetch(uvUrl)
    .then(response => {
      if (!response.ok) throw new Error('UV data not available');
      return response.json();
    })
    .then(data => {
      sessionStorage.setItem("uvData", JSON.stringify(data));
      return data;
    });
}

function loadWeatherMap() {
  const weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
  if (!weatherData || !weatherData.coord) return;

  const { lat, lon } = weatherData.coord;
  
  // Initialize the map
  const map = L.map('weather-map', {
    center: [lat, lon],
    zoom: 12,
    scrollWheelZoom: false, // Disable scroll wheel zoom by default
    zoomControl: true
  });

  // Add the tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add a marker for the city location
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`${weatherData.name}, ${weatherData.sys.country}`)
    .openPopup();

  let isMapActive = false;
  const mapElement = document.getElementById('weather-map');

  // Prevent scroll propagation when cursor is over the map
  mapElement.addEventListener('wheel', function(e) {
    if (!isMapActive) {
      e.stopPropagation();
    }
  }, { passive: false });

  // Handle touch events for mobile
  mapElement.addEventListener('touchmove', function(e) {
    if (!isMapActive) {
      e.stopPropagation();
    }
  }, { passive: false });

  // Add click handler to enable/disable zoom
  map.on('click', function() {
    if (!isMapActive) {
      map.scrollWheelZoom.enable();
      isMapActive = true;
      mapElement.style.border = '2px solid #4CAF50';
      zoomMessage.textContent = 'Zoom enabled - Click map to disable';
    } else {
      map.scrollWheelZoom.disable();
      isMapActive = false;
      mapElement.style.border = '1px solid #ccc';
      zoomMessage.textContent = 'Click map to enable zoom';
    }
  });

  // Add zoom message
  const zoomMessage = document.createElement('div');
  zoomMessage.className = 'map-message';
  zoomMessage.textContent = 'Click map to enable zoom';
  mapElement.appendChild(zoomMessage);

  // Add intersection observer to handle scroll visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && isMapActive) {
        // Disable zoom when map scrolls out of view
        map.scrollWheelZoom.disable();
        isMapActive = false;
        mapElement.style.border = '1px solid #ccc';
        zoomMessage.textContent = 'Click map to enable zoom';
      }
    });
  }, {
    threshold: 0.5 // Trigger when 50% of the map is visible/invisible
  });

  observer.observe(mapElement);

  // Optional: Add escape key handler to disable zoom
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMapActive) {
      map.scrollWheelZoom.disable();
      isMapActive = false;
      mapElement.style.border = '1px solid #ccc';
      zoomMessage.textContent = 'Click map to enable zoom';
    }
  });

  // Handle mouse leave
  mapElement.addEventListener('mouseleave', function() {
    if (isMapActive) {
      map.scrollWheelZoom.disable();
      isMapActive = false;
      mapElement.style.border = '1px solid #ccc';
      zoomMessage.textContent = 'Click map to enable zoom';
    }
  });

  // Prevent default scroll behavior when cursor is over the map
  mapElement.addEventListener('mouseenter', function() {
    document.body.style.overflow = isMapActive ? 'hidden' : 'auto';
  });

  mapElement.addEventListener('mouseleave', function() {
    document.body.style.overflow = 'auto';
  });
}

function updateUVInfo(data) {
  const uvValue = document.getElementById("uv-value");
  const uvLevel = document.getElementById("uv-level");
  const uvAdvice = document.getElementById("uv-advice");
  const uvProgressFill = document.getElementById("uv-progress-fill");

  const uvIndex = data.value;
  
  const uvLevels = {
    low: {
      range: [0, 2],
      level: "Low",
      advice: "No protection required. You can safely stay outside.",
      color: "uv-low"
    },
    moderate: {
      range: [3, 5],
      level: "Moderate",
      advice: "Seek shade during midday hours. Wear sunscreen and protective clothing.",
      color: "uv-moderate"
    },
    high: {
      range: [6, 7],
      level: "High",
      advice: "Reduce time in the sun between 10 a.m. and 4 p.m. Wear protective clothing and sunscreen.",
      color: "uv-high"
    },
    veryHigh: {
      range: [8, 10],
      level: "Very High",
      advice: "Minimize sun exposure during midday hours. Protective measures are essential.",
      color: "uv-very-high"
    },
    extreme: {
      range: [11, 20],
      level: "Extreme",
      advice: "Avoid sun exposure during midday hours. Shirt, sunscreen, and hat are essential.",
      color: "uv-extreme"
    }
  };

  let uvCategory;
  if (uvIndex <= 2) uvCategory = uvLevels.low;
  else if (uvIndex <= 5) uvCategory = uvLevels.moderate;
  else if (uvIndex <= 7) uvCategory = uvLevels.high;
  else if (uvIndex <= 10) uvCategory = uvLevels.veryHigh;
  else uvCategory = uvLevels.extreme;

  uvValue.textContent = `UV Index: ${uvIndex}`;
  uvLevel.textContent = `Level: ${uvCategory.level}`;
  uvAdvice.textContent = uvCategory.advice;

  // Update progress bar
  uvProgressFill.className = uvCategory.color;
  uvProgressFill.style.width = `${(uvIndex / 11) * 100}%`;
}

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
  
  const airArr = data.list[0].components;

  const co = document.getElementById("co");
  const no = document.getElementById("no");
  const no2 = document.getElementById("no2");
  const o3 = document.getElementById("o3");
  const so2 = document.getElementById("so2");
  const pm2 = document.getElementById("pm2");
  const pm10 = document.getElementById("pm10");
  const nh3 = document.getElementById("nh3");

  co.innerText = `${airArr.co} ppm`;
  no.innerText = `${airArr.no} µg`;
  no2.innerText = `${airArr.no2} ppb`;
  o3.innerText = `${airArr.o3} µg`;
  so2.innerText = `${airArr.so2} ppb`;
  pm2.innerText = `${airArr.pm2_5} µg`;
  pm10.innerText = `${airArr.pm10} µg`;
  nh3.innerText = `${airArr.nh3} µg`;

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
  const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  Promise.all([
    fetch(weatherUrl).then(response => response.json()),
    fetch(forecastUrl).then(response => response.json()),
    fetch(aqiUrl).then(response => response.json()),
    fetch(uvUrl).then(response => response.json())
  ])
  .then(([weatherData, forecastData, aqiData, uvData]) => {
    sessionStorage.setItem("weatherData", JSON.stringify(weatherData));
    sessionStorage.setItem("forecastData", JSON.stringify(forecastData));
    sessionStorage.setItem("aqiData", JSON.stringify(aqiData));
    sessionStorage.setItem("uvData", JSON.stringify(uvData));
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

let selectedSuggestionIndex = -1;
if (cityInput) {
  cityInput.addEventListener('input', async function() {
    const query = cityInput.value.trim();

    clearTimeout(debounceTimeout);
    selectedSuggestionIndex = -1;
    debounceTimeout = setTimeout(async () => {
      if (query.length > 0) {
        const suggestions = await fetchCities(query);
        displaySuggestions(suggestions);
      } else {
        suggestionsBox.innerHTML = '';
      }
    }, 400);
  });

  cityInput.addEventListener('keydown' , (e) => {
    const suggestionItems = Array.from(suggestionsBox.children);
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      if (selectedSuggestionIndex < suggestionItems.length - 1) {
        selectedSuggestionIndex++;
      }else{
        selectedSuggestionIndex = 0;    //when user at last item and press down key it will  go to first item

      }
      updateSuggestionHighlight(suggestionItems);
    }else if(e.key === 'ArrowUp') {
      e.preventDefault();
      if(selectedSuggestionIndex >0){
        selectedSuggestionIndex--;
      }else{
        selectedSuggestionIndex = suggestionItems.length-1;  //when  user at first item and press up key it will go to last item
      }
      updateSuggestionHighlight(suggestionItems);
    } else if(e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      cityInput.value = suggestionItems[selectedSuggestionIndex].textContent;
      suggestionsBox.innerHTML = '';
      selectedSuggestionIndex = -1;
    }
  })
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
        selectedSuggestionIndex = -1;
      })
  });
}

function updateSuggestionHighlight(suggestionItems) {   //for visual effect of suggestion selection
  suggestionItems.forEach((item, index) => {
    if (index === selectedSuggestionIndex) {
      item.style.backgroundColor = '#f0f0f0';
      item.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.2)";
      item.style.transform = 'translateY(-2px)';
      cityInput.value = item.textContent;  
    } else {
      item.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      item.style.boxShadow = "";
      item.style.transform = 'translateY(0)';
    }
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
  let latitude, longitude;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("weatherData", JSON.stringify(data));
      // Store coordinates for subsequent API calls
      latitude = data.coord.lat;
      longitude = data.coord.lon;
      
      // Create promises for both AQI and UV index data
      const aqiPromise = fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
      const uvPromise = fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
      
      // Return both promises to be resolved
      return Promise.all([aqiPromise, uvPromise]);
    })
    .then(([aqiResponse, uvResponse]) => {
      // Convert both responses to JSON
      return Promise.all([aqiResponse.json(), uvResponse.json()]);
    })
    .then(([aqiData, uvData]) => {
      // Store both sets of data in sessionStorage
      sessionStorage.setItem("aqiData", JSON.stringify(aqiData));
      sessionStorage.setItem("uvData", JSON.stringify(uvData));
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
  const uvData = JSON.parse(sessionStorage.getItem("uvData"));

  console.log("Weather Data:", weatherData);
  console.log("Forecast Data:", forecastData);
  console.log("AQI Data:", aqiData);

  if (weatherData) {
    updateWeatherInfo(weatherData);
    loadWeatherMap(); 
  }

  if (forecastData && forecastData.list) {
    forecastInfo = forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 5); 
    populateForecastCards();
  }

  if (aqiData) {
    updateAQIInfo(aqiData);
  }

  if (uvData) {
    updateUVInfo(uvData);
  }
};

function degreesToDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}


function updateWindDirection(degrees) {
  const windDirectionIcon = document.getElementById('wind-direction-icon');
  const windDirectionText = document.getElementById('wind-direction-text');
  
  if (windDirectionIcon && windDirectionText) {
      windDirectionIcon.style.transform = `rotate(${degrees}deg)`;
      const direction = degreesToDirection(degrees);
      windDirectionText.textContent = `${direction} (${degrees}°)`;
  }
}

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
  updateWindDirection(data.wind.deg); 
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
    const iconSrc = getWeatherIconClass(forecast.weather[0].icon); 
    const mainSrc = getWeatherIconClass(forecast.weather[0].icon);

    const dayElem = card.querySelector('.day');
    const tempElem = card.querySelector('.temp');
    const iconElem = card.querySelector('.icon');
    const statusElem = card.querySelector('.status');
    const mainElem = document.querySelector(".icons");

    dayElem.textContent = day;
    tempElem.textContent = temperature;
    iconElem.src = iconSrc;
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
    "02n": "./images/cloud-sun.png",
    "03d": "./images/scatter-clouds.png",
    "03n": "./images/scatter-clouds.png", 
    "04d": "./images/partial-cloud.png",
    "04n": "./images/partial-cloud.png",
    "09d": "./images/shower-rain.png",
    "09n": "./images/shower-rain.png",
    "10d": "./images/rainy.png",
    "10n": "./images/rainy.png", 
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
