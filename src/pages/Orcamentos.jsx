import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export default function OrcamentosPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
            </div>

            <Card className="p-12 text-center">
                <Calculator className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Modulo de Orçamentos em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                    Esta funcionalidade estará disponível em breve para ajudar você a orçar suas obras com precisão.
                </p>
            </Card>
        </div>
    );
}
