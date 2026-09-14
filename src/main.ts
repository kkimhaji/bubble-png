import Konva from "konva";
import { bubbles, type BubbleAsset } from "./bubbles";
import "./style.css";

const SHOW_SAFE_AREA_DEBUG = false;
const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 500;

const bubbleSelect =
  document.querySelector<HTMLSelectElement>("#bubble-select")!;
const textInput = document.querySelector<HTMLTextAreaElement>("#text-input")!;
const fontSizeInput = document.querySelector<HTMLInputElement>("#font-size")!;
const colorInput = document.querySelector<HTMLInputElement>("#text-color")!;
const letterSpacingInput =
  document.querySelector<HTMLInputElement>("#letter-spacing")!;
const boldCheckbox = document.querySelector<HTMLInputElement>("#bold")!;
const italicCheckbox = document.querySelector<HTMLInputElement>("#italic")!;
const flipHButton = document.querySelector<HTMLButtonElement>("#flip-h")!;
const flipVButton = document.querySelector<HTMLButtonElement>("#flip-v")!;
const exportButton = document.querySelector<HTMLButtonElement>("#export-btn")!;

const bubbleWidthInput =
  document.querySelector<HTMLInputElement>("#bubble-width")!;
const bubbleHeightInput =
  document.querySelector<HTMLInputElement>("#bubble-height")!;
const lockAspectCheckbox =
  document.querySelector<HTMLInputElement>("#lock-aspect")!;

const stage = new Konva.Stage({
  container: "stage-container",
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
});
const layer = new Konva.Layer();
stage.add(layer);

let currentBubble: BubbleAsset = bubbles[0];
let intrinsicWidth = 0;
let intrinsicHeight = 0;
let aspectRatio = 1;

let outerGroup: Konva.Group | null = null;
let flipGroup: Konva.Group | null = null;
let textNode: Konva.Text | null = null;
let debugRect: Konva.Rect | null = null;
let flipX = false;
let flipY = false;

bubbles.forEach((b) => {
  const option = document.createElement("option");
  option.value = b.id;
  option.textContent = b.label;
  bubbleSelect.appendChild(option);
});

function resolvePublicPath(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
    img.src = src;
  });
}

async function renderBubble(bubble: BubbleAsset) {
  currentBubble = bubble;
  outerGroup?.destroy();

  let imgEl: HTMLImageElement;
  try {
    imgEl = await loadImage(resolvePublicPath(bubble.imageSrc));
  } catch (err) {
    console.error(err);
    alert(
      "말풍선 이미지를 불러오지 못했습니다: " +
        resolvePublicPath(bubble.imageSrc)
    );
    return;
  }

  intrinsicWidth = imgEl.naturalWidth;
  intrinsicHeight = imgEl.naturalHeight;
  aspectRatio = intrinsicWidth / intrinsicHeight;

  bubbleWidthInput.value = String(intrinsicWidth);
  bubbleHeightInput.value = String(intrinsicHeight);

  outerGroup = new Konva.Group({
    x: STAGE_WIDTH / 2,
    y: STAGE_HEIGHT / 2,
    offsetX: intrinsicWidth / 2,
    offsetY: intrinsicHeight / 2,
  });
  layer.add(outerGroup);

  flipGroup = new Konva.Group({
    x: intrinsicWidth / 2,
    y: intrinsicHeight / 2,
    offsetX: intrinsicWidth / 2,
    offsetY: intrinsicHeight / 2,
    scaleX: flipX ? -1 : 1,
    scaleY: flipY ? -1 : 1,
  });
  flipGroup.add(
    new Konva.Image({
      image: imgEl,
      x: 0,
      y: 0,
      width: intrinsicWidth,
      height: intrinsicHeight,
    })
  );
  outerGroup.add(flipGroup);

  if (SHOW_SAFE_AREA_DEBUG) {
    debugRect = new Konva.Rect({
      fill: "rgba(255,0,0,0.25)",
      listening: false,
    });
    outerGroup.add(debugRect);
  }

  textNode = new Konva.Text({
    align: "center",
    verticalAlign: "middle",
    wrap: "word",
  });
  outerGroup.add(textNode);

  applySize(intrinsicWidth, intrinsicHeight);
  updateTextPosition();
  updateTextStyle();
}

// 사용자가 지정한 표시 크기를 outerGroup의 scale로 반영
function applySize(targetWidth: number, targetHeight: number) {
  if (!outerGroup || intrinsicWidth === 0 || intrinsicHeight === 0) return;
  outerGroup.scaleX(targetWidth / intrinsicWidth);
  outerGroup.scaleY(targetHeight / intrinsicHeight);
  layer.batchDraw();
}

function updateTextPosition() {
  if (!textNode) return;
  const safeArea = currentBubble.safeArea;

  // flip 상태에 따라 안전영역 좌표만 미러링 (원본 이미지 좌표계 기준, outerGroup 스케일에 의해 자동으로 같이 늘어남)
  const effectiveX = flipX
    ? intrinsicWidth - safeArea.x - safeArea.width
    : safeArea.x;
  const effectiveY = flipY
    ? intrinsicHeight - safeArea.y - safeArea.height
    : safeArea.y;

  textNode.x(effectiveX);
  textNode.y(effectiveY);
  textNode.width(safeArea.width);
  textNode.height(safeArea.height);

  if (debugRect) {
    debugRect.x(effectiveX);
    debugRect.y(effectiveY);
    debugRect.width(safeArea.width);
    debugRect.height(safeArea.height);
  }
  textNode.moveToTop();
}

function updateTextStyle() {
  if (!textNode) return;
  textNode.text(textInput.value);
  textNode.fontSize(Number(fontSizeInput.value));
  textNode.fill(colorInput.value);
  textNode.letterSpacing(Number(letterSpacingInput.value));
  const fontStyle =
    [boldCheckbox.checked ? "bold" : "", italicCheckbox.checked ? "italic" : ""]
      .filter(Boolean)
      .join(" ") || "normal";
  textNode.fontStyle(fontStyle);
  layer.batchDraw();
}

// ----- 이벤트 -----
bubbleSelect.addEventListener("change", () => {
  const selected = bubbles.find((b) => b.id === bubbleSelect.value);
  if (selected) void renderBubble(selected);
});

[
  textInput,
  fontSizeInput,
  colorInput,
  letterSpacingInput,
  boldCheckbox,
  italicCheckbox,
].forEach((el) => el.addEventListener("input", updateTextStyle));

flipHButton.addEventListener("click", () => {
  flipX = !flipX;
  flipGroup?.scaleX(flipX ? -1 : 1);
  updateTextPosition();
  layer.batchDraw();
});

flipVButton.addEventListener("click", () => {
  flipY = !flipY;
  flipGroup?.scaleY(flipY ? -1 : 1);
  updateTextPosition();
  layer.batchDraw();
});

// 말풍선 크기 조절 (비율 고정 옵션 포함)
bubbleWidthInput.addEventListener("input", () => {
  const newWidth = Number(bubbleWidthInput.value);
  const newHeight = lockAspectCheckbox.checked
    ? newWidth / aspectRatio
    : Number(bubbleHeightInput.value);
  if (lockAspectCheckbox.checked)
    bubbleHeightInput.value = String(Math.round(newHeight));
  applySize(newWidth, newHeight);
});

bubbleHeightInput.addEventListener("input", () => {
  const newHeight = Number(bubbleHeightInput.value);
  const newWidth = lockAspectCheckbox.checked
    ? newHeight * aspectRatio
    : Number(bubbleWidthInput.value);
  if (lockAspectCheckbox.checked)
    bubbleWidthInput.value = String(Math.round(newWidth));
  applySize(newWidth, newHeight);
});

exportButton.addEventListener("click", () => {
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 1 });
  const link = document.createElement("a");
  link.download = "speech-bubble.png";
  link.href = dataUrl;
  link.click();
});

void renderBubble(currentBubble);
