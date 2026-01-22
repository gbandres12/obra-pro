
// Mock implementation of a Payment Service (Stripe Wrapper)
// In production, this would communicate with your Backend or Supabase Edge Functions

export const PaymentService = {
    // Redirect to Stripe Checkout
    subscribeToPlan: async (planId, userId, userEmail) => {
        console.log(`Starting checkout for plan ${planId} user ${userId}`);

        // In a real app, you would call your backend endpoint here:
        // const { sessionId } = await api.post('/create-checkout-session', { planId });
        // stripe.redirectToCheckout({ sessionId });

        // For this prototype/local version, we'll simulate a redirect to a hosted payment page or show a success message
        // You can replace these URLs with your real Stripe Payment Links
        const paymentLinks = {
            'price_starter': 'https://buy.stripe.com/test_starter', // Replace with real link
            'price_pro': 'https://buy.stripe.com/test_pro',         // Replace with real link
            'price_enterprise': 'https://buy.stripe.com/test_ent'   // Replace with real link
        };

        const link = paymentLinks[planId] || paymentLinks['price_starter'];

        // Simulate redirection
        window.open(link, '_blank');

        return { success: true };
    },

    // Redirect to Stripe Customer Portal
    manageSubscription: async () => {
        console.log('Redirecting to billing portal...');
        // Real implementation:
        // const { url } = await api.post('/create-portal-session');
        // window.location.href = url;

        alert('Em produção, isso redirecionaria para o Portal do Cliente Stripe.');
    },

    getPlans: () => [
        {
            id: 'price_starter',
            name: 'Starter',
            price: 'R$ 49,90',
            period: '/mês',
            features: ['Até 2 Obras', '3 Usuários', 'Suporte Básico'],
            recommended: false
        },
        {
            id: 'price_pro',
            name: 'Pro',
            price: 'R$ 99,90',
            period: '/mês',
            features: ['Até 10 Obras', 'Usuários Ilimitados', 'Gestão Financeira Completa', 'Relatórios Avançados'],
            recommended: true
        },
        {
            id: 'price_enterprise',
            name: 'Business',
            price: 'R$ 199,90',
            period: '/mês',
            features: ['Obras Ilimitadas', 'API de Integração', 'Gerente de Contas', 'Prioridade no Suporte'],
            recommended: false
        }
    ]
};
