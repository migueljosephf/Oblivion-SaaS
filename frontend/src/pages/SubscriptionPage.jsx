import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import {
  CreditCard,
  Check,
  X,
  Zap,
  Crown,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const SubscriptionPage = () => {
  const { business } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        subscriptionAPI.getSubscription(),
        subscriptionAPI.getPlans(),
      ]);
      setSubscription(subRes.data.data);
      setPlans(plansRes.data.data);
    } catch (error) {
      toast.error('Error al cargar información de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setProcessing(true);
    try {
      const response = await subscriptionAPI.createSubscription({ plan: plan.id });
      window.location.href = response.data.data.approvalUrl;
    } catch (error) {
      toast.error('Error al iniciar suscripción');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('¿Estás seguro de cancelar tu suscripción?')) {
      try {
        await subscriptionAPI.cancelSubscription();
        toast.success('Suscripción cancelada');
        fetchData();
      } catch (error) {
        toast.error('Error al cancelar suscripción');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'TRIAL':
        return 'Prueba gratuita';
      case 'EXPIRED':
        return 'Expirada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const isTrial = subscription?.status === 'TRIAL';
  const trialDaysLeft = isTrial
    ? Math.ceil((new Date(subscription.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Suscripción
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu plan de suscripción
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Plan actual
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  subscription.status
                )}`}
              >
                {getStatusLabel(subscription.status)}
              </span>
            </div>
            {subscription.status === 'ACTIVE' && (
              <Button variant="danger" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {subscription.plan === 'PREMIUM' ? 'Premium' : 'Básico'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inicio</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {new Date(subscription.startDate).toLocaleDateString('es-DO')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fin</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {new Date(subscription.endDate).toLocaleDateString('es-DO')}
              </p>
            </div>
          </div>

          {isTrial && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Prueba gratuita activa
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {trialDaysLeft} días restantes
                  </p>
                </div>
              </div>
            </div>
          )}

          {subscription.status === 'EXPIRED' && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Suscripción expirada
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Renueva tu suscripción para continuar usando el servicio
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Elige tu plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 relative ${
                plan.popular ? 'border-2 border-primary-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {plan.id === 'premium' ? (
                  <Crown className="w-8 h-8 text-primary-600" />
                ) : (
                  <Zap className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.interval}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">/mes</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan)}
                loading={processing}
                className="w-full"
                variant={plan.popular ? 'primary' : 'secondary'}
              >
                {subscription?.status === 'ACTIVE' && subscription?.plan === plan.id.toUpperCase()
                  ? 'Plan actual'
                  : 'Suscribirse'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preguntas frecuentes
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              ¿Puedo cambiar de plan?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sí, puedes cambiar de plan en cualquier momento desde esta página.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              ¿Qué incluye la prueba gratuita?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              La prueba gratuita de 30 días incluye acceso completo a todas las funciones del plan Básico.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              ¿Cómo cancelo mi suscripción?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Puedes cancelar tu suscripción en cualquier momento desde esta página. No hay penalizaciones.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SubscriptionPage;
