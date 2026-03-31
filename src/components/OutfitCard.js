import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getOutfitRecommendation } from '../utils/weatherUtils';

export default function OutfitCard({ tempMin, tempMax, windSpeed, aqiLevel }) {
  const { outfit, tips } = getOutfitRecommendation(tempMin, tempMax, windSpeed, aqiLevel);

  return (
    <View style={[styles.card, styles.outfitCard]}>
      <View style={styles.outfitHeader}>
        <Text style={styles.cardTitle}>👕 오늘의 추천 옷차림</Text>
      </View>
      <Text style={styles.outfitText}>{outfit}</Text>
      <View style={styles.tipsContainer}>
        {tips.map((tip, index) => (
          <Text key={index} style={styles.tipText}>• {tip}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  outfitCard: { paddingVertical: 28, paddingHorizontal: 24 },
  outfitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  outfitText: { fontSize: 19, color: '#374151', lineHeight: 28, fontWeight: '600' },
  tipsContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tipText: { fontSize: 15, color: '#4F46E5', fontWeight: '500', marginBottom: 4 },
});