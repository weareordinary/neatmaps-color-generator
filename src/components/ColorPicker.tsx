import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ColorPickerProps {
  className: string;
  color: string;
  onColorChange: (className: string, color: string) => void;
  onRemove?: (className: string) => void;  // Make it optional and accept string
  showRemove?: boolean;
}

export function ColorPicker({
  className,
  color,
  onColorChange,
  onRemove,
  showRemove = true,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id={className}
          type="color"
          value={color}
          onChange={(e) => onColorChange(className, e.target.value)}
          className="h-12 cursor-pointer flex-1"
        />
        {showRemove && (
          <Button
            variant="outline"
            className="h-12 w-12 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            onClick={() => onRemove(className)}
          >
            <Trash2 className="h-4 w-4"/>
          </Button>
        )}
      </div>
      <Input
        type="text"
        value={color}
        onChange={(e) => onColorChange(className, e.target.value)}
        placeholder="#000000"
        className="font-mono"
      />
    </div>
  );
}
