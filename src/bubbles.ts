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
    imageSrc: 'bubbles/round.svg',
    safeArea: { x: 100, y: 60, width: 360, height: 200 },
  },
  {
    id: 'thinking',
    label: '생각 말풍선',
    imageSrc: 'bubbles/thinking.svg',
    safeArea: { x: 44, y: 88, width: 281, height: 190 },
  },
];