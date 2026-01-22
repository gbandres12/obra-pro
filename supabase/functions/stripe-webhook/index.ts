
// Supabase Edge Function to handle Stripe Webhooks
// Path: supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        let event

        // Verify signature
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                webhookSecret,
                undefined,
                cryptoProvider
            )
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(err.message, { status: 400 })
        }

        // Connect to Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Handle events
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.client_reference_id
                const customerId = session.customer

                if (userId) {
                    // Update profile with Stripe Customer ID
                    await supabase
                        .from('profiles')
                        .update({
                            stripe_customer_id: customerId,
                            subscription_status: 'active',
                            plan_tier: session.metadata?.plan_type || 'pro'
                        })
                        .eq('id', userId)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object
                const customerId = subscription.customer

                // Find user by stripe_customer_id
                await supabase
                    .from('profiles')
                    .update({
                        subscription_status: subscription.status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
                    })
                    .eq('stripe_customer_id', customerId)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const customerId = subscription.customer

                await supabase
                    .from('profiles')
                    .update({ subscription_status: 'canceled' })
                    .eq('stripe_customer_id', customerId)
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err) {
        console.error(`Error handling webhook: ${err.message}`)
        return new Response(err.message, { status: 400 })
    }
})
