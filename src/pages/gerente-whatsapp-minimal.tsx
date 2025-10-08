import React from 'react';
import { Button } from '@/components/ui/button';

export default function GerenteWhatsAppMinimalPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Business - Teste</h1>
      
      <div className="space-y-4">
        <Button 
          onClick={() => alert('Botão Conectar WhatsApp clicado!')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Conectar WhatsApp
        </Button>
        
        <Button 
          onClick={() => alert('Botão Desconectar clicado!')}
          variant="outline"
        >
          Desconectar
        </Button>
        
        <Button 
          onClick={() => alert('Botão Verificar Status clicado!')}
          variant="outline"
        >
          Verificar Status
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p>Esta é uma versão minimal para teste.</p>
        <p>Se você vê este texto e os botões acima, a página está funcionando.</p>
      </div>
    </div>
  );
}





