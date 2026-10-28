import Stripe from "stripe";
import UserModel from "../models/user.model.js";
import { getClientUrl } from "../config/clientUrl.js";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const CREDIT_MAP = {
  100: 50,
  200: 120,
  500: 300,
};

const applyPaidSession = async (session, expectedUserId) => {
  if (session.payment_status !== "paid") return { paid: false };

  const userId = session.metadata?.userId;
  const creditsToAdd = Number(session.metadata?.credits);
  if (
    !userId ||
    (expectedUserId && userId !== expectedUserId) ||
    !session.id ||
    !Number.isSafeInteger(creditsToAdd) ||
    creditsToAdd <= 0
  ) {
    throw new Error("Invalid paid session metadata");
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: userId, processedStripeSessions: { $ne: session.id } },
    {
      $inc: { credits: creditsToAdd },
      $set: { isCreditAvailable: true },
      $addToSet: { processedStripeSessions: session.id },
    },
    { new: true },
  );

  if (user) return { paid: true };

  const existingUser = await UserModel.exists({ _id: userId });
  if (existingUser) return { paid: true };
  throw new Error("Checkout user not found");
};

export const createCreditsOrder = async (req, res) => {
  try {
    const stripe = getStripe();
    const userId = req.userId;
    const { amount } = req.body;

    if (!CREDIT_MAP[amount]) {
      return res.status(400).json({
        message: "Invalid credit plan",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${getClientUrl(req)}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getClientUrl(req)}/payment-failed`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${CREDIT_MAP[amount]} Credits`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        credits: CREDIT_MAP[amount],
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed:", error?.type || error?.name || "UnknownError");
    res.status(500).json({ message: "Stripe error" });
  }
};

export const confirmCreditsPurchase = async (req, res) => {
  try {
    const sessionId = req.body?.sessionId;
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return res.status(400).json({ message: "Invalid checkout session" });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const result = await applyPaidSession(session, req.userId);
    return res.status(200).json(result);
  } catch {
    return res.status(400).json({ message: "Unable to confirm payment" });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];

    let event;

    // Verify Stripe's signature using the original request body
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error("Stripe webhook signature verification failed");
      return res.status(400).send("Webhook signature verification failed");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await applyPaidSession(session);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed");
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
