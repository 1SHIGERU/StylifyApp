
const stripe = require('stripe')('sk_test_51PAvWC1PDN4klyO59SYKxCjyRKIWIY4FGgzmYha6YOG3qYhypVd7WzmTAXofyMN36Kkz1uu1g4aHJfQK3bIEVE1z00oIKC7WzH');

exports.createCheckoutSession = async (req, res) =>{
    
    const {product} = req.body;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                        images: [product.OfferImages[0]?.imageUrl],
                    },
                    unit_amount: product.price * 100,
                },
            }],
        mode: 'payment',
        success_url: `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/payment/cancel`,
        metadata: {
            offer_id: product.offerID,
            seller_id: product.ownerID,
        },
    });

    res.json({id: session.id});
}

exports.getCheckoutSession = async (req, res) => {
    const { id } = req.params;
    try {
        const session = await stripe.checkout.sessions.retrieve(id);

        const lineItems = await stripe.checkout.sessions.listLineItems(id, {
            limit: 1,
        });

        res.json({
            session,
            lineItems: lineItems.data,
        });
    } catch (error) {
        res.status(400).json({ message: error.raw.message });
    }
};