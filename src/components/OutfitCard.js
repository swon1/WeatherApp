// src/components/OutfitCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getOutfitRecommendation } from '../utils/weatherUtils';

export default function OutfitCard({ tempMin, tempMax, windSpeed, aqiLevel }) {
  // 🌟 icons 배열도 함께 받아오기
  const { outfit, tips, icons } = getOutfitRecommendation(tempMin, tempMax, windSpeed, aqiLevel);

  return (
    <View style={[styles.card, styles.outfitCard]}>
      <View style={styles.outfitHeader}>
        <Text style={styles.cardTitle}>👕 오늘의 추천 옷차림</Text>
      </View>
      
      <Text style={styles.outfitText}>{outfit}</Text>
      
      {/* 🌟 아이콘을 예쁘게 보여주는 시각화 영역 추가 */}
      <View style={styles.iconContainer}>
        {icons.map((icon, index) => (
          <View key={index} style={styles.iconCircle}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        ))}
      </View>

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
  outfitText: { fontSize: 17, color: '#374151', lineHeight: 28, fontWeight: '600' },
  
  // 🌟 시각화 아이콘 영역 스타일
  iconContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 16, 
    marginTop: 24, 
    marginBottom: 8 
  },
  iconCircle: { 
    width: 60, 
    height: 60, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 30, // 완벽한 원형
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  iconText: { fontSize: 32 }, // 이모지 크기를 큼직하게
  
  tipsContainer: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tipText: { fontSize: 14, color: '#4F46E5', fontWeight: '500', marginBottom: 6, lineHeight: 20 },
});