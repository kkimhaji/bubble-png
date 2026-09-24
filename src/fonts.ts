export interface FontOption {
  id: string;
  label: string;         // 드롭다운에 표시될 이름
  cssFontFamily: string; // Konva Text의 fontFamily에 실제로 들어갈 값
}

export const fonts: FontOption[] = [
  { id: 'system', label: '기본 폰트', cssFontFamily: 'sans-serif' },
  { id: 'joseon-gulim', label: '조선굴림체', cssFontFamily: 'JoseonGulim' },
  { id: 'nanum-barun-gothic', label: '나눔바른고딕', cssFontFamily: 'NanumBarunGothic'},
  { id: 'baemin-kkubullim', label: '배달의 민족 꾸불림체', cssFontFamily: 'KkuBulLim'},
  { id: 'nexon-lv1-gothic', label: '넥슨 Lv1 고딕', cssFontFamily: 'NexonLv1Gothic'},
  { id: 'galmuri-11', label: '갈무리11', cssFontFamily: 'Galmuri11'},


  // 폰트를 추가하려면: style.css에 @font-face로 먼저 등록한 뒤, 이 배열에 항목을 추가하세요.
];