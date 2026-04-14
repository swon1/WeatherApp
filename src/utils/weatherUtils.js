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
  if (temp >= 28) return '시원한 린넨 셔츠나 반팔';
  if (temp >= 23) return '가벼운 반팔이나 얇은 셔츠';
  if (temp >= 20) return '편안한 맨투맨이나 얇은 긴팔';
  if (temp >= 17) return '부드러운 니트나 가디건';
  if (temp >= 12) return '도톰한 자켓이나 포근한 후드티';
  if (temp >= 9) return '멋스러운 트렌치코트나 야상';
  if (temp >= 5) return '따뜻한 코트나 든든한 경량 패딩';
  return '두꺼운 패딩과 따뜻한 목도리';
};

// 🌟 1. 온도별 의류 아이콘(이모지)을 배열로 반환하는 함수 새로 추가
const getClothesIcons = (temp) => {
  if (temp >= 28) return ['🎽', '🩳']; // 민소매, 반바지
  if (temp >= 23) return ['👕', '👖']; // 반팔, 얇은 바지
  if (temp >= 20) return ['👕', '👖']; // 긴팔/맨투맨
  if (temp >= 17) return ['🧶', '👖']; // 니트/가디건
  if (temp >= 12) return ['🧥', '👖']; // 자켓
  if (temp >= 9) return ['🧥', '🧣']; // 트렌치코트, 목도리
  if (temp >= 5) return ['🧥', '🧤']; // 코트, 장갑
  return ['🧥', '🧣', '🧤']; // 두꺼운 패딩, 목도리, 장갑
};

export const getOutfitRecommendation = (min, max, wind, aqi) => {
  let outfit = '';
  let tips = [];
  const tempDiff = max - min;

  if (tempDiff >= 10) {
    outfit = `일교차가 꽤 커요! 한낮엔 ${getClothesString(max)} 차림이 편하시겠지만, 아침저녁을 대비해 ${getClothesString(min)}도 꼭 하나 챙겨서 외출하세요. 🧥`;
  } else if (tempDiff >= 6) {
    outfit = `아침저녁으론 제법 선선하네요. ${getClothesString(max)} 차림에 입고 벗기 편한 ${getClothesString(min)} 정도만 걸쳐주시면 하루 종일 기분 좋게 보내실 수 있어요. 🌤️`;
  } else {
    outfit = `오늘은 하루 종일 기온이 한결같아요. 고민할 것 없이 ${getClothesString(max)} 위주로 코디하시면 딱 어울리는 하루가 될 거예요. ✨`;
  }

  if (wind >= 5) tips.push('앗, 바람이 제법 불어서 실제 기온보다 더 쌀쌀하게 느껴져요. 바람을 막아줄 겉옷 챙기는 걸 추천해요! 🌬️');
  if (aqi >= 4) tips.push('오늘 공기가 탁해서 목이 칼칼할 수 있어요. 소중한 건강을 위해 마스크 챙기는 거 잊지 마세요! 😷');

  // 🌟 최고 기온에 맞는 기본 옷 아이콘 추출
  let icons = getClothesIcons(max);
  
  // 일교차가 6도 이상 크면 최저 기온에 맞는 겉옷 아이콘도 추가 
  if (tempDiff >= 6) {
    const minIcons = getClothesIcons(min);
    // 중복되는 아이콘(예: 바지)을 제거하고 합치기 (Set 활용)
    icons = [...new Set([...icons, ...minIcons])];
  }

  // 🌟 문자열뿐만 아니라 icons 배열도 함께 반환
  return { outfit, tips, icons };
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