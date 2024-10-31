let map;
let weatherLayer;
// const apiKey = "91181b4ccb7f36e6b27aefa8bb9b5624"; // Replace with your API key

function initMap(lat, lon) {
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 6
        })
    });

    updateWeatherLayer('temp');

    document.getElementById('map-layer').addEventListener('change', function() {
        updateWeatherLayer(this.value);
    });
}

function updateWeatherLayer(layerType) {
    if (weatherLayer) {
        map.removeLayer(weatherLayer);
    }

    weatherLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: `https://tile.openweathermap.org/map/${layerType}/{z}/{x}/{y}.png?appid=${apiKey}`,
            attributions: ['Weather data © OpenWeatherMap']
        })
    });

    map.addLayer(weatherLayer);
}

// Call this function when the weather data is loaded
function loadWeatherMap() {
    const weatherData = JSON.parse(sessionStorage.getItem("weatherData"));
    if (weatherData && weatherData.coord) {
        initMap(weatherData.coord.lat, weatherData.coord.lon);
    }
}