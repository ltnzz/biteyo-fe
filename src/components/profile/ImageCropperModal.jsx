import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Minimize2,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function ImageCropperModal({
  imageFile,
  imageSrc: propImageSrc,
  title = "Sesuaikan Banner Profil",
  aspectRatio = 3 / 1, // banner default 3:1
  onComplete,
  onCancel,
  onResetToOriginal,
}) {
  const [imageSrc, setImageSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const originalFileName = imageFile?.name || "cropped-banner.jpg";

  // Load image source from File or prop URL
  useEffect(() => {
    let url = "";
    if (imageFile) {
      url = URL.createObjectURL(imageFile);
      setImageSrc(url);
    } else if (propImageSrc) {
      setImageSrc(propImageSrc);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageFile, propImageSrc]);

  // Load natural image dimensions
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // Keyboard navigation (Escape to cancel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Mouse / Touch Dragging for Pan
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  // Rotate operations
  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

  // Flip operations
  const toggleFlipH = () => setFlipH((prev) => !prev);
  const toggleFlipV = () => setFlipV((prev) => !prev);

  // Reset to initial
  const resetAll = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPan({ x: 0, y: 0 });
  };

  // Crop & Export to File
  const handleApplyCrop = useCallback(async () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const cropBox = containerRef.current.getBoundingClientRect();

    // High-resolution output canvas
    const outputWidth = 1200;
    const outputHeight = Math.round(outputWidth / aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Enable high-quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill background (neutral light - biar tidak hitam saat letterbox)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.save();

    // Move to center of canvas
    ctx.translate(outputWidth / 2, outputHeight / 2);

    // Apply scale multiplier relative to preview container
    const scaleMultiplier = outputWidth / cropBox.width;

    // Apply translation from pan
    ctx.translate(pan.x * scaleMultiplier, pan.y * scaleMultiplier);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply user zoom
    ctx.scale(zoom, zoom);

    // Calculate drawn image dimensions based on natural aspect ratio vs cropbox
    const imgNaturalW = img.naturalWidth || imageDimensions.width;
    const imgNaturalH = img.naturalHeight || imageDimensions.height;

    // Scale image to cover the crop box at zoom = 1
    const coverScale = Math.max(
      cropBox.width / imgNaturalW,
      cropBox.height / imgNaturalH
    );
    const drawW = imgNaturalW * coverScale * scaleMultiplier;
    const drawH = imgNaturalH * coverScale * scaleMultiplier;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Convert canvas to Blob then File
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onCancel();
          return;
        }

        const croppedFile = new File([blob], originalFileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        onComplete(croppedFile);
      },
      "image/jpeg",
      0.92
    );
  }, [aspectRatio, flipH, flipV, imageDimensions, onCancel, onComplete, originalFileName, pan, rotation, zoom]);

  return (
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-gray-950/70 p-3 backdrop-blur-md animate-modal-fade"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-modal-rise">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-pink-500">
              <Maximize2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">
                Geser untuk menyesuaikan posisi, putar, atau balik foto
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewport Area — pakai bg terang biar gambar asli keliatan, tidak hitam */}
        <div className="relative flex items-center justify-center bg-gray-100 px-4 py-8 overflow-hidden select-none">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ aspectRatio: `${aspectRatio}` }}
            className={`relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-pink-500/80 shadow-2xl cursor-grab active:cursor-grabbing bg-white flex items-center justify-center`}
          >
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${
                    (flipH ? -1 : 1) * zoom
                  }, ${(flipV ? -1 : 1) * zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  maxWidth: "none",
                  maxHeight: "none",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                className="pointer-events-none select-none"
              />
            )}

            {/* Grid overlay guidelines — pakai hitam tipis di bg terang biar keliatan */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-black/10">
              <div className="border-b border-r border-black/10" />
              <div className="border-b border-r border-black/10" />
              <div className="border-b border-black/10" />
              <div className="border-b border-r border-black/10" />
              <div className="border-b border-r border-black/10" />
              <div className="border-b border-black/10" />
              <div className="border-r border-black/10" />
              <div className="border-r border-black/10" />
              <div />
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5 min-w-[70px]">
              <ZoomIn className="h-3.5 w-3.5 text-pink-500" /> Zoom
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 transition"
              title="Perkecil"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-pink-500"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 transition"
              title="Perbesar"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[42px] text-right text-xs font-semibold text-gray-500">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons: Rotate & Flip & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Rotate Left */}
              <button
                type="button"
                onClick={rotateLeft}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                title="Putar ke kiri 90°"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">-90°</span>
              </button>

              {/* Rotate Right */}
              <button
                type="button"
                onClick={rotateRight}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                title="Putar ke kanan 90°"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">+90°</span>
              </button>

              {/* Flip Horizontal */}
              <button
                type="button"
                onClick={toggleFlipH}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition ${
                  flipH
                    ? "bg-pink-500 text-white border-pink-500"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                }`}
                title="Balik Horizontal (Mirror)"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Flip H</span>
              </button>

              {/* Flip Vertical */}
              <button
                type="button"
                onClick={toggleFlipV}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition ${
                  flipV
                    ? "bg-pink-500 text-white border-pink-500"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                }`}
                title="Balik Vertikal"
              >
                <FlipVertical className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Flip V</span>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-700"
                title="Reset pengaturan"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </button>

              {/* Kembali ke awal — pakai gambar asli sebelum crop */}
              {onResetToOriginal && (
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    onResetToOriginal();
                  }}
                  className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-700 shadow-sm transition hover:bg-amber-100"
                  title="Kembali ke gambar asli sebelum crop"
                >
                  Awal
                </button>
              )}
            </div>

            {/* Cancel & Apply */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/80 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex items-center gap-1.5 rounded-full bg-pink-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-pink-600 hover:shadow-md transition"
              >
                <Check className="h-4 w-4" />
                Terapkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
