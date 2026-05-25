const prisma = require('../config/database');

/**
 * Get business details
 * @route GET /api/business
 */
const getBusiness = async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId },
      include: {
        subscription: true,
        _count: {
          select: {
            users: true,
            products: true,
            sales: true,
          },
        },
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business data',
    });
  }
};

/**
 * Update business details
 * @route PUT /api/business
 */
const updateBusiness = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      location,
      address,
      phone,
      rnc,
      businessType,
      schedule,
      logo,
    } = req.body;

    const business = await prisma.business.update({
      where: { id: req.user.businessId },
      data: {
        name,
        ownerName,
        location,
        address,
        phone,
        rnc,
        businessType,
        schedule,
        logo,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Business updated successfully',
      data: business,
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating business',
    });
  }
};

/**
 * Get business analytics
 * @route GET /api/business/analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date();

    // Get sales data
    const sales = await prisma.sale.findMany({
      where: {
        businessId: req.user.businessId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = sales.length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Get top products
    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.subtotal;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        businessId: req.user.businessId,
        stock: {
          lte: prisma.product.fields.minStock,
        },
        isActive: true,
      },
      take: 10,
    });

    // Get sales by day
    const salesByDay = {};
    sales.forEach(sale => {
      const day = sale.createdAt.toISOString().split('T')[0];
      if (!salesByDay[day]) {
        salesByDay[day] = 0;
      }
      salesByDay[day] += sale.total;
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalSales,
        averageSale,
        topProducts,
        lowStockProducts,
        salesByDay,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
    });
  }
};

module.exports = {
  getBusiness,
  updateBusiness,
  getAnalytics,
};
