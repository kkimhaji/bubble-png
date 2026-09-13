export interface SafeArea {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export interface BubbleAsset {
    id: string;
    label: string;      // 드롭다운에 표시될 이름
    imageSrc: string;   // public 디렉터리 기준 절대 경로
    width: number;       // 원본 이미지 크기(px)
    height: number;
    safeArea: SafeArea;  // 텍스트가 들어갈 안전 영역(원본 이미지 기준 좌표)
  }
  
  export const bubbles: BubbleAsset[] = [
    {
      id: 'round',
      label: '둥근 말풍선',
      imageSrc: '/bubbles/round.svg',
      width: 500,
      height: 400,
      safeArea: { x: 80, y: 60, width: 340, height: 220 },
    },
    // 말풍선을 추가하려면: public/bubbles/에 svg 파일을 넣고 이 배열에 객체를 하나 더 추가하세요.
  ];