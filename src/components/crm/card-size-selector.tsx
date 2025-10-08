import { memo } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid,
  Square,
  Minimize2,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CardSizeSelectorProps {
  currentSize: 'default' | 'compact' | 'mini';
  onSizeChange: (size: 'default' | 'compact' | 'mini') => void;
}

export const CardSizeSelector = memo(function CardSizeSelector({
  currentSize,
  onSizeChange
}: CardSizeSelectorProps) {
  const getIcon = (size: string) => {
    switch (size) {
      case 'default': return LayoutGrid;
      case 'compact': return Square;
      case 'mini': return Minimize2;
      default: return LayoutGrid;
    }
  };

  const getLabel = (size: string) => {
    switch (size) {
      case 'default': return 'Padrão';
      case 'compact': return 'Compacto';
      case 'mini': return 'Mini';
      default: return 'Padrão';
    }
  };

  const getDescription = (size: string) => {
    switch (size) {
      case 'default': return 'Cards com informações completas';
      case 'compact': return 'Cards otimizados para melhor visualização';
      case 'mini': return 'Cards ultra-compactos para máxima densidade';
      default: return 'Cards com informações completas';
    }
  };

  const CurrentIcon = getIcon(currentSize);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
          aria-label="Selecionar tamanho dos cards"
          title="Selecionar tamanho dos cards"
        >
          <CurrentIcon className="mr-2 h-4 w-4" />
          {getLabel(currentSize)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tamanho dos Cards
          </div>
        </div>
        
        {(['default', 'compact', 'mini'] as const).map((size) => {
          const Icon = getIcon(size);
          const isSelected = currentSize === size;
          
          return (
            <DropdownMenuItem 
              key={size}
              onClick={() => onSizeChange(size)}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                isSelected 
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isSelected 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                  {getLabel(size)}
                </div>
                <div className={`text-xs ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getDescription(size)}
                </div>
              </div>
              {isSelected && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});





