import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Brush, MousePointer, Trash2, RotateCcw } from 'lucide-react';

const COLORS = [
  { value: '#000000', name: 'Charcoal' },
  { value: '#ff7b97', name: 'Pastel Pink' },
  { value: '#a78bfa', name: 'Lavender' },
  { value: '#60a5fa', name: 'Sky Blue' },
  { value: '#34d399', name: 'Mint' },
  { value: '#fbbf24', name: 'Marigold' }
];

export default function DrawingCanvas({ onCanvasChange, activeSticker, clearStickerTrigger }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff7b97');
  const [brushSize, setBrushSize] = useState(5);
  const [hasSelection, setHasSelection] = useState(false);

  // Initialize fabric canvas
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 320,
      height: 320,
      backgroundColor: 'transparent',
      isDrawingMode: false,
    });

    fabricRef.current = canvas;

    // Set brush configuration
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    // Track active selection to toggle delete controls
    const handleSelection = () => setHasSelection(!!canvas.getActiveObject());
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    canvas.on('selection:updated', handleSelection);

    // Track canvas changes to sync state
    const saveState = () => {
      if (!canvas || canvas.getObjects().length === 0) {
        onCanvasChange(null);
        return;
      }
      try {
        // SVG export is vector crisp and 98% smaller than raw bitmap PNG (~1KB vs 60KB)
        const svg = canvas.toSVG();
        const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        onCanvasChange(dataUrl);
      } catch (e) {
        const dataUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 0.5
        });
        onCanvasChange(dataUrl);
      }
    };

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:cleared', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('object:added', saveState);
      canvas.off('object:modified', saveState);
      canvas.off('object:removed', saveState);
      canvas.dispose();
    };
  }, []);

  // Sync brush changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;
  }, [brushColor, brushSize]);

  // Handle drawing mode toggle
  const toggleDrawingMode = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = !canvas.isDrawingMode;
    setIsDrawing(canvas.isDrawingMode);
    if (canvas.isDrawingMode) {
      canvas.discardActiveObject().renderAll();
    }
  };

  // Add emoji sticker onto canvas
  useEffect(() => {
    if (!activeSticker || !fabricRef.current) return;
    const canvas = fabricRef.current;

    // Create a Fabric text object for the emoji sticker
    const stickerText = new fabric.Text(activeSticker, {
      fontSize: 50,
      left: 135,
      top: 135,
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerColor: 'rgba(236, 72, 153, 0.4)',
      transparentCorners: false,
      cornerSize: 8,
      borderColor: 'rgba(236, 72, 153, 0.3)'
    });

    canvas.add(stickerText);
    canvas.setActiveObject(stickerText);
    canvas.isDrawingMode = false;
    setIsDrawing(false);
    canvas.requestRenderAll();
    
    // Clear trigger in parent
    clearStickerTrigger();
  }, [activeSticker]);

  // Delete selected sticker/drawing line
  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  // Clear entire drawing canvas
  const clearAll = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    onCanvasChange(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas Wrap (Sleek Frame) */}
      <div className="relative mx-auto rounded-3xl overflow-hidden border border-slate-200/80 bg-white/40 shadow-inner w-[320px] h-[320px]">
        {/* Gridded overlay guidelines for design */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] opacity-15 pointer-events-none" />
        <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      </div>

      {/* Editor Controls */}
      <div className="flex flex-col gap-3">
        {/* Modes Toolbar */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100/80 backdrop-blur-xs">
          <button
            type="button"
            onClick={toggleDrawingMode}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
              isDrawing
                ? 'bg-pink-400 text-white shadow-sm shadow-pink-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Draw Doodle</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              const canvas = fabricRef.current;
              if (canvas) {
                canvas.isDrawingMode = false;
                setIsDrawing(false);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
              !isDrawing
                ? 'bg-purple-400 text-white shadow-sm shadow-purple-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Sticker Design</span>
          </button>
        </div>

        {/* Brush Settings (visible only in draw mode) */}
        {isDrawing && (
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/40 border border-white/50 shadow-xs animate-fade-in">
            {/* Color selection */}
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setBrushColor(c.value)}
                  className={`w-6 h-6 rounded-full border transition-all duration-200 ${
                    brushColor === c.value
                      ? 'scale-115 border-slate-700 shadow-sm'
                      : 'border-white/50 scale-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            {/* Width selection */}
            <div className="flex items-center justify-between gap-4 mt-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Size:</span>
              <input
                type="range"
                min="2"
                max="25"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="flex-1 accent-pink-400 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-600 w-5 text-right">{brushSize}</span>
            </div>
          </div>
        )}

        {/* Delete & Clear buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!hasSelection}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-red-100 text-red-500 hover:bg-red-50/50 active:scale-98 transition-all ${
              !hasSelection ? 'opacity-40 cursor-not-allowed border-slate-100 text-slate-400 hover:bg-transparent' : ''
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
          
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-98 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
