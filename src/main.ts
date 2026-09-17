import Konva from "konva";
import { bubbles, type BubbleAsset } from "./bubbles";
import "./style.css";
import { fonts } from "./fonts";

const SHOW_SAFE_AREA_DEBUG = false;
const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 500;
let virtualWidth = STAGE_WIDTH;
let virtualHeight = STAGE_HEIGHT;

const bubbleSelect = document.querySelector<HTMLSelectElement>("#bubble-select")!;
const stageContainer = document.querySelector<HTMLDivElement>("#stage-container")!;
const fontSelect = document.querySelector<HTMLSelectElement>("#font-select")!;
const textInput = document.querySelector<HTMLTextAreaElement>("#text-input")!;
const fontSizeInput = document.querySelector<HTMLInputElement>("#font-size")!;
const colorInput = document.querySelector<HTMLInputElement>("#text-color")!;
const flipHButton = document.querySelector<HTMLButtonElement>("#flip-h")!;
const flipVButton = document.querySelector<HTMLButtonElement>("#flip-v")!;
const exportButton = document.querySelector<HTMLButtonElement>("#export-btn")!;

const bubbleWidthInput = document.querySelector<HTMLInputElement>("#bubble-width")!;
const bubbleHeightInput = document.querySelector<HTMLInputElement>("#bubble-height")!;
const lockAspectCheckbox = document.querySelector<HTMLInputElement>("#lock-aspect")!;

const bubbleWidthRangeInput = document.querySelector<HTMLInputElement>("#bubble-width-range")!;
const bubbleHeightRangeInput = document.querySelector<HTMLInputElement>("#bubble-height-range")!;

const stage = new Konva.Stage({
  container: "stage-container",
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
});
const layer = new Konva.Layer();
stage.add(layer);

const textNode = new Konva.Text({ align: "center", verticalAlign: "middle", wrap: "word" });
layer.add(textNode);

let currentBubble: BubbleAsset = bubbles[0];
let intrinsicWidth = 0;
let intrinsicHeight = 0;
let aspectRatio = 1;

let outerGroup: Konva.Group | null = null;
let flipGroup: Konva.Group | null = null;

let debugRect: Konva.Rect | null = null;

if (SHOW_SAFE_AREA_DEBUG) {
  debugRect = new Konva.Rect({ fill: "rgba(255,0,0,0.25)", listening: false });
  layer.add(debugRect);
}
let flipX = false;
let flipY = false;
let currentFontFamily = fonts[0].cssFontFamily;
let currentScaleX = 1;
let currentScaleY = 1;

bubbles.forEach((b) => {
  const option = document.createElement("option");
  option.value = b.id;
  option.textContent = b.label;
  bubbleSelect.appendChild(option);
});

fonts.forEach((f) => {
  const option = document.createElement("option");
  option.value = f.id;
  option.textContent = f.label;
  fontSelect.appendChild(option);
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
function fitStageIntoContainer() {
  stageContainer.style.aspectRatio = `${virtualWidth} / ${virtualHeight}`; // 추가

  const containerWidth = stageContainer.clientWidth;
  const scale = containerWidth / virtualWidth;
  stage.width(virtualWidth * scale);
  stage.height(virtualHeight * scale);
  stage.scale({ x: scale, y: scale });
  layer.batchDraw();
}

window.addEventListener('resize', fitStageIntoContainer);
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

  bubbleWidthRangeInput.min = String(
    Math.max(20, Math.round(intrinsicWidth * 0.3))
  );
  bubbleWidthRangeInput.max = String(Math.round(intrinsicWidth * 3));
  bubbleWidthRangeInput.value = String(intrinsicWidth);

  bubbleHeightRangeInput.min = String(
    Math.max(20, Math.round(intrinsicHeight * 0.3))
  );
  bubbleHeightRangeInput.max = String(Math.round(intrinsicHeight * 3));
  bubbleHeightRangeInput.value = String(intrinsicHeight);

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

  applySize(intrinsicWidth, intrinsicHeight);
  updateTextPosition();
  updateTextStyle();
}

function applySize(targetWidth: number, targetHeight: number) {
  if (!outerGroup || intrinsicWidth === 0 || intrinsicHeight === 0) return;
  currentScaleX = targetWidth / intrinsicWidth;
  currentScaleY = targetHeight / intrinsicHeight;

  virtualWidth = targetWidth;
  virtualHeight = targetHeight;

  outerGroup.x(virtualWidth / 2);
  outerGroup.y(virtualHeight / 2);
  outerGroup.scaleX(currentScaleX);
  outerGroup.scaleY(currentScaleY);

  fitStageIntoContainer(); // 화면 표시 크기 재계산 (stage.width/height/scale 갱신 포함)
  updateTextPosition();
}

function updateTextPosition() {
  const safeArea = currentBubble.safeArea;

  const effectiveX = flipX ? intrinsicWidth - safeArea.x - safeArea.width : safeArea.x;
  const effectiveY = flipY ? intrinsicHeight - safeArea.y - safeArea.height : safeArea.y;

  const bubbleLeft = virtualWidth / 2 - (intrinsicWidth / 2) * currentScaleX;
  const bubbleTop = virtualHeight / 2 - (intrinsicHeight / 2) * currentScaleY;

  textNode.x(bubbleLeft + effectiveX * currentScaleX);
  textNode.y(bubbleTop + effectiveY * currentScaleY);
  textNode.width(safeArea.width * currentScaleX);
  textNode.height(safeArea.height * currentScaleY);

  if (debugRect) {
    debugRect.x(textNode.x());
    debugRect.y(textNode.y());
    debugRect.width(textNode.width());
    debugRect.height(textNode.height());
  }
  textNode.moveToTop();
}

fontSelect.addEventListener("change", async () => {
  const selected = fonts.find((f) => f.id === fontSelect.value);
  if (!selected) return;
  currentFontFamily = selected.cssFontFamily;

  try {
    await document.fonts.load(`16px "${currentFontFamily}"`);
  } catch (err) {
    console.error("폰트 로드 실패:", err);
  }

  updateTextStyle();
});

function updateTextStyle() {
  textNode.text(textInput.value);
  textNode.fontSize(Number(fontSizeInput.value));
  textNode.fill(colorInput.value);
  textNode.fontFamily(currentFontFamily);
  layer.batchDraw();
}

bubbleSelect.addEventListener("change", () => {
  const selected = bubbles.find((b) => b.id === bubbleSelect.value);
  if (selected) void renderBubble(selected);
});

[textInput, fontSizeInput, colorInput].forEach(
  (el) => el.addEventListener("input", updateTextStyle)
);

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

function handleWidthChange(newWidth: number) {
  const newHeight = lockAspectCheckbox.checked
    ? newWidth / aspectRatio
    : Number(bubbleHeightInput.value);

  bubbleWidthInput.value = String(Math.round(newWidth));
  bubbleWidthRangeInput.value = String(Math.round(newWidth));
  if (lockAspectCheckbox.checked) {
    bubbleHeightInput.value = String(Math.round(newHeight));
    bubbleHeightRangeInput.value = String(Math.round(newHeight));
  }
  applySize(newWidth, newHeight);
}

function handleHeightChange(newHeight: number) {
  const newWidth = lockAspectCheckbox.checked
    ? newHeight * aspectRatio
    : Number(bubbleWidthInput.value);

  bubbleHeightInput.value = String(Math.round(newHeight));
  bubbleHeightRangeInput.value = String(Math.round(newHeight));
  if (lockAspectCheckbox.checked) {
    bubbleWidthInput.value = String(Math.round(newWidth));
    bubbleWidthRangeInput.value = String(Math.round(newWidth));
  }
  applySize(newWidth, newHeight);
}

bubbleWidthInput.addEventListener("input", () =>
  handleWidthChange(Number(bubbleWidthInput.value))
);
bubbleWidthRangeInput.addEventListener("input", () =>
  handleWidthChange(Number(bubbleWidthRangeInput.value))
);
bubbleHeightInput.addEventListener("input", () =>
  handleHeightChange(Number(bubbleHeightInput.value))
);
bubbleHeightRangeInput.addEventListener("input", () =>
  handleHeightChange(Number(bubbleHeightRangeInput.value))
);

exportButton.addEventListener('click', () => {
  const exportPixelRatio = virtualWidth / stage.width();
  const dataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: exportPixelRatio });
  const link = document.createElement('a');
  link.download = 'speech-bubble.png';
  link.href = dataUrl;
  link.click();
});

void renderBubble(currentBubble);
