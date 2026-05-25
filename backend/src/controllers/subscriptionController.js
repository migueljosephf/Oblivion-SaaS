const prisma = require('../config/database');
const { createPlan, activatePlan, createAgreement, executeAgreement } = require('../config/paypal');

/**
 * Get current subscription
 * @route GET /api/subscription
 */
const getSubscription = async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { businessId: req.user.businessId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
    }

    // Check if trial has expired
    if (subscription.status === 'TRIAL' && subscription.trialEndDate) {
      if (new Date() > new Date(subscription.trialEndDate)) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });
        subscription.status = 'EXPIRED';
      }
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
    });
  }
};

/**
 * Get pricing plans
 * @route GET /api/subscription/plans
 */
const getPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Plan Básico',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Hasta 100 productos',
          '1 usuario',
          'Ventas ilimitadas',
          'Reportes básicos',
          'Soporte por email',
        ],
      },
      {
        id: 'premium',
        name: 'Plan Premium',
        price: 79.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Productos ilimitados',
          'Hasta 5 usuarios',
          'Ventas ilimitadas',
          'Reportes avanzados',
          'Soporte prioritario',
          'Exportación de datos',
          'API access',
        ],
        popular: true,
      },
    ];

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
    });
  }
};

/**
 * Create PayPal subscription
 * @route POST /api/subscription/create
 */
const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body; // 'basic' or 'premium'

    const planPrice = plan === 'premium' ? 79.99 : 29.99;
    const planName = plan === 'premium' ? 'Premium Plan' : 'Basic Plan';

    // Create PayPal plan
    const paypalPlan = {
      name: planName,
      description: `${planName} - Monthly subscription`,
      type: 'INFINITE',
      payment_definitions: [
        {
          name: `Regular payment for ${planName}`,
          type: 'REGULAR',
          frequency: 'Month',
          frequency_interval: '1',
          cycles: '0',
          amount: {
            currency: 'USD',
            value: planPrice,
          },
        },
      ],
      merchant_preferences: {
        setup_fee: {
          currency: 'USD',
          value: '0',
        },
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
        max_fail_attempts: '3',
        auto_bill_amount: 'YES',
        initial_fail_amount_action: 'CONTINUE',
      },
    };

    const createdPlan = await createPlan(paypalPlan);
    await activatePlan(createdPlan.id);

    // Create billing agreement
    const agreement = {
      name: planName,
      description: `${planName} - Monthly subscription`,
      start_date: new Date(Date.now() + 3600000).toISOString(), // Start in 1 hour
      plan: {
        id: createdPlan.id,
      },
      payer: {
        payment_method: 'paypal',
      },
    };

    const createdAgreement = await createAgreement(agreement);

    res.status(200).json({
      success: true,
      data: {
        approvalUrl: createdAgreement.links.find(
          (link) => link.rel === 'approval_url'
        ).href,
      },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
    });
  }
};

/**
 * Execute PayPal subscription
 * @route POST /api/subscription/execute
 */
const executeSubscription = async (req, res) => {
  try {
    const { token, plan } = req.body;

    // Execute agreement
    const agreement = await executeAgreement(token);

    // Update subscription in database
    const subscription = await prisma.subscription.upsert({
      where: { businessId: req.user.businessId },
      update: {
        plan: plan.toUpperCase(),
        status: 'ACTIVE',
        paypalSubscriptionId: agreement.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        businessId: req.user.businessId,
        plan: plan.toUpperCase(),
        status: 'ACTIVE',
        paypalSubscriptionId: agreement.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan === 'premium' ? 79.99 : 29.99,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'PAYPAL',
        paypalOrderId: agreement.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Execute subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing subscription',
    });
  }
};

/**
 * Cancel subscription
 * @route POST /api/subscription/cancel
 */
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { businessId: req.user.businessId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
    });
  }
};

module.exports = {
  getSubscription,
  getPlans,
  createSubscription,
  executeSubscription,
  cancelSubscription,
};
