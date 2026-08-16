"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Eraser } from "lucide-react";

export interface SignatureCanvasHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface SignatureCanvasProps {
  label: string;
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  ({ label }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const hasContent = useRef(false);
    const [isEmptyState, setIsEmptyState] = useState(true);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      function resize() {
        if (!canvas) return;
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(ratio, ratio);
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#0f172a";
        }
      }

      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    function getPos(e: React.MouseEvent | React.TouchEvent) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        const touch = e.touches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function start(e: React.MouseEvent | React.TouchEvent) {
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      drawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    function move(e: React.MouseEvent | React.TouchEvent) {
      if (!drawing.current) return;
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      hasContent.current = true;
      setIsEmptyState(false);
    }

    function end() {
      drawing.current = false;
    }

    function clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasContent.current = false;
      setIsEmptyState(true);
    }

    useImperativeHandle(ref, () => ({
      clear,
      isEmpty: () => !hasContent.current,
      toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
    }));

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-brand-slate-700">{label}</label>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-xs text-brand-slate-700/50 hover:text-red-600 transition-colors"
          >
            <Eraser size={14} />
            Limpar assinatura
          </button>
        </div>
        <div className="relative border-2 border-dashed border-brand-slate-100 rounded-xl overflow-hidden bg-brand-slate-50">
          <canvas
            ref={canvasRef}
            className="w-full h-40 touch-none cursor-crosshair bg-white"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
          {isEmptyState && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-brand-slate-700/30 text-sm">
              Assine aqui
            </span>
          )}
        </div>
      </div>
    );
  }
);

SignatureCanvas.displayName = "SignatureCanvas";
export default SignatureCanvas;
