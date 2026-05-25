# Oblivion SaaS - Plataforma de Gestión de Negocios

Una plataforma SaaS moderna y profesional para la gestión de pequeños negocios como colmados, minimarkets, tiendas, cafeterías, surtidoras, car wash y más.

## 🚀 Características

### Autenticación y Seguridad
- ✅ Registro y login de usuarios
- ✅ Autenticación JWT
- ✅ Recuperación de contraseña
- ✅ Roles de usuario (Admin y Empleado)
- ✅ Verificación de email

### Gestión de Negocio
- ✅ Información completa del negocio
- ✅ Configuración de horarios
- ✅ Logo personalizado
- ✅ Múltiples tipos de negocio

### Sistema de Inventario
- ✅ Gestión de productos
- ✅ Categorías personalizadas
- ✅ Control de stock
- ✅ Alertas de stock bajo
- ✅ Código de barras y SKU
- ✅ Historial de movimientos

### Punto de Venta (POS)
- ✅ Ventas rápidas
- ✅ Carrito de compras
- ✅ Múltiples métodos de pago
- ✅ Cálculo automático
- ✅ Historial de ventas

### Analíticas y Reportes
- ✅ Dashboard con métricas clave
- ✅ Gráficos de ventas
- ✅ Productos más vendidos
- ✅ Análisis de ingresos
- ✅ Reportes visuales

### Sistema de Suscripción SaaS
- ✅ Planes Básico y Premium
- ✅ Prueba gratuita de 30 días
- ✅ Integración con PayPal
- ✅ Renovación automática
- ✅ Gestión de suscripciones

### Diseño y UX
- ✅ Interfaz moderna y elegante
- ✅ Modo oscuro
- ✅ Diseño responsive
- ✅ Animaciones suaves
- ✅ Notificaciones en tiempo real
- ✅ Skeleton loading

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **PayPal SDK** - Pagos

### Frontend
- **React** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **React Router** - Routing
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd Oblivion-SaaS
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
```

### 3. Configurar Base de Datos
Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/oblivion_saas?schema=public"
```

### 4. Ejecutar Migraciones
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Configurar Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

### 6. Configurar PayPal (Opcional)
Edita el archivo `.env` del backend con tus credenciales de PayPal:
```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

## 🚀 Ejecutar la Aplicación

### Iniciar Backend
```bash
cd backend
npm run dev
```
El backend se ejecutará en `http://localhost:5000`

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
El frontend se ejecutará en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
Oblivion-SaaS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔐 Variables de Entorno

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://..."
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 📊 Modelos de Base de Datos

- **User** - Usuarios del sistema
- **Business** - Información del negocio
- **Subscription** - Suscripciones SaaS
- **Payment** - Historial de pagos
- **Category** - Categorías de productos
- **Product** - Productos del inventario
- **Sale** - Ventas realizadas
- **SaleItem** - Items de una venta
- **InventoryMovement** - Movimientos de stock

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### Negocio
- `GET /api/business` - Obtener información del negocio
- `PUT /api/business` - Actualizar negocio
- `GET /api/business/analytics` - Obtener analíticas

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `POST /api/products/:id/adjust-stock` - Ajustar stock

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Ventas
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta
- `GET /api/sales/:id` - Obtener detalle de venta
- `POST /api/sales/:id/cancel` - Cancelar venta

### Suscripción
- `GET /api/subscription` - Obtener suscripción actual
- `GET /api/subscription/plans` - Obtener planes disponibles
- `POST /api/subscription/create` - Crear suscripción PayPal
- `POST /api/subscription/execute` - Ejecutar suscripción
- `POST /api/subscription/cancel` - Cancelar suscripción

## 🎨 Diseño

El diseño está inspirado en plataformas modernas como:
- Stripe
- Notion
- Shopify
- Vercel
- Linear

### Colores Principales
- **Primary**: Azul (#0ea5e9)
- **Dark**: Negro elegante (#0f172a)
- **Light**: Blanco (#ffffff)
- **Accent**: Gradientes modernos

## 🚀 Despliegue

### Backend (Railway/Heroku)
1. Configurar base de datos PostgreSQL
2. Configurar variables de entorno
3. Ejecutar migraciones
4. Desplegar

### Frontend (Vercel/Netlify)
1. Configurar variables de entorno
2. Conectar repositorio
3. Desplegar

## 📝 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor abre un issue o pull request.

## 📧 Soporte

Para soporte, envía un email a support@oblivionsaas.com

---

Desarrollado con ❤️ para pequeños negocios
