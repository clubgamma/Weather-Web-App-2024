const data = JSON.parse(sessionStorage.getItem("forecastData")).list;

if (data) {
  (async function () {
    new Chart(document.getElementById("myChart"), {
      type: "line",
      data: {
        labels: data.map((row) => row.dt_txt),
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
