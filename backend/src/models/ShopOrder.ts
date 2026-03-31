import { eq, inArray, sql } from 'drizzle-orm';
import { db, shopOrders, shopOrderItems, products } from '../db';

export const checkoutSession = async (data: {
    userId: string;
    items: { productId: string; quantity: number }[];
}) => {
    // 1. Validate stock and calculate total
    const productIds = data.items.map(i => i.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
    
    if (dbProducts.length !== productIds.length) {
        throw new Error('Some products in the cart were not found');
    }

    let totalAmount = 0;
    const orderItemsRecord: any[] = [];

    // Begin pseudo-transaction processing
    for (const item of data.items) {
        const product = dbProducts.find(p => p.id === item.productId);
        if (!product) continue;
        
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const price = parseFloat(product.price);
        totalAmount += price * item.quantity;
        
        orderItemsRecord.push({
            productId: product.id,
            quantity: item.quantity,
            priceAtPurchase: price.toString()
        });
    }

    // 2. Insert Order
    const [order] = await db.insert(shopOrders).values({
        userId: data.userId,
        totalAmount: totalAmount.toFixed(2),
        status: 'PENDING'
    }).returning();

    // 3. Insert Order Items and Update Stock
    const itemsToInsert = orderItemsRecord.map(rec => ({
        ...rec,
        orderId: order.id
    }));

    await db.insert(shopOrderItems).values(itemsToInsert);

    for (const item of data.items) {
        await db.update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(eq(products.id, item.productId));
    }

    return order;
};

export const getUserOrders = async (userId: string) => {
    return db.select().from(shopOrders).where(eq(shopOrders.userId, userId));
};
