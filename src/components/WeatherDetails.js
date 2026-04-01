// src/components/WeatherDetails.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeatherDetails({ airQuality, humidity, windSpeed }) {
  return (
    <View style={styles.detailsRow}>
      <View style={[styles.card, styles.detailCard]}>
        <Text style={styles.detailLabel}>미세먼지</Text>
        <Text style={styles.detailValue}>{airQuality}</Text>
      </View>
      <View style={[styles.card, styles.detailCard]}>
        <Text style={styles.detailLabel}>습도</Text>
        {/* 🌟 습도 데이터 출력 */}
        <Text style={styles.detailValue}>{humidity}%</Text>
      </View>
      <View style={[styles.card, styles.detailCard]}>
        <Text style={styles.detailLabel}>풍속</Text>
        <Text style={styles.detailValue}>{windSpeed}m/s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 16 },
  detailCard: { flex: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 5 },
  detailLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 6 },
  detailValue: { fontSize: 16, color: '#111827', fontWeight: '800' },
});