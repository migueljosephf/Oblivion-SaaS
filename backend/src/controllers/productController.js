const prisma = require('../config/database');

/**
 * Get all products
 * @route GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock, page = 1, limit = 20 } = req.query;

    const where = {
      businessId: req.user.businessId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (lowStock === 'true') {
      where.stock = {
        lte: prisma.product.fields.minStock,
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.product.count({ where });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};

/**
 * Get single product
 * @route GET /api/products/:id
 */
const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        inventoryMovements: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

/**
 * Create product
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      barcode,
      sku,
      price,
      cost,
      stock,
      minStock,
      categoryId,
      imageUrl,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        barcode,
        sku,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        categoryId,
        businessId: req.user.businessId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    // Create inventory movement
    if (stock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          userId: req.user.id,
          type: 'PURCHASE',
          quantity: parseInt(stock),
          previousStock: 0,
          newStock: parseInt(stock),
          reason: 'Initial stock',
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
    });
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      barcode,
      sku,
      price,
      cost,
      stock,
      minStock,
      categoryId,
      imageUrl,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        barcode,
        sku,
        price: price ? parseFloat(price) : existingProduct.price,
        cost: cost ? parseFloat(cost) : existingProduct.cost,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        minStock: minStock !== undefined ? parseInt(minStock) : existingProduct.minStock,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    // Create inventory movement if stock changed
    if (stock !== undefined && parseInt(stock) !== existingProduct.stock) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          userId: req.user.id,
          type: 'ADJUSTMENT',
          quantity: parseInt(stock) - existingProduct.stock,
          previousStock: existingProduct.stock,
          newStock: parseInt(stock),
          reason: 'Stock adjustment',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
    });
  }
};

/**
 * Delete product (soft delete)
 * @route DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
    });
  }
};

/**
 * Adjust stock
 * @route POST /api/products/:id/adjust-stock
 */
const adjustStock = async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const newStock = product.stock + parseInt(quantity);

    await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: newStock },
    });

    // Create inventory movement
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        userId: req.user.id,
        type: quantity > 0 ? 'PURCHASE' : 'LOSS',
        quantity: parseInt(quantity),
        previousStock: product.stock,
        newStock,
        reason: reason || 'Stock adjustment',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { newStock },
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adjusting stock',
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
};
