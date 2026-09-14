export interface SafeArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BubbleAsset {
  id: string;
  label: string;
  imageSrc: string;
  safeArea: SafeArea; // 원본 SVG(viewBox) 기준 좌표 — 실제 크기는 로드 시 이미지에서 읽어옴
}
  
export const bubbles: BubbleAsset[] = [
  {
    id: 'round',
    label: '둥근 말풍선',
    imageSrc: '/bubbles/round.svg',
    safeArea: { x: 100, y: 60, width: 360, height: 200 },
  },
  // 말풍선을 추가하려면: public/bubbles/에 svg 파일을 넣고 이 배열에 객체를 하나 더 추가하세요.
];