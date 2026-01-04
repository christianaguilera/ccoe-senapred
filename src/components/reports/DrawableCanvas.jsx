import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Upload,
  Undo,
  Square,
  Circle,
  Type
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DrawableCanvas({ onImageChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil'); // pencil, eraser, rectangle, circle, text
  const [color, setColor] = useState('#ff0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    if (backgroundImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(canvas.toDataURL());
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'text') {
      setTextPosition({ x, y });
      setTextMode(true);
      return;
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      if (onImageChange) {
        onImageChange(canvasRef.current.toDataURL());
      }
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep - 1];
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = backgroundImage;
    } else {
      saveToHistory();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setBackgroundImage(file_url);
        toast.success('Imagen cargada correctamente');
      } catch (error) {
        toast.error('Error al cargar la imagen');
      }
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'mapa-situacional.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleAddText = () => {
    if (textInput && textPosition) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.font = `${lineWidth * 8}px Arial`;
      ctx.fillStyle = color;
      ctx.fillText(textInput, textPosition.x, textPosition.y);
      setTextMode(false);
      setTextInput('');
      setTextPosition(null);
      saveToHistory();
      if (onImageChange) {
        onImageChange(canvas.toDataURL());
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100 rounded-lg">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={tool === 'pencil' ? 'default' : 'outline'}
            onClick={() => setTool('pencil')}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={tool === 'eraser' ? 'default' : 'outline'}
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={tool === 'text' ? 'default' : 'outline'}
            onClick={() => setTool('text')}
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-300" />

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <label className="text-xs font-medium">Grosor:</label>
          <Slider
            value={[lineWidth]}
            onValueChange={(value) => setLineWidth(value[0])}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
          <span className="text-xs font-medium w-8">{lineWidth}</span>
        </div>

        <div className="h-6 w-px bg-slate-300" />

        <Button size="sm" variant="outline" onClick={handleUndo} disabled={historyStep <= 0}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-slate-300" />

        <label htmlFor="image-upload">
          <Button size="sm" variant="outline" asChild>
            <span className="cursor-pointer">
              <Upload className="w-4 h-4 mr-1" />
              Cargar Imagen
            </span>
          </Button>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Button size="sm" variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-1" />
          Descargar
        </Button>
      </div>

      {/* Text Input Modal */}
      {textMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Escribe el texto..."
              className="flex-1"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddText();
              }}
            />
            <Button size="sm" onClick={handleAddText}>
              Agregar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTextMode(false);
                setTextInput('');
                setTextPosition(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-[500px] cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>

      <p className="text-xs text-slate-500 text-center">
        Carga una imagen de fondo y dibuja sobre ella usando las herramientas
      </p>
    </div>
  );
}