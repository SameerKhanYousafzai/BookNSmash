import { Router, Request, Response } from 'express';
import {
    createProduct,
    getAllProducts,
    findProductById,
    updateProduct,
    deleteProduct
} from '../models/Product';
import { authenticate, authorize } from '../middleware/auth';

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

export default router;
