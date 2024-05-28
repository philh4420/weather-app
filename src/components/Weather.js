import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Brightness4, Brightness7, Search } from '@mui/icons-material';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [city, setCity] = useState('');
  const [units, setUnits] = useState('metric');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const fetchWeatherDataByCity = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      const weatherAPIResponse = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHERAPI_KEY}&q=${city}&days=1&aqi=yes&alerts=yes`
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=${units}`
      );

      setWeatherData(weatherAPIResponse.data);
      setHourlyForecast(weatherAPIResponse.data.forecast.forecastday[0].hour);
      setForecastData(forecastResponse.data);
    } catch (error) {
      setError('Error fetching the weather data');
    }
    setLoading(false);
  }, [units]);

  const fetchWeatherDataByCoordinates = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    try {
      const weatherAPIResponse = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHERAPI_KEY}&q=${latitude},${longitude}&days=1&aqi=yes&alerts=yes`
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=${units}`
      );

      setWeatherData(weatherAPIResponse.data);
      setHourlyForecast(weatherAPIResponse.data.forecast.forecastday[0].hour);
      setForecastData(forecastResponse.data);
    } catch (error) {
      setError('Error fetching the weather data');
    }
    setLoading(false);
  }, [units]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherDataByCoordinates(latitude, longitude);
      }, () => {
        // Default to London if geolocation fails
        fetchWeatherDataByCity('London');
      });
    } else {
      // Default to London if geolocation is not available
      fetchWeatherDataByCity('London');
    }
  }, [fetchWeatherDataByCity, fetchWeatherDataByCoordinates]);

  const handleUnitsChange = (e) => {
    setUnits(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleCitySearch = () => {
    fetchWeatherDataByCity(city);
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const dailyForecasts = forecastData ? forecastData.list.filter(forecast => forecast.dt_txt.includes("12:00:00")) : [];

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Weather App
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container>
        <Box mt={4} mb={4} display="flex" justifyContent="center" alignItems="center">
          <TextField
            label="City"
            variant="outlined"
            value={city}
            onChange={handleCityChange}
            style={{ marginRight: 10 }}
          />
          <FormControl variant="outlined" style={{ marginLeft: 10 }}>
            <InputLabel id="units-label">Units</InputLabel>
            <Select
              labelId="units-label"
              value={units}
              onChange={handleUnitsChange}
              label="Units"
            >
              <MenuItem value="metric">Celsius</MenuItem>
              <MenuItem value="imperial">Fahrenheit</MenuItem>
            </Select>
          </FormControl>
          <Button style={{ marginLeft: 10 }}
            variant="contained"
            color="primary"
            onClick={handleCitySearch}
            startIcon={<Search />}
          >
            Search
          </Button>
        </Box>
        {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}
        {error && <Typography color="error" align="center">{error}</Typography>}
        {weatherData && (
          <Box mt={4} mb={4}>
            <Card style={{ marginBottom: 20 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>{weatherData.location.name}</Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <img src={weatherData.current.condition.icon} alt="Weather icon" style={{ marginRight: 10 }} />
                  <Typography variant="h5" gutterBottom>{weatherData.current.condition.text}</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Temperature</Typography>
                    <Typography variant="body2">{weatherData.current[`temp_${units === 'metric' ? 'c' : 'f'}`]} °{units === 'metric' ? 'C' : 'F'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Feels Like</Typography>
                    <Typography variant="body2">{weatherData.current[`feelslike_${units === 'metric' ? 'c' : 'f'}`]} °{units === 'metric' ? 'C' : 'F'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Humidity</Typography>
                    <Typography variant="body2">{weatherData.current.humidity} %</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Wind Speed</Typography>
                    <Typography variant="body2">{weatherData.current.wind_kph} kph</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Wind Direction</Typography>
                    <Typography variant="body2">{weatherData.current.wind_dir}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Pressure</Typography>
                    <Typography variant="body2">{weatherData.current.pressure_mb} mb</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Visibility</Typography>
                    <Typography variant="body2">{weatherData.current.vis_km} km</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">UV Index</Typography>
                    <Typography variant="body2">{weatherData.current.uv}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Air Quality Index</Typography>
                    <Typography variant="body2">{weatherData.current.air_quality['us-epa-index']}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Sunrise</Typography>
                    <Typography variant="body2">{weatherData.forecast.forecastday[0].astro.sunrise}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Sunset</Typography>
                    <Typography variant="body2">{weatherData.forecast.forecastday[0].astro.sunset}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Precipitation</Typography>
                    <Typography variant="body2">{weatherData.current.precip_mm} mm</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="body1">Dew Point</Typography>
                    <Typography variant="body2">{weatherData.current[`dewpoint_${units === 'metric' ? 'c' : 'f'}`]} °{units === 'metric' ? 'C' : 'F'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
        {hourlyForecast && (
          <Box mt={4} mb={4}>
            <Typography variant="h5" align="center">24-Hour Forecast</Typography>
            <Grid container spacing={2}>
              {hourlyForecast.map((hour, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography align="center">{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      <Box display="flex" justifyContent="center">
                        <img src={hour.condition.icon} alt="Weather icon" />
                      </Box>
                      <Typography align="center">{hour.condition.text}</Typography>
                      <Typography align="center">Temp: {hour[`temp_${units === 'metric' ? 'c' : 'f'}`]} °{units === 'metric' ? 'C' : 'F'}</Typography>
                      <Typography align="center">Precipitation: {hour.precip_mm} mm</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {forecastData && (
          <Box mt={4}>
            <Typography variant="h5" align="center">5-Day Forecast</Typography>
            <Grid container spacing={2}>
              {dailyForecasts.map((forecast, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography align="center">{new Date(forecast.dt * 1000).toLocaleDateString()}</Typography>
                      <Box display="flex" justifyContent="center">
                        <img src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} alt="Weather icon" />
                      </Box>
                      <Typography align="center">{forecast.weather[0].description}</Typography>
                      <Typography align="center">Temp: {forecast.main.temp} °{units === 'metric' ? 'C' : 'F'}</Typography>
                      <Typography align="center">Humidity: {forecast.main.humidity} %</Typography>
                      <Typography align="center">Wind Speed: {forecast.wind.speed} {units === 'metric' ? 'm/s' : 'mph'}</Typography>
                      <Typography align="center">Wind Direction: {forecast.wind.deg}°</Typography>
                      <Typography align="center">Pressure: {forecast.main.pressure} mb</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default Weather;
