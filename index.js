window.addEventListener('load', () => {
    const apiKey = '5351bad9138c4a3895229aae6c2d7bbc';  // OpenWeatherMap API key
    const weatherContainer = document.querySelector('.weather-container');
    const locationElement = document.getElementById('location');
    const tempElement = document.getElementById('temperature');
    const descElement = document.getElementById('description');
    const iconElement = document.getElementById('weather-icon');
    const errorElement = document.getElementById('error');
    const bodyElement = document.body; 
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    if (navigator.geolocation) {
        //  current location  by default
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoordinates(lat, lon);
        }, () => {
            errorElement.textContent = 'Unable to retrieve your location. Please allow location access.';
        });
    } else {
        errorElement.textContent = 'Geolocation is not supported by your browser.';
    }

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value;
        if (city) {
            getWeatherByCity(city);
        } else {
            errorElement.textContent = 'Please enter a city name.';
        }
    });

    // Function to fetch weather by coordinates
    function getWeatherByCoordinates(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        fetchWeatherData(url);
    }

    // Function  (for searched location)
    function getWeatherByCity(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        fetchWeatherData(url);
    }

    function fetchWeatherData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const temp = data.main.temp;
                const locationName = data.name;
                const description = data.weather[0].description;
                const iconCode = data.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

                locationElement.textContent = locationName;
                tempElement.textContent = `Temperature: ${temp}°C`;
                descElement.textContent = description.charAt(0).toUpperCase() + description.slice(1);
                iconElement.src = iconUrl;

                const mainWeather = data.weather[0].main.toLowerCase();
                changeBackground(mainWeather);

                errorElement.textContent = ''; 
            })
            .catch(error => {
                errorElement.textContent = 'Error fetching weather data. Please try again later.';
                console.error('Error:', error);
            });
    }

    function changeBackground(weatherCondition) {
        switch (weatherCondition) {
            case 'clear':
                bodyElement.style.backgroundImage = "url('https://tse2.mm.bing.net/th?id=OIP.YYYhW_qvySbr5FWKUrSyzQAAAA&pid=Api&P=0&h=180')";
                break;
            case 'clouds':
                bodyElement.style.backgroundImage = "url('https://tse3.mm.bing.net/th?id=OIP.8wJFmKZHwyL8CjhLQ_q22QHaE8&pid=Api&P=0&h=180')";
                break;
            case 'rain':
                bodyElement.style.backgroundImage = "url('https://tse4.mm.bing.net/th?id=OIP.LCkB6oj4G4jJgFd6GjYmTgHaDe&pid=Api&P=0&h=180')";
                break;
            case 'snow':
                bodyElement.style.backgroundImage = "url('https://tse2.mm.bing.net/th?id=OIP._PkwMKZuWcQiKF4O3BbuyAHaE7&pid=Api&P=0&h=180')";
                break;
            case 'thunderstorm':
                bodyElement.style.backgroundImage = "url('images/thunderstorm.jpg')";
                break;
            case 'drizzle':
                bodyElement.style.backgroundImage = "url('https://tse4.mm.bing.net/th?id=OIP.YE-47X44XPE-2uQdl-f0ywHaEL&pid=Api&P=0&h=180')";
                break;
            case 'mist':
                bodyElement.style.backgroundImage = "url('https://tse3.mm.bing.net/th?id=OIP.KHsC6kM4KAESeVDKf3BW_AHaDT&pid=Api&P=0&h=180')";
                break;

            case 'fog':
                bodyElement.style.backgroundImage = "url('https://tse4.mm.bing.net/th?id=OIP.RH8eon52neEvcbS4KDLT8AHaE6&pid=Api&P=0&h=180')";
                break;
            case 'haze':
                 bodyElement.style.backgroundImage = "url('https://tse1.mm.bing.net/th?id=OIP.Sro__9yD7VN9CSGPVOl25gHaE8&pid=Api&P=0&h=180')";
                break;    

            default:
                bodyElement.style.backgroundImage = "url('https://tse4.mm.bing.net/th?id=OIP.SiNgaO8UidvAHb0tc4SrjgHaHa&pid=Api&P=0&h=180')";
                break;
        }
        bodyElement.style.backgroundSize = "cover";  
    }
});
