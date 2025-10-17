import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Send, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface AISuggestionPanelProps {
  leadId: string;
  lastInteraction?: {
    descricao: string;
    data_interacao: string;
  };
  onSendSuggestion?: (message: string) => void;
}

export function AISuggestionPanel({
  leadId,
  lastInteraction,
  onSendSuggestion,
}: AISuggestionPanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Extrair sugestão da IA da descrição da interação
  const extractAISuggestion = (
    descricao: string
  ): { score: number; suggestion: string; intencao: string } | null => {
    if (!descricao.includes('🤖 IA Analysis')) return null;

    const scoreMatch = descricao.match(/Score:\s*(\d+)\/100/);
    const suggestionMatch = descricao.match(
      /💡 Sugestão de resposta:\s*\n([\s\S]+?)(?:\n\n|$)/
    );
    const intencaoMatch = descricao.match(/Intenção:\s*(.+?)(?:\n|$)/);

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      suggestion: suggestionMatch ? suggestionMatch[1].trim() : '',
      intencao: intencaoMatch ? intencaoMatch[1].trim() : '',
    };
  };

  const aiData = lastInteraction
    ? extractAISuggestion(lastInteraction.descricao)
    : null;

  if (!aiData || !aiData.suggestion) {
    return null; // Não mostrar se não há sugestão da IA
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(aiData.suggestion);
    setCopied(true);
    toast({
      title: 'Copiado!',
      description: 'Sugestão de resposta copiada para a área de transferência',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseSuggestion = () => {
    if (onSendSuggestion) {
      onSendSuggestion(aiData.suggestion);
    }
  };

  // Cor do score
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 41) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return '🔥 Lead Quente';
    if (score >= 41) return '🟡 Lead Morno';
    return '🧊 Lead Frio';
  };

  return (
    <Card className='border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2'>
          <div className='p-1.5 bg-purple-500 rounded-lg'>
            <Sparkles className='h-4 w-4 text-white' />
          </div>
          Assistente IA
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Score do Lead */}
        <div className='flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-purple-600' />
            <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Qualificação:
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className={getScoreColor(aiData.score)}>
              {getScoreLabel(aiData.score)}
            </Badge>
            <span className='text-xl font-bold text-purple-700 dark:text-purple-300'>
              {aiData.score}/100
            </span>
          </div>
        </div>

        {/* Intenção do Cliente */}
        {aiData.intencao && (
          <div className='p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg'>
            <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1'>
              Intenção Detectada:
            </p>
            <p className='text-sm text-gray-900 dark:text-white'>
              {aiData.intencao}
            </p>
          </div>
        )}

        {/* Sugestão de Resposta */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold text-purple-700 dark:text-purple-300'>
              💡 Sugestão de Resposta:
            </p>
            <Button
              size='sm'
              variant='ghost'
              onClick={handleCopy}
              className='h-7 text-xs'
            >
              <Copy className='h-3 w-3 mr-1' />
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>

          <div className='p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-700'>
            <p className='text-sm text-gray-900 dark:text-white whitespace-pre-wrap'>
              {aiData.suggestion}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={handleCopy}
              className='flex-1'
            >
              <Copy className='h-4 w-4 mr-2' />
              Copiar
            </Button>
            {onSendSuggestion && (
              <Button
                size='sm'
                onClick={handleUseSuggestion}
                className='flex-1 bg-purple-600 hover:bg-purple-700 text-white'
              >
                <Send className='h-4 w-4 mr-2' />
                Usar Sugestão
              </Button>
            )}
          </div>
        </div>

        {/* Dica */}
        <div className='text-xs text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/20 p-2 rounded'>
          <Sparkles className='h-3 w-3 inline mr-1' />
          Você pode editar a sugestão antes de enviar
        </div>
      </CardContent>
    </Card>
  );
}



