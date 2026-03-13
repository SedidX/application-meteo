import { useState, useEffect } from "react";

import { MainCard } from "../components/MainCard";
import { ContentBox } from "../components/ContentBox";
import { Header } from "../components/Header";
import { DateAndTime } from "../components/DateAndTime";
import { MetricsBox } from "../components/MetricsBox";
import { UnitSwitch } from "../components/UnitSwitch";
import { LoadingScreen } from "../components/LoadingScreen";
import { ErrorScreen } from "../components/ErrorScreen";

import styles from "../styles/Home.module.css";

export const App = () => {
  const [weatherData, setWeatherData] = useState();
  const [unitSystem, setUnitSystem] = useState("metric");
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    try {
      // Requête GET — la ville est lue côté serveur depuis config/city.json
      const res = await fetch("api/data");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setError(null);
        setWeatherData(data);
      }
    } catch (err) {
      setError("Failed to reach the weather service.");
    }
  };

  useEffect(() => {
    // Récupération initiale des données météo
    fetchWeather();

    // Rafraîchissement toutes les heures (3 600 000 ms)
    const interval = setInterval(fetchWeather, 3_600_000);
    return () => clearInterval(interval);
  }, []);

  const changeSystem = () =>
    unitSystem === "metric"
      ? setUnitSystem("imperial")
      : setUnitSystem("metric");

  if (error) {
    return <ErrorScreen errorMessage={error} />;
  }

  if (!weatherData) {
    return <LoadingScreen loadingMessage="Loading weather data..." />;
  }

  return (
    <div className={styles.wrapper}>
      <MainCard
        city={weatherData.name}
        country={weatherData.sys.country}
        description={weatherData.weather[0].description}
        iconName={weatherData.weather[0].icon}
        unitSystem={unitSystem}
        weatherData={weatherData}
      />
      <ContentBox>
        <Header>
          <DateAndTime weatherData={weatherData} unitSystem={unitSystem} />
        </Header>
        <MetricsBox weatherData={weatherData} unitSystem={unitSystem} />
        <UnitSwitch onClick={changeSystem} unitSystem={unitSystem} />
      </ContentBox>
    </div>
  );
};

export default App;

