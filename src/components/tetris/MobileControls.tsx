
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  isPaused: boolean;
  onMove: (dx: number, dy: number) => void;
  onRotate: () => void;
  onStartKeyRepeat: (key: string, action: () => void) => void;
  onStopKeyRepeat: (key: string) => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  gameStarted,
  gameOver,
  isPaused,
  onMove,
  onRotate,
  onStartKeyRepeat,
  onStopKeyRepeat
}) => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 md:hidden">
      <CardContent className="p-4">
        <h3 className="text-white font-bold mb-3">Touch Controls</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onMouseDown={() => onStartKeyRepeat('ArrowLeft', () => onMove(-1, 0))}
            onMouseUp={() => onStopKeyRepeat('ArrowLeft')}
            onTouchStart={() => onStartKeyRepeat('ArrowLeft', () => onMove(-1, 0))}
            onTouchEnd={() => onStopKeyRepeat('ArrowLeft')}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={() => onStartKeyRepeat('ArrowRight', () => onMove(1, 0))}
            onMouseUp={() => onStopKeyRepeat('ArrowRight')}
            onTouchStart={() => onStartKeyRepeat('ArrowRight', () => onMove(1, 0))}
            onTouchEnd={() => onStopKeyRepeat('ArrowRight')}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div></div>
          <Button
            variant="outline"
            size="sm"
            onMouseDown={() => onStartKeyRepeat('ArrowDown', () => onMove(0, 1))}
            onMouseUp={() => onStopKeyRepeat('ArrowDown')}
            onTouchStart={() => onStartKeyRepeat('ArrowDown', () => onMove(0, 1))}
            onTouchEnd={() => onStopKeyRepeat('ArrowDown')}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileControls;
