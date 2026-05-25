import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productsAPI, salesAPI } from '../services/api';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Printer,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ search });
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Stock insuficiente');
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          const product = products.find((p) => p.id === productId);
          if (newQuantity > product.stock) {
            toast.error('Stock insuficiente');
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      await salesAPI.createSale({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        discount: 0,
      });
      toast.success('Venta realizada exitosamente');
      setCart([]);
      setShowPaymentModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar venta');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Punto de Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Realiza ventas rápidas y eficientes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            placeholder="Buscar productos..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => addToCart(product)}
              >
                <div className="w-full h-32 bg-gray-100 dark:bg-dark-700 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price}
                  </span>
                  <span className={`text-xs ${
                    product.stock === 0
                      ? 'text-red-600'
                      : product.stock <= product.minStock
                      ? 'text-orange-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart */}
        <Card className="p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Carrito
            </h2>
            <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              {cart.length} items
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${item.price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-dark-600 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-dark-600 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-dark-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ITBIS:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-dark-700">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-primary-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full mt-6"
                size="lg"
              >
                Procesar venta
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Seleccionar método de pago"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'CASH', icon: DollarSign, label: 'Efectivo' },
              { value: 'CARD', icon: CreditCard, label: 'Tarjeta' },
              { value: 'TRANSFER', icon: Printer, label: 'Transferencia' },
              { value: 'PAYPAL', icon: ShoppingCart, label: 'PayPal' },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  paymentMethod === method.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                }`}
              >
                <method.icon className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                <p className="font-medium text-gray-900 dark:text-white">{method.label}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Total a pagar:
            </span>
            <span className="text-2xl font-bold text-primary-600">
              ${total.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCheckout}
              loading={processing}
              className="flex-1"
            >
              Confirmar pago
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default POSPage;
