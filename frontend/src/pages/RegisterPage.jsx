import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, MapPin, Phone, Store, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/Input';
import Button from '../components/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    businessName: '',
    ownerName: '',
    location: '',
    address: '',
    phone: '',
    businessType: 'COLMADO',
    schedule: 'Lun-Sab 8:00-20:00',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        businessData: {
          name: formData.businessName,
          ownerName: formData.ownerName,
          location: formData.location,
          address: formData.address,
          phone: formData.phone,
          businessType: formData.businessType,
          schedule: formData.schedule,
        },
      });
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    { value: 'COLMADO', label: 'Colmado' },
    { value: 'MINIMARKET', label: 'Minimarket' },
    { value: 'TIENDA', label: 'Tienda' },
    { value: 'CAFETERIA', label: 'Cafetería' },
    { value: 'SURTIDORA', label: 'Surtidora' },
    { value: 'CAR_WASH', label: 'Car Wash' },
    { value: 'OTRO', label: 'Otro' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Crea tu cuenta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comienza tu prueba gratuita de 30 días
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-700'
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-700'}`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-700'
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Input
                  label="Nombre completo"
                  type="text"
                  icon={User}
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Correo electrónico"
                  type="email"
                  icon={Mail}
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Contraseña"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Input
                  label="Nombre del negocio"
                  type="text"
                  icon={Building2}
                  placeholder="Mi Colmado"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />

                <Input
                  label="Nombre del dueño"
                  type="text"
                  icon={User}
                  placeholder="Juan Pérez"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />

                <Input
                  label="Localidad"
                  type="text"
                  icon={MapPin}
                  placeholder="Santo Domingo"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />

                <Input
                  label="Dirección"
                  type="text"
                  icon={MapPin}
                  placeholder="Calle Principal #123"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  icon={Phone}
                  placeholder="+1 (809) 555-1234"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de negocio
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    Crear cuenta
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
