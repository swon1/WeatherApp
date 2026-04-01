// src/utils/weatherUtils.js

export const getAqiKorean = (aqi) => {
  switch (aqi) {
    case 1: return '최고 좋음 🔵';
    case 2: return '좋음 🟢';
    case 3: return '보통 🟡';
    case 4: return '나쁨 🟠';
    case 5: return '매우 나쁨 🔴';
    default: return '알 수 없음';
  }
};

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

export const getOutfitRecommendation = (min, max, wind, aqi) => {
  let outfit = '';
  let tips = [];
  const tempDiff = max - min;

  if (tempDiff >= 8) {
    outfit = `낮에는 [${getClothesString(max)}], 아침저녁엔 [${getClothesString(min)}] 어때요?`;
    tips.push('일교차가 커요! 입고 벗기 편한 겉옷을 챙겨 체온을 조절하세요 🧥');
  } else {
    outfit = `오늘은 하루 종일 [${getClothesString(max)}] 위주의 옷차림을 추천해요.`;
  }

  if (wind >= 5) tips.push('바람이 제법 불어요. 체감 온도가 낮으니 참고하세요 🌬️');
  if (aqi >= 4) tips.push('미세먼지가 탁해요. 외출 시 마스크를 꼭 챙기세요 😷');

  return { outfit, tips };
};

export const processForecastData = (list) => {
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

export const formatDay = (dateString) => {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
};

export const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${ampm} ${hours}:${minutes}`;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export const processHourlyData = (list) => {
  const now = new Date();
  const todayDate = now.getDate();
  
  // 내일 날짜 구하기
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = tomorrow.getDate();

  const result = [];
  
  for (let item of list) {
    const date = new Date(item.dt * 1000);
    const itemDate = date.getDate();
    
    // 🌟 오늘이거나 내일인 경우만 가져옴 (모레 데이터는 버림)
    if (itemDate === todayDate || itemDate === tomorrowDate) {
      let hours = date.getHours();
      const ampm = hours >= 12 ? '오후' : '오전';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      
      let timeString = `${ampm} ${displayHours}시`;
      if (hours === 0) timeString = '자정';

      const isTomorrow = itemDate === tomorrowDate;

      result.push({
        id: item.dt.toString(),
        time: timeString,
        temp: item.main.temp,
        icon: item.weather[0].icon,
        isTomorrow: isTomorrow, // 내일인지 여부
        isMidnight: hours === 0 // 자정인지 여부
      });
    }
  }
  return result;
};