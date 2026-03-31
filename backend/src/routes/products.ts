import { Router, Request, Response } from 'express';
import {
    createProduct,
    getAllProducts,
    findProductById,
    updateProduct,
    deleteProduct
} from '../models/Product';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../utils/validators';
import { checkoutSession, getUserOrders } from '../models/ShopOrder';

const router = Router();

// GET all products
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, search } = req.query;
        const products = await getAllProducts({
            category: category as string,
            search: search as string
        });

        console.log(`🛒 [GET /api/products] Found ${products.length} products in database`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({ products });
    } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET product by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await findProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST create product (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
    try {
        const product = await createProduct(req.body);
        res.status(201).json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT update product (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
    try {
        const product = await updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE product (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
    try {
        const success = await deleteProduct(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// POST /api/products/checkout - Process Cartesian Cart
router.post('/checkout', authenticate, validate(checkoutSchema), async (req: Request, res: Response) => {
    try {
        const payload = {
            userId: req.user!.userId,
            items: req.body.items,
        };
        const order = await checkoutSession(payload);
        res.status(201).json({ message: 'Checkout successful', order });
    } catch (error) {
        console.error('❌ Checkout failed:', error);
        res.status(400).json({ error: 'Checkout failed', message: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// GET /api/products/orders/me - Get my shop orders
router.get('/orders/me', authenticate, async (req: Request, res: Response) => {
    try {
        const orders = await getUserOrders(req.user!.userId);
        res.json({ orders });
    } catch (error) {
        console.error('❌ Failed to fetch user orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

export default router;
