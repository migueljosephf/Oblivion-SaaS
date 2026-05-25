const prisma = require('../config/database');

/**
 * Get all sales
 * @route GET /api/sales
 */
const getSales = async (req, res) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 20 } = req.query;

    const where = {
      businessId: req.user.businessId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (status) {
      where.status = status;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.sale.count({ where });

    res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales',
    });
  }
};

/**
 * Get single sale
 * @route GET /api/sales/:id
 */
const getSale = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
    });
  }
};

/**
 * Create sale
 * @route POST /api/sales
 */
const createSale = async (req, res) => {
  try {
    const { items, paymentMethod, discount = 0, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sale must have at least one item',
      });
    }

    // Calculate totals and validate stock
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      });
    }

    const tax = 0; // Add tax logic if needed
    const total = subtotal + tax - discount;

    // Generate sale number
    const saleCount = await prisma.sale.count({
      where: { businessId: req.user.businessId },
    });
    const saleNumber = `SALE-${String(saleCount + 1).padStart(6, '0')}`;

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        businessId: req.user.businessId,
        userId: req.user.id,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        notes,
        items: {
          create: saleItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of sale.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      // Create inventory movement
      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          userId: req.user.id,
          type: 'SALE',
          quantity: -item.quantity,
          previousStock: item.product.stock + item.quantity,
          newStock: item.product.stock,
          reason: `Sale ${sale.saleNumber}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale,
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sale',
    });
  }
};

/**
 * Cancel sale
 * @route POST /api/sales/:id/cancel
 */
const cancelSale = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    if (sale.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Sale is already cancelled',
      });
    }

    // Restore product stock
    for (const item of sale.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });

      // Create inventory movement
      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          userId: req.user.id,
          type: 'RETURN',
          quantity: item.quantity,
          previousStock: item.quantity - 1, // Approximate
          newStock: item.quantity,
          reason: `Sale cancellation ${sale.saleNumber}`,
        },
      });
    }

    // Update sale status
    await prisma.sale.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({
      success: true,
      message: 'Sale cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling sale',
    });
  }
};

module.exports = {
  getSales,
  getSale,
  createSale,
  cancelSale,
};
