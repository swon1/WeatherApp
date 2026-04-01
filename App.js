import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

import WeatherHero from './src/components/WeatherHero';
import TodayGraph from './src/components/TodayGraph'; // 🌟 1. 새 그래프 컴포넌트 불러오기
import WeatherDetails from './src/components/WeatherDetails';
import OutfitCard from './src/components/OutfitCard';
import ForecastSection from './src/components/ForecastSection';
import { getAqiKorean, processForecastData, processHourlyData } from './src/utils/weatherUtils'; // 🌟 2. 새 함수 불러오기

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

export default function App() {
  const [weatherData, setWeatherData] = useState({
    temperature: null, tempMin: null, tempMax: null, weatherIcon: null, weatherDesc: null, windSpeed: null,
    feelsLike: null,
    humidity: null // 🌟 습도 상태 추가
  });
  const [airData, setAirData] = useState({ airQuality: null, aqiLevel: null });
  const [forecast, setForecast] = useState([]);
  const [hourlyData, setHourlyData] = useState([]); // 🌟 시간대별 데이터 상태 추가
  
  const [locationName, setLocationName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('날씨 정보를 준비하고 있어요...');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setIsLoading(true); setHasError(false); setDisplayMessage('위치 정보를 불러오는 중입니다...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission denied');
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const addressArray = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressArray.length > 0) {
        const addr = addressArray[0];
        const combinedName = `${addr.city || addr.region || ''} ${addr.street || addr.district || addr.name || ''}`.trim();
        setLocationName(combinedName !== '' ? combinedName : '웹 브라우저 (위치 테스트)');
      } else {
        setLocationName('웹 브라우저 (위치 테스트)');
      }
      await getWeatherAndAir(latitude, longitude);
    } catch (error) {
      setDisplayMessage('위치나 네트워크 정보를 가져오는데 실패했습니다.');
      setHasError(true); setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getWeatherAndAir = async (lat, lon) => {
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
      const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
      
      const [weatherRes, airRes, forecastRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl), fetch(forecastUrl)]);

      if (weatherRes.ok && airRes.ok && forecastRes.ok) {
        const weatherJson = await weatherRes.json();
        const airJson = await airRes.json();
        const forecastJson = await forecastRes.json();

        const todayDateString = forecastJson.list[0].dt_txt.split(' ')[0];
        let calcMin = weatherJson.main.temp, calcMax = weatherJson.main.temp;
        forecastJson.list.forEach((item) => {
          if (item.dt_txt.startsWith(todayDateString)) {
            calcMin = Math.min(calcMin, item.main.temp_min);
            calcMax = Math.max(calcMax, item.main.temp_max);
          }
        });

        setWeatherData({
          temperature: weatherJson.main.temp, tempMin: calcMin, tempMax: calcMax,
          weatherIcon: weatherJson.weather[0].icon, weatherDesc: weatherJson.weather[0].description,
          windSpeed: weatherJson.wind.speed, feelsLike: weatherJson.main.feels_like,
          humidity: weatherJson.main.humidity // 🌟 습도 데이터 추출
        });
        
        setAirData({
          aqiLevel: airJson.list[0].main.aqi, airQuality: getAqiKorean(airJson.list[0].main.aqi)
        });
        
        setForecast(processForecastData(forecastJson.list));
        setHourlyData(processHourlyData(forecastJson.list)); // 🌟 시간대별 데이터 추출 및 세팅
        
        setHasError(false);
      } else throw new Error('API Error');
    } catch (error) {
      setDisplayMessage('데이터를 가져올 수 없습니다. 다시 시도해주세요.');
      setHasError(true);
    } finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}><Text style={styles.appTitle}>Weather & Outfit</Text></View>

      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>{displayMessage}</Text>
        </View>
      )}

      {!isLoading && hasError && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{displayMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>다시 시도하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !hasError && weatherData.temperature !== null && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            
            <WeatherHero 
              locationName={locationName} currentTime={currentTime} weatherDesc={weatherData.weatherDesc}
              weatherIcon={weatherData.weatherIcon} temperature={weatherData.temperature} 
              tempMax={weatherData.tempMax} tempMin={weatherData.tempMin} feelsLike={weatherData.feelsLike}
            />
            
            {/* 🌟 3. 요청하신 위치(메인 카드와 디테일 사이)에 그래프 배치! */}
            <TodayGraph hourlyData={hourlyData} />
            
            {/* 🌟 4. 습도가 포함된 디테일 카드 */}
            <WeatherDetails airQuality={airData.airQuality} humidity={weatherData.humidity} windSpeed={weatherData.windSpeed} />
            
            <OutfitCard 
              tempMin={weatherData.tempMin} tempMax={weatherData.tempMax} 
              windSpeed={weatherData.windSpeed} aqiLevel={airData.aqiLevel} 
            />
            
            <ForecastSection forecast={forecast} />

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  appTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  loadingText: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '500' },
  errorIcon: { fontSize: 50, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  retryButton: { backgroundColor: '#4F46E5', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  mainContent: { width: '100%' },
});