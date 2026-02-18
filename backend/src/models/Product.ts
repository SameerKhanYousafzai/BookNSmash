import { eq, ilike, and, desc } from 'drizzle-orm';
import { db, products } from '../db';

// Types derived from Drizzle schema
type Product = typeof products.$inferSelect;
type ProductInsert = typeof products.$inferInsert;

export const createProduct = async (data: ProductInsert): Promise<Product> => {
    const [product] = await db.insert(products).values(data).returning();
    console.log(`🛒 Product created in DB: ${product.id} (${product.name})`);
    return product;
};

export const findProductById = async (id: string): Promise<Product | undefined> => {
    const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

    return product;
};

export const getAllProducts = async (filters?: {
    category?: string;
    search?: string;
}): Promise<Product[]> => {
    const conditions = [];

    if (filters?.category) {
        conditions.push(eq(products.category, filters.category));
    }
    if (filters?.search) {
        conditions.push(ilike(products.name, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
        return db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
    }

    return db.select().from(products).orderBy(desc(products.createdAt));
};

export const updateProduct = async (
    id: string,
    data: Partial<Omit<ProductInsert, 'id' | 'createdAt'>>
): Promise<Product | null> => {
    const [updated] = await db
        .update(products)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

    return updated ?? null;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
};
