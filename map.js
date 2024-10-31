const currPos = JSON.parse(sessionStorage.getItem("currPos"));

if (currPos) {
  var map = L.map("map").setView([currPos.lat, currPos.lon], 6);

  const tempLayer = L.tileLayer(
    `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=91181b4ccb7f36e6b27aefa8bb9b5624`,
    {
      maxZoom: 5,
      attribution: "Weather.io",
    }
  );

  tempLayer.addTo(map);
}
