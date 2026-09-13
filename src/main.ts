import Konva from 'konva';
import { bubbles, type BubbleAsset } from './bubbles';
import './style.css';
import '@fontsource/noto-sans-kr/400.css';

const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 500;

const stageContainer = document.querySelector<HTMLDivElement>('#stage-container')!;
const bubbleSelect = document.querySelector<HTMLSelectElement>('#bubble-select')!;
const textInput = document.querySelector<HTMLTextAreaElement>('#text-input')!;
const fontSizeInput = document.querySelector<HTMLInputElement>('#font-size')!;
const colorInput = document.querySelector<HTMLInputElement>('#text-color')!;
const letterSpacingInput = document.querySelector<HTMLInputElement>('#letter-spacing')!;
const boldCheckbox = document.querySelector<HTMLInputElement>('#bold')!;
const italicCheckbox = document.querySelector<HTMLInputElement>('#italic')!;
const flipHButton = document.querySelector<HTMLButtonElement>('#flip-h')!;
const flipVButton = document.querySelector<HTMLButtonElement>('#flip-v')!;
const exportButton = document.querySelector<HTMLButtonElement>('#export-btn')!;

stageContainer.style.width = `${STAGE_WIDTH}px`;
stageContainer.style.height = `${STAGE_HEIGHT}px`;

const stage = new Konva.Stage({
  container: 'stage-container',
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
});
const layer = new Konva.Layer();
stage.add(layer);

let currentBubble: BubbleAsset = bubbles[0];
let bubbleGroup: Konva.Group | null = null;
let textNode: Konva.Text | null = null;
let flipX = false;
let flipY = false;

bubbles.forEach((b) => {
  const option = document.createElement('option');
  option.value = b.id;
  option.textContent = b.label;
  bubbleSelect.appendChild(option);
});

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderBubble(bubble: BubbleAsset) {
  currentBubble = bubble;
  bubbleGroup?.destroy();

  const imgEl = await loadImage(bubble.imageSrc);
  const stageX = (STAGE_WIDTH - bubble.width) / 2;
  const stageY = (STAGE_HEIGHT - bubble.height) / 2;

  bubbleGroup = new Konva.Group({
    x: stageX + bubble.width / 2,
    y: stageY + bubble.height / 2,
    offsetX: bubble.width / 2,
    offsetY: bubble.height / 2,
    scaleX: flipX ? -1 : 1,
    scaleY: flipY ? -1 : 1,
  });

  bubbleGroup.add(
    new Konva.Image({ image: imgEl, x: 0, y: 0, width: bubble.width, height: bubble.height }),
  );

  layer.add(bubbleGroup);
  bubbleGroup.moveToBottom();

  if (!textNode) {
    textNode = new Konva.Text({
      align: 'center',
      verticalAlign: 'middle',
      wrap: 'word',
    });
    layer.add(textNode);
  }

  updateTextPosition();
  updateTextStyle();
}

function updateTextPosition() {
  if (!textNode) return;
  const bubble = currentBubble;
  const stageX = (STAGE_WIDTH - bubble.width) / 2;
  const stageY = (STAGE_HEIGHT - bubble.height) / 2;

  // flip 상태에 맞춰 안전영역 좌표를 미러링
  const effectiveX = flipX
    ? bubble.width - bubble.safeArea.x - bubble.safeArea.width
    : bubble.safeArea.x;
  const effectiveY = flipY
    ? bubble.height - bubble.safeArea.y - bubble.safeArea.height
    : bubble.safeArea.y;

  textNode.width(bubble.safeArea.width);
  textNode.height(bubble.safeArea.height);
  textNode.x(stageX + effectiveX);
  textNode.y(stageY + effectiveY);
}

function updateTextStyle() {
  if (!textNode) return;

  textNode.text(textInput.value);
  textNode.fontSize(Number(fontSizeInput.value));
  textNode.fill(colorInput.value);
  textNode.letterSpacing(Number(letterSpacingInput.value));

  const fontStyle =
    [boldCheckbox.checked ? 'bold' : '', italicCheckbox.checked ? 'italic' : '']
      .filter(Boolean)
      .join(' ') || 'normal';
  textNode.fontStyle(fontStyle);

  layer.batchDraw();
}

// ----- 이벤트 바인딩 -----
bubbleSelect.addEventListener('change', () => {
  const selected = bubbles.find((b) => b.id === bubbleSelect.value);
  if (selected) void renderBubble(selected);
});

[textInput, fontSizeInput, colorInput, letterSpacingInput, boldCheckbox, italicCheckbox].forEach(
  (el) => el.addEventListener('input', updateTextStyle),
);

flipHButton.addEventListener('click', () => {
  flipX = !flipX;
  bubbleGroup?.scaleX(flipX ? -1 : 1);
  updateTextPosition();
  layer.batchDraw();
});

flipVButton.addEventListener('click', () => {
  flipY = !flipY;
  bubbleGroup?.scaleY(flipY ? -1 : 1);
  updateTextPosition();
  layer.batchDraw();
});

exportButton.addEventListener('click', () => {
  const dataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 1 });
  const link = document.createElement('a');
  link.download = 'speech-bubble.png';
  link.href = dataUrl;
  link.click();
});

void renderBubble(currentBubble);