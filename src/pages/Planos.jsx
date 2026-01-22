
import React from 'react';
import { PaymentService } from '@/lib/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PlanosPage() {
    const plans = PaymentService.getPlans();

    const handleSubscribe = (planId) => {
        // In a real scenario, you'd get the current user ID here
        PaymentService.subscribeToPlan(planId, 'user_id_placeholder', 'user@example.com');
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha o plano ideal para sua construtora</h1>
                <p className="text-xl text-gray-600">Gerencie suas obras com eficiência e profissionalismo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`relative flex flex-col ${plan.recommended ? 'border-2 border-orange-500 shadow-xl scale-105 z-10' : 'border border-gray-200'}`}>
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 text-sm uppercase tracking-wide">
                                    Recomendado
                                </Badge>
                            </div>
                        )}
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                            <div className="mt-4 flex items-baseline justify-center">
                                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-gray-500 ml-1">{plan.period}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 pt-6">
                            <ul className="space-y-4">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <Check className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                                        <span className="text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-6">
                            <Button
                                className={`w-full h-12 text-lg font-semibold ${plan.recommended ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                variant={plan.recommended ? 'default' : 'outline'}
                                onClick={() => handleSubscribe(plan.id)}
                            >
                                Começar Agora
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Precisa de um plano personalizado?</h3>
                <p className="text-gray-600 mb-6">Para grandes construtoras com necessidades específicas, temos planos Enterprise sob medida.</p>
                <Button variant="outline" className="border-gray-300">Entre em Contato</Button>
            </div>
        </div>
    );
}
