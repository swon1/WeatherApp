// src/components/TodayGraph.js

import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';

export default function TodayGraph({ hourlyData }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  const temps = hourlyData.map(d => d.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempDiff = maxTemp - minTemp || 1;

  return (
    <View style={styles.card}>
      {/* 🌟 제목 수정 */}
      <Text style={styles.title}>📈 시간대별 날씨</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.graphContainer}>
        {hourlyData.map((item, index) => {
          const heightPercentage = ((item.temp - minTemp) / tempDiff) * 70 + 30;

          // 🌟 내일 자정(0시)이거나, 앱을 밤늦게 켜서 첫 데이터가 내일인 경우 '내일' 뱃지 표시
          const showTomorrowBadge = (item.isTomorrow && item.isMidnight) || (item.isTomorrow && index === 0);

          return (
            <View key={item.id} style={styles.barItem}>
              
              {/* 내일 구분선 뱃지 */}
              {showTomorrowBadge ? (
                <View style={styles.badge}><Text style={styles.badgeText}>내일</Text></View>
              ) : (
                <View style={styles.spacer} />
              )}

              {/* 내일 시간대는 글씨 색상을 다르게 처리 */}
              <Text style={[styles.timeText, item.isTomorrow && styles.tomorrowTimeText]}>
                {item.time}
              </Text>
              
              <Image source={{ uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png` }} style={styles.icon} />
              <Text style={styles.tempText}>{Math.round(item.temp)}°</Text>
              
              <View style={styles.barArea}>
                {/* 내일 데이터는 그래프 색상을 연하게 변경 */}
                <View style={[
                  styles.bar, 
                  { height: `${heightPercentage}%` },
                  item.isTomorrow && styles.tomorrowBar 
                ]} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  graphContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 10 },
  barItem: { alignItems: 'center', width: 60, marginRight: 10 },
  
  // 🌟 내일 구분용 스타일
  spacer: { height: 18, marginBottom: 4 },
  badge: { backgroundColor: '#4F46E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },
  tomorrowTimeText: { color: '#8B5CF6' }, // 보라색으로 내일 시간 표시
  tomorrowBar: { backgroundColor: '#A78BFA' }, // 바 색상도 연한 보라색으로
  
  timeText: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  icon: { width: 40, height: 40, marginBottom: 2 },
  tempText: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 },
  barArea: { height: 80, width: '100%', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingBottom: 0, overflow: 'hidden' },
  bar: { width: 30, backgroundColor: '#4F46E5', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
});