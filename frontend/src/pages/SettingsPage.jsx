import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { businessAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Lock,
  Save,
  Upload,
  Camera,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { business, updateBusiness } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    location: '',
    address: '',
    phone: '',
    rnc: '',
    businessType: '',
    schedule: '',
    logo: '',
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        ownerName: business.ownerName || '',
        location: business.location || '',
        address: business.address || '',
        phone: business.phone || '',
        rnc: business.rnc || '',
        businessType: business.businessType || '',
        schedule: business.schedule || '',
        logo: business.logo || '',
      });
    }
    fetchCategories();
  }, [business]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await businessAPI.updateBusiness(formData);
      updateBusiness({ ...business, ...formData });
      toast.success('Información actualizada');
    } catch (error) {
      toast.error('Error al actualizar información');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoriesAPI.createCategory({ name: categoryName });
      toast.success('Categoría creada');
      setCategoryName('');
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      toast.error('Error al crear categoría');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await categoriesAPI.deleteCategory(id);
        toast.success('Categoría eliminada');
        fetchCategories();
      } catch (error) {
        toast.error('Error al eliminar categoría');
      }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona la información de tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Info */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información del negocio
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-700 rounded-xl flex items-center justify-center overflow-hidden">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Button type="button" variant="secondary" size="sm">
                    <Upload className="w-4 h-4" />
                    Subir logo
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    PNG, JPG hasta 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del negocio"
                  icon={Building2}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Nombre del dueño"
                  icon={User}
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Localidad"
                  icon={MapPin}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <Input
                  label="Dirección"
                  icon={MapPin}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  icon={Phone}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Input
                  label="RNC (opcional)"
                  value={formData.rnc}
                  onChange={(e) => setFormData({ ...formData, rnc: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  label="Horario"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" loading={loading}>
                <Save className="w-4 h-4" />
                Guardar cambios
              </Button>
            </form>
          </Card>
        </div>

        {/* Categories */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Categorías
              </h2>
            </div>
            <Button size="sm" onClick={() => setShowCategoryModal(true)}>
              <Upload className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {category._count?.products || 0}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Lock className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No hay categorías
            </p>
          )}
        </Card>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setCategoryName('');
        }}
        title="Nueva categoría"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Nombre de la categoría"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCategoryModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default SettingsPage;
