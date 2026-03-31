import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeatherDetails({ airQuality, windSpeed }) {
  return (
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
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 16 },
  halfCard: { flex: 1, marginBottom: 0, alignItems: 'center', padding: 20 },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginBottom: 8 },
  detailValue: { fontSize: 18, color: '#111827', fontWeight: '800' },
});