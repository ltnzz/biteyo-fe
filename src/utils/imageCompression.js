const DEFAULT_OPTIONS = {
  maxDimension: 1280,
  quality: 0.82,
  maxBytes: 950 * 1024,
};

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

const createImageBitmapFallback = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal memproses gambar."));
    };
    image.src = objectUrl;
  });

const loadImage = async (file) => {
  if ("createImageBitmap" in window) {
    return window.createImageBitmap(file, { imageOrientation: "from-image" });
  }

  return createImageBitmapFallback(file);
};

export const compressImageFile = async (file, options = {}) => {
  if (!file || !file.type?.startsWith("image/")) return file;

  const { maxDimension, quality, maxBytes } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (file.size <= maxBytes) return file;

  const image = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  if (!blob || blob.size >= file.size) return file;

  const filename = file.name.replace(/\.[^.]+$/, "") || "bite-photo";
  return new File([blob], `${filename}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

