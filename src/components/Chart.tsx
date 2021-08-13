import React, { useEffect, useState } from "react";
// @ts-ignore
import Chart from "react-apexcharts";

type SleepDurationAPIResponse = Array<{
  _id: number;
  data: string;
  device_id: string;
  timestamp: number;
}>;

type SleepData = {
  serie: number[];
  dates: string[];
};

const SleepChart = () => {
  const [sleepData, setSleepData] = useState<SleepData>({
    serie: [],
    dates: [],
  });

  const [dateRange, setDateRange] = useState({
    initialDate: new Date("02/01/2021"),
    endDate: new Date("02/07/2021"),
  });

  useEffect(() => {
    async function fetchSleepTime() {
      let response = await fetch(
        "http://prod.kaisens.fr:811/api/sleep/?amp=&amp=&deviceid=93debd97-6564-454b-be33-35bd377a2563&enddate=1614729600000&format=json&startdate=1612310400000"
      );
      const result: SleepDurationAPIResponse = await response.json();

      // récupérer seulement les 100 derniers résultats
      const data: SleepData = result
        .filter(({ timestamp }) => {
          // console.log(timestamp);

          return (
            timestamp >= dateRange.initialDate.getTime() &&
            timestamp <= dateRange.endDate.getTime()
          );
        })
        .sort((a, b) => {
          return a.timestamp - b.timestamp;
        })
        .reduce(
          (acc, response) => {
            const { data, timestamp } = response;

            const { sleep_duration }: { sleep_duration: number } = JSON.parse(
              data.replaceAll("'", '"')
            );

            const date = new Date(timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return {
              serie: [...acc.serie, sleep_duration],
              dates: [...acc.dates, date],
            };
          },
          { serie: [], dates: [] }
        );

      setSleepData((oldData) => {
        return data;
      });
    }

    fetchSleepTime();
  }, [dateRange]);

  const options = getChartOptions(sleepData.dates);

  const sleepSerie = sleepData.serie ?? [];

  const lastNightSleepDuration = sleepSerie[sleepSerie.length - 1];
  const averageSleepDuration =
    sleepSerie.reduce((acc, curValue) => acc + curValue, 0) / sleepSerie.length;

  const dateBegin = formatDate(dateRange.initialDate);
  const dateEnd = formatDate(dateRange.endDate);

  return (
    <>
      <div className="container">
        <h1>Sleep Charts</h1>
        <div className="bg-danger">
          <Chart
            // @ts-ignore
            options={options}
            type="bar"
            series={[
              {
                name: "Sleep Duration",
                data: sleepSerie,
              },
            ]}
            height={320}
          />
        </div>
        <div className="mb-3">
          <div className="row">
            <div className="col-6">
              <label htmlFor="dateBegin" className="form-label">
                From :
              </label>
              <input
                defaultValue={dateBegin}
                type="date"
                className="form-control"
                id="dateBegin"
                onChange={(ev) => {
                  setDateRange((oldRange) => ({
                    ...oldRange,
                    initialDate: new Date(ev.target.value),
                  }));
                }}
              />
            </div>

            <div className="col-6">
              <label htmlFor="dateEnd" className="form-label">
                To :
              </label>
              <input
                type="date"
                defaultValue={dateEnd}
                className="form-control"
                id="dateEnd"
                onChange={(ev) => {
                  setDateRange((oldRange) => ({
                    ...oldRange,
                    endDate: new Date(ev.target.value),
                  }));
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <small>
            Last Night Sleep Duration : <b>{lastNightSleepDuration} Hours</b>
          </small>
          <br />
          <small>
            Average Sleep Duration :{" "}
            <b>{averageSleepDuration.toFixed(2)} Hours</b>
          </small>
        </div>
      </div>
    </>
  );
};

export default SleepChart;

function formatDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getChartOptions(categories: string[]) {
  const options = {
    chart: {
      type: "bar",
      height: "200px",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: ["70%"],
        endingShape: "rounded",
      },
    },
    legend: {
      show: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      labels: {
        show: false,
        style: {
          colors: "#B5B5C3",
          fontSize: "12px",
          fontFamily: "Poppins",
        },
      },
    },
    yaxis: {
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      min: 0,
      max: 15,
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
          fontFamily: "Poppins",
        },
      },
    },
    fill: {
      type: ["solid"],
      opacity: [0.75],
    },
    states: {
      normal: {
        filter: {
          type: "none",
          value: 0,
        },
      },
      hover: {
        filter: {
          type: "none",
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: true,
        filter: {
          type: "none",
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: "Poppins",
      },
      y: {
        formatter: function (val: number) {
          return `${val} hours`;
        },
      },
      marker: {
        show: false,
      },
    },
    colors: ["#ffffff"],
    grid: {
      borderColor: "#ECF0F3",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        left: 20,
        right: 20,
      },
    },
  };
  return options;
}
