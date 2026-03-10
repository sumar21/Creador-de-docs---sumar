const SVG_MIME_TYPES = new Set(["image/svg+xml"]);

type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  outputType?: "image/webp" | "image/jpeg";
  quality?: number;
  minQuality?: number;
  maxOutputBytes?: number;
  minWidth?: number;
  minHeight?: number;
};

type PrepareImageUploadOptions = CompressImageOptions;

export type PreparedImageUpload = {
  dataUrl: string;
  byteSize: number;
  mimeType: string;
  width?: number;
  height?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function estimateDataUrlByteSize(dataUrl: string): number {
  const base64Payload = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64Payload.length * 3) / 4);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo procesar la imagen."));
    };

    image.src = objectUrl;
  });
}

function getScaledDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function drawOnCanvas(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo inicializar el compresor de imágenes.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  return canvas;
}

async function compressRasterImage(
  file: File,
  options: CompressImageOptions,
): Promise<PreparedImageUpload> {
  const image = await loadImageElement(file);

  const maxWidth = options.maxWidth ?? 1600;
  const maxHeight = options.maxHeight ?? 1600;
  const outputType = options.outputType ?? "image/webp";
  const minQuality = clamp(options.minQuality ?? 0.5, 0.1, 0.95);
  const maxOutputBytes = options.maxOutputBytes ?? 650 * 1024;
  const minWidth = options.minWidth ?? 320;
  const minHeight = options.minHeight ?? 320;

  let { width, height } = getScaledDimensions(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight);
  let quality = clamp(options.quality ?? 0.82, minQuality, 0.95);
  let canvas = drawOnCanvas(image, width, height);
  let dataUrl = canvas.toDataURL(outputType, quality);
  let byteSize = estimateDataUrlByteSize(dataUrl);

  for (let attempt = 0; attempt < 8 && byteSize > maxOutputBytes; attempt += 1) {
    if (quality > minQuality + 0.04) {
      quality = clamp(quality - 0.08, minQuality, 0.95);
    } else if (width > minWidth || height > minHeight) {
      const shrinkFactor = 0.9;
      width = Math.max(minWidth, Math.round(width * shrinkFactor));
      height = Math.max(minHeight, Math.round(height * shrinkFactor));
      canvas = drawOnCanvas(image, width, height);
    } else {
      break;
    }

    dataUrl = canvas.toDataURL(outputType, quality);
    byteSize = estimateDataUrlByteSize(dataUrl);
  }

  return {
    dataUrl,
    byteSize,
    mimeType: outputType,
    width,
    height,
  };
}

export async function prepareImageUpload(
  file: File,
  options: PrepareImageUploadOptions = {},
): Promise<PreparedImageUpload> {
  if (SVG_MIME_TYPES.has(file.type)) {
    const dataUrl = await fileToDataUrl(file);

    return {
      dataUrl,
      byteSize: estimateDataUrlByteSize(dataUrl),
      mimeType: file.type,
    };
  }

  return compressRasterImage(file, options);
}
