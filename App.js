// App.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, StatusBar, 
  ActivityIndicator, FlatList, ScrollView, Image, TouchableOpacity 
} from 'react-native';
import * as Location from 'expo-location';

const API_KEY = 'ed096c7689a2dc5ed26fbcf37968a610';

export default function App() {
  const [temperature, setTemperature] = useState(null);
  const [tempMin, setTempMin] = useState(null);
  const [tempMax, setTempMax] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [weatherDesc, setWeatherDesc] = useState(null);
  const [windSpeed, setWindSpeed] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [aqiLevel, setAqiLevel] = useState(null);
  const [forecast, setForecast] = useState([]);
  
  const [locationName, setLocationName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('날씨 정보를 준비하고 있어요...');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);
    setDisplayMessage('위치 정보를 불러오는 중입니다...');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDisplayMessage('위치 권한이 거부되었습니다.\n설정에서 기기의 위치 권한을 허용해주세요.');
        setHasError(true);
        setIsLoading(false);
        return;
      }

      setDisplayMessage('오늘의 날씨를 예쁘게 그리고 있어요...');
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const addressArray = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressArray.length > 0) {
        const addr = addressArray[0];
        const city = addr.city || addr.region || '';
        const district = addr.street || addr.district || addr.name || '';
        
        const combinedName = `${city} ${district}`.trim();
        setLocationName(combinedName !== '' ? combinedName : '웹 브라우저 (위치 테스트)');
      } else {
        setLocationName('웹 브라우저 (위치 테스트)');
      }

      await getWeatherAndAir(latitude, longitude);
    } catch (error) {
      console.error('위치 에러:', error);
      setDisplayMessage('위치 정보를 가져오는데 실패했습니다.\nGPS가 켜져 있는지 확인해주세요.');
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getWeatherAndAir = async (lat, lon) => {
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
      const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
      
      const [weatherRes, airRes, forecastRes] = await Promise.all([
        fetch(weatherUrl), fetch(airUrl), fetch(forecastUrl)
      ]);

      if (weatherRes.ok && airRes.ok && forecastRes.ok) {
        const weatherData = await weatherRes.json();
        const airData = await airRes.json();
        const forecastData = await forecastRes.json();

        setTemperature(weatherData.main.temp);
        setWeatherIcon(weatherData.weather[0].icon);
        setWeatherDesc(weatherData.weather[0].description);
        setWindSpeed(weatherData.wind.speed);
        
        const aqi = airData.list[0].main.aqi;
        setAqiLevel(aqi);
        setAirQuality(getAqiKorean(aqi));

        const todayDateString = forecastData.list[0].dt_txt.split(' ')[0];
        let calcMin = weatherData.main.temp;
        let calcMax = weatherData.main.temp;

        forecastData.list.forEach((item) => {
          if (item.dt_txt.startsWith(todayDateString)) {
            calcMin = Math.min(calcMin, item.main.temp_min);
            calcMax = Math.max(calcMax, item.main.temp_max);
          }
        });

        setTempMin(calcMin);
        setTempMax(calcMax);

        const dailyForecast = processForecastData(forecastData.list);
        setForecast(dailyForecast);
        setHasError(false);
      } else {
        setDisplayMessage('날씨 데이터를 가져올 수 없습니다.\n잠시 후 다시 시도해주세요.');
        setHasError(true);
      }
    } catch (error) {
      console.error('네트워크 에러:', error);
      setDisplayMessage('네트워크에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getAqiKorean = (aqi) => {
    switch (aqi) {
      case 1: return '최고 좋음 🔵';
      case 2: return '좋음 🟢';
      case 3: return '보통 🟡';
      case 4: return '나쁨 🟠';
      case 5: return '매우 나쁨 🔴';
      default: return '알 수 없음';
    }
  };

  // 🌟 기온별 기본 옷차림을 반환하는 도우미 함수 🌟
  const getClothesString = (temp) => {
    if (temp >= 28) return '민소매나 얇은 반팔';
    if (temp >= 23) return '가벼운 반팔이나 얇은 셔츠';
    if (temp >= 20) return '얇은 긴팔이나 맨투맨';
    if (temp >= 17) return '얇은 니트나 가디건';
    if (temp >= 12) return '도톰한 자켓이나 가디건';
    if (temp >= 9) return '트렌치코트나 야상';
    if (temp >= 5) return '따뜻한 코트나 가죽자켓';
    return '두꺼운 패딩과 목도리';
  };

  // 🌟 핵심 로직: 일교차(최고기온 - 최저기온)를 계산하여 스마트하게 추천 🌟
  const getOutfitRecommendation = (min, max, wind, aqi) => {
    let outfit = '';
    let tips = [];
    
    // 하루 일교차 계산
    const tempDiff = max - min;

    // 1. 일교차가 8도 이상으로 클 때 (입고 벗기 편한 옷 추천)
    if (tempDiff >= 8) {
      outfit = `낮에는 [${getClothesString(max)}], 아침저녁엔 [${getClothesString(min)}] 어때요?`;
      tips.push('일교차가 커요! 입고 벗기 편한 겉옷을 챙겨 체온을 조절하세요 🧥');
    } 
    // 2. 일교차가 크지 않을 때 (최고 기온 위주로 단일 추천)
    else {
      outfit = `오늘은 하루 종일 [${getClothesString(max)}] 위주의 옷차림을 추천해요.`;
    }

    // 3. 바람과 미세먼지 추가 조언
    if (wind >= 5) tips.push('바람이 제법 불어요. 체감 온도가 낮으니 참고하세요 🌬️');
    if (aqi >= 4) tips.push('미세먼지가 탁해요. 외출 시 마스크를 꼭 챙기세요 😷');

    return { outfit, tips };
  };

  const processForecastData = (list) => {
    const dailyData = {};
    list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0]; 
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          icon: item.weather[0].icon,
        };
      } else {
        dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp_min);
        dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp_max);
      }
    });
    return Object.values(dailyData).slice(1, 6);
  };

  const formatDay = (dateString) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${minutes}`;
  };

  const renderForecastItem = ({ item }) => (
    <View style={styles.forecastCard}>
      <Text style={styles.forecastDate}>{formatDay(item.date)}</Text>
      <Image 
        source={{ uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png` }} 
        style={styles.forecastIcon} 
      />
      <View style={styles.minMaxContainer}>
        <Text style={styles.maxTemp}>{Math.round(item.maxTemp)}°</Text>
        <Text style={styles.minTemp}>{Math.round(item.minTemp)}°</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.appTitle}>Weather & Outfit</Text>
      </View>

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

      {/* tempMin과 tempMax가 모두 로드되었는지 확인하는 조건 추가 */}
      {!isLoading && !hasError && temperature !== null && tempMin !== null && tempMax !== null && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            
            <View style={[styles.card, styles.heroCard]}>
              <View style={styles.locationBadge}>
                <Text style={styles.locationText}>📍 {locationName}</Text>
              </View>

              <Text style={styles.timeWeatherText}>
                {formatTime(currentTime)} · {weatherDesc}
              </Text>

              <View style={styles.heroMain}>
                <Image 
                  source={{ uri: `https://openweathermap.org/img/wn/${weatherIcon}@4x.png` }} 
                  style={styles.heroIcon} 
                />
                <Text style={styles.tempText}>{Math.round(temperature)}°</Text>
              </View>

              <View style={styles.todayMinMaxContainer}>
                <Text style={styles.todayMinMaxText}>
                  최고 {Math.round(tempMax)}°  /  최저 {Math.round(tempMin)}°
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.detailLabel}>미세먼지</Text>
                <Text style={styles.detailValue}>{airQuality}</Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.detailLabel}>바람 세기</Text>
                <Text style={styles.detailValue}>{windSpeed} m/s</Text>
              </View>
            </View>

            <View style={[styles.card, styles.outfitCard]}>
              <View style={styles.outfitHeader}>
                <Text style={styles.cardTitle}>👕 오늘의 추천 옷차림</Text>
              </View>
              
              {/* 🌟 현재 기온이 아닌 최고/최저 기온을 넘겨주어 로직 실행 🌟 */}
              <Text style={styles.outfitText}>
                {getOutfitRecommendation(tempMin, tempMax, windSpeed, aqiLevel).outfit}
              </Text>
              <View style={styles.tipsContainer}>
                {getOutfitRecommendation(tempMin, tempMax, windSpeed, aqiLevel).tips.map((tip, index) => (
                  <Text key={index} style={styles.tipText}>• {tip}</Text>
                ))}
              </View>
            </View>

            <View style={styles.forecastSection}>
              <Text style={styles.sectionTitle}>주간 예보</Text>
              <FlatList
                data={forecast}
                keyExtractor={(item) => item.date}
                renderItem={renderForecastItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.forecastList}
              />
            </View>

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// 스타일 코드는 이전과 동일하게 유지됩니다.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  appTitle: { fontSize: 24, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  loadingText: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '500' },
  
  errorIcon: { fontSize: 50, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  retryButton: {
    backgroundColor: '#4F46E5', paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 12, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  mainContent: { width: '100%' },
  
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },

  heroCard: { paddingTop: 24, paddingBottom: 30, alignItems: 'center' },
  locationBadge: { backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginBottom: 12 },
  locationText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  timeWeatherText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginBottom: 5 },
  heroMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  heroIcon: { width: 110, height: 110, marginRight: 10 },
  tempText: { fontSize: 72, fontWeight: '900', color: '#111827', letterSpacing: -3, lineHeight: 80 },
  todayMinMaxContainer: { marginTop: 5, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', width: '80%', alignItems: 'center' },
  todayMinMaxText: { fontSize: 15, fontWeight: '600', color: '#9CA3AF' },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 16 },
  halfCard: { flex: 1, marginBottom: 0, alignItems: 'center', padding: 20 },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginBottom: 8 },
  detailValue: { fontSize: 18, color: '#111827', fontWeight: '800' },

  outfitCard: { paddingVertical: 28 },
  outfitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  outfitText: { fontSize: 19, color: '#374151', lineHeight: 28, fontWeight: '600' },
  tipsContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tipText: { fontSize: 15, color: '#4F46E5', fontWeight: '500', marginBottom: 4 },

  forecastSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16, marginLeft: 4 },
  forecastList: { paddingBottom: 20, paddingRight: 20 },
  forecastCard: {
    backgroundColor: '#FFFFFF', paddingVertical: 20, paddingHorizontal: 16,
    borderRadius: 20, alignItems: 'center', marginRight: 12, width: 90,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  forecastDate: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginBottom: 8 },
  forecastIcon: { width: 50, height: 50, marginBottom: 8 },
  minMaxContainer: { flexDirection: 'column', alignItems: 'center', gap: 2 },
  maxTemp: { fontSize: 16, fontWeight: '800', color: '#111827' },
  minTemp: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
});