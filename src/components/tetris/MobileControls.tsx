
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
    <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
      <CardContent className="p-2 sm:p-4">
        <h3 className="text-white font-bold mb-2 sm:mb-3 text-sm sm:text-base">Touch Controls</h3>
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onTouchStart={(e) => {
              e.preventDefault();
              onStartKeyRepeat('ArrowLeft', () => onMove(-1, 0));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onStopKeyRepeat('ArrowLeft');
            }}
            onMouseDown={() => onStartKeyRepeat('ArrowLeft', () => onMove(-1, 0))}
            onMouseUp={() => onStopKeyRepeat('ArrowLeft')}
            onMouseLeave={() => onStopKeyRepeat('ArrowLeft')}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50 h-10 sm:h-12 active:bg-purple-600/20"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onTouchStart={(e) => {
              e.preventDefault();
              onRotate();
            }}
            onClick={onRotate}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50 h-10 sm:h-12 active:bg-purple-600/20"
          >
            <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onTouchStart={(e) => {
              e.preventDefault();
              onStartKeyRepeat('ArrowRight', () => onMove(1, 0));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onStopKeyRepeat('ArrowRight');
            }}
            onMouseDown={() => onStartKeyRepeat('ArrowRight', () => onMove(1, 0))}
            onMouseUp={() => onStopKeyRepeat('ArrowRight')}
            onMouseLeave={() => onStopKeyRepeat('ArrowRight')}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50 h-10 sm:h-12 active:bg-purple-600/20"
          >
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <div></div>
          <Button
            variant="outline"
            size="sm"
            onTouchStart={(e) => {
              e.preventDefault();
              onStartKeyRepeat('ArrowDown', () => onMove(0, 1));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onStopKeyRepeat('ArrowDown');
            }}
            onMouseDown={() => onStartKeyRepeat('ArrowDown', () => onMove(0, 1))}
            onMouseUp={() => onStopKeyRepeat('ArrowDown')}
            onMouseLeave={() => onStopKeyRepeat('ArrowDown')}
            disabled={!gameStarted || gameOver || isPaused}
            className="border-purple-500/50 h-10 sm:h-12 active:bg-purple-600/20"
          >
            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileControls;
