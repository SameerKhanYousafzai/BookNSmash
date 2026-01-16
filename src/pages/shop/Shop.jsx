import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Star, ShoppingCart, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { products } from '../../data/mockData';

export default function Shop() {
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        priceRange: 'all',
        rating: 0,
    });

    const [cart, setCart] = useState([]);

    const filteredProducts = products.filter(product => {
        if (filters.category && product.category !== filters.category) return false;
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.priceRange === 'under50' && product.price >= 50) return false;
        if (filters.priceRange === '50to100' && (product.price < 50 || product.price > 100)) return false;
        if (filters.priceRange === 'over100' && product.price <= 100) return false;
        if (filters.rating && product.rating < filters.rating) return false;
        return true;
    });

    const categories = ['Equipment', 'Apparel', 'Accessories'];

    const addToCart = (product) => {
        setCart([...cart, product]);
        alert(`${product.name} added to cart!`);
    };

    return (
        <div className="container-custom py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                        Sports Shop
                    </h1>
                    <p className="text-gray-600">Quality equipment and apparel for every athlete</p>
                </div>
                <div className="relative">
                    <Button variant="primary" className="relative">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                                {cart.length}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Search className="w-4 h-4 inline mr-1" />
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search products..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price Range
                        </label>
                        <select
                            value={filters.priceRange}
                            onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">All Prices</option>
                            <option value="under50">Under PKR 50</option>
                            <option value="50to100">PKR 50 - PKR 100</option>
                            <option value="over100">Over PKR 100</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Rating
                        </label>
                        <select
                            value={filters.rating}
                            onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="0">Any Rating</option>
                            <option value="4.0">4.0+ Stars</option>
                            <option value="4.5">4.5+ Stars</option>
                            <option value="4.8">4.8+ Stars</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setFilters({ category: '', search: '', priceRange: 'all', rating: 0 })}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <Link to={`/shop/product/${product.id}`}>
                            <div className="relative h-56 rounded-t-xl overflow-hidden bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {!product.inStock && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-1 flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">{product.rating}</span>
                                </div>
                            </div>
                        </Link>
                        <div className="p-4">
                            <Link to={`/shop/product/${product.id}`}>
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-primary-600 uppercase">
                                        {product.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    by {product.vendor}
                                </p>
                            </Link>

                            <div className="flex items-center justify-between mb-3">
                                <div className="text-2xl font-bold text-primary-600">
                                    PKR {product.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {product.reviews} reviews
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => addToCart(product)}
                                disabled={!product.inStock}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your filters to see more products</p>
                </div>
            )}
        </div>
    );
}
