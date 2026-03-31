import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatTime, formatDate } from '../utils/weatherUtils'; // 🌟 formatDate 추가

export default function WeatherHero({ locationName, currentTime, weatherDesc, weatherIcon, temperature, tempMax, tempMin, feelsLike }) {
  return (
    <View style={[styles.card, styles.heroCard]}>
      <View style={styles.locationBadge}>
        <Text style={styles.locationText}>📍 {locationName}</Text>
      </View>
      
      {/* 🌟 날짜 - 시간 - 날씨 상태 형태로 변경 */}
      <Text style={styles.timeWeatherText}>
        {formatDate(currentTime)} - {formatTime(currentTime)} - {weatherDesc}
      </Text>
      
      <View style={styles.heroMain}>
        <Image source={{ uri: `https://openweathermap.org/img/wn/${weatherIcon}@4x.png` }} style={styles.heroIcon} />
        <View style={styles.tempWrapper}>
          <Text style={styles.tempText}>{Math.round(temperature)}°</Text>
          {/* 🌟 체감 온도 추가 */}
          <Text style={styles.feelsLikeText}>체감 {Math.round(feelsLike)}°</Text>
        </View>
      </View>
      
      <View style={styles.todayMinMaxContainer}>
        <Text style={styles.todayMinMaxText}>
          최고 {Math.round(tempMax)}°  /  최저 {Math.round(tempMin)}°
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  heroCard: { paddingTop: 24, paddingBottom: 30, alignItems: 'center' },
  locationBadge: { backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginBottom: 12 },
  locationText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
  timeWeatherText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 5 }, // 폰트 사이즈 살짝 조정
  heroMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  heroIcon: { width: 110, height: 110, marginRight: 5 },
  tempWrapper: { alignItems: 'center', marginLeft: 5 }, // 🌟 온도와 체감 온도를 묶어주는 래퍼
  tempText: { fontSize: 72, fontWeight: '900', color: '#111827', letterSpacing: -3, lineHeight: 80 },
  feelsLikeText: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginTop: -5 }, // 🌟 체감 온도 스타일 (인디고 색상 포인트)
  todayMinMaxContainer: { marginTop: 15, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', width: '80%', alignItems: 'center' },
  todayMinMaxText: { fontSize: 15, fontWeight: '600', color: '#9CA3AF' },
});