export interface FontOption {
  id: string;
  label: string;         // 드롭다운에 표시될 이름
  cssFontFamily: string; // Konva Text의 fontFamily에 실제로 들어갈 값
}

export const fonts: FontOption[] = [
  { id: 'system', label: '기본 폰트', cssFontFamily: 'sans-serif' },
  { id: 'chosun-gulim', label: '조선굴림체', cssFontFamily: 'JoseonGulim' },
  // 폰트를 추가하려면: style.css에 @font-face로 먼저 등록한 뒤, 이 배열에 항목을 추가하세요.
];