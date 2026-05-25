import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { businessAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Card from '../components/Card';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { business } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await businessAPI.getAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Ingresos totales',
      value: analytics?.totalRevenue || 0,
      format: 'currency',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12.5%',
    },
    {
      name: 'Ventas hoy',
      value: analytics?.totalSales || 0,
      format: 'number',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: '+8.2%',
    },
    {
      name: 'Productos',
      value: business?._count?.products || 0,
      format: 'number',
      icon: Package,
      color: 'bg-purple-500',
      trend: '+5.1%',
    },
    {
      name: 'Stock bajo',
      value: analytics?.lowStockProducts?.length || 0,
      format: 'number',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      trend: '-2.3%',
      warning: true,
    },
  ];

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido, {business?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí está el resumen de tu negocio hoy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.warning ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {stat.trend.startsWith('+') ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatValue(stat.value, stat.format)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productos más vendidos
          </h3>
          <div className="space-y-4">
            {analytics?.topProducts?.slice(0, 5).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {product.quantity} vendidos
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Intl.NumberFormat('es-DO', {
                      style: 'currency',
                      currency: 'DOP',
                    }).format(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertas de stock bajo
          </h3>
          <div className="space-y-4">
            {analytics?.lowStockProducts?.length > 0 ? (
              analytics.lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      {product.stock} unidades
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mínimo: {product.minStock}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                No hay alertas de stock bajo
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Trial Banner */}
      {business?.subscription?.status === 'TRIAL' && (
        <Card className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Prueba gratuita activa
              </h3>
              <p className="text-primary-100">
                Tu prueba termina el{' '}
                {new Date(business.subscription.trialEndDate).toLocaleDateString('es-DO')}
              </p>
            </div>
            <button className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              Actualizar plan
            </button>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default DashboardPage;
