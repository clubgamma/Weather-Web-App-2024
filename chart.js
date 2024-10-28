const data = JSON.parse(sessionStorage.getItem("forecastData")).list;

function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

if (data) {
  (async function () {
    new Chart(document.getElementById("myChart"), {
      type: "line",
      data: {
        labels: data.map((row) => getDayName(row.dt_txt.slice(0, 10))),
        datasets: [
          {
            label: "Temp ",
            data: data.map((row) => row.main.temp),
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 50,
          },
        },
      },
    });
  })();
}
