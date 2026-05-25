const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

/**
 * Create PayPal subscription plan
 * @param {Object} planData - Plan configuration
 * @returns {Promise<Object>} PayPal plan response
 */
const createPlan = async (planData) => {
  return new Promise((resolve, reject) => {
    paypal.billingPlan.create(planData, (error, plan) => {
      if (error) {
        reject(error);
      } else {
        resolve(plan);
      }
    });
  });
};

/**
 * Activate PayPal plan
 * @param {String} planId - PayPal plan ID
 * @returns {Promise<Object>} Activation response
 */
const activatePlan = async (planId) => {
  return new Promise((resolve, reject) => {
    paypal.billingPlan.update(planId, { state: 'ACTIVE' }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

/**
 * Create PayPal subscription agreement
 * @param {Object} agreementData - Agreement configuration
 * @returns {Promise<Object>} PayPal agreement response
 */
const createAgreement = async (agreementData) => {
  return new Promise((resolve, reject) => {
    paypal.billingAgreement.create(agreementData, (error, agreement) => {
      if (error) {
        reject(error);
      } else {
        resolve(agreement);
      }
    });
  });
};

/**
 * Execute PayPal agreement
 * @param {String} token - PayPal approval token
 * @returns {Promise<Object>} Executed agreement
 */
const executeAgreement = async (token) => {
  return new Promise((resolve, reject) => {
    paypal.billingAgreement.execute(token, {}, (error, agreement) => {
      if (error) {
        reject(error);
      } else {
        resolve(agreement);
      }
    });
  });
};

module.exports = {
  createPlan,
  activatePlan,
  createAgreement,
  executeAgreement,
};
