document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherData = document.getElementById('weather-data');

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeatherData(city);
            }
        }
    });

    function fetchWeatherData(city) {
        // Here you would typically make an API call to get weather data
        // For this example, we'll just show the weather data div
        weatherData.classList.remove('hidden');
        setTimeout(() => {
            weatherData.classList.add('visible');
        }, 10);

        // Update city name and date
        document.getElementById('city-name').textContent = city;
        updateCurrentDate();

        // Populate weather info
        // This is where you would update the weather, forecast, and rain/humidity info
        // based on the API response
    }

    function updateCurrentDate() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        const dayName = days[now.getDay()];
        const dateString = now.toLocaleDateString(); // This will give you the date in the local format
        
        document.getElementById('current-date').textContent = `${dayName}, ${dateString}`;
    }
});
