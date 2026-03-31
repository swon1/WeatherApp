import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { formatDay } from '../utils/weatherUtils';

export default function ForecastSection({ forecast }) {
  const renderForecastItem = ({ item }) => (
    <View style={styles.forecastCard}>
      <Text style={styles.forecastDate}>{formatDay(item.date)}</Text>
      <Image source={{ uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png` }} style={styles.forecastIcon} />
      <View style={styles.minMaxContainer}>
        <Text style={styles.maxTemp}>{Math.round(item.maxTemp)}°</Text>
        <Text style={styles.minTemp}>{Math.round(item.minTemp)}°</Text>
      </View>
    </View>
  );

  return (
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
  );
}

const styles = StyleSheet.create({
  forecastSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16, marginLeft: 4 },
  forecastList: { paddingBottom: 20, paddingRight: 20 },
  forecastCard: { backgroundColor: '#FFFFFF', paddingVertical: 20, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', marginRight: 12, width: 90, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  forecastDate: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginBottom: 8 },
  forecastIcon: { width: 50, height: 50, marginBottom: 8 },
  minMaxContainer: { flexDirection: 'column', alignItems: 'center', gap: 2 },
  maxTemp: { fontSize: 16, fontWeight: '800', color: '#111827' },
  minTemp: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
});