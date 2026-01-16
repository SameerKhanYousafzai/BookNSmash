import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Check, ChevronLeft, ChevronRight, Package, Truck, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { products } from '../../data/mockData';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = products.find(p => p.id === parseInt(id));

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!product) {
        return (
            <div className="container-custom py-16 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/shop')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shop
                </Button>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };

    const handleAddToCart = () => {
        if (product.sizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }
        if (product.colors.length > 0 && !selectedColor) {
            alert('Please select a color');
            return;
        }
        alert(`Added ${quantity} ${product.name} to cart!`);
    };

    return (
        <div className="pb-16">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container-custom py-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/shop')}
                        className="mb-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shop
                    </Button>
                    <div className="text-sm text-gray-600">
                        Shop / {product.category} / {product.name}
                    </div>
                </div>
            </div>

            <div className="container-custom py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div>
                        <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                            <img
                                src={product.images[currentImageIndex]}
                                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-900" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative h-24 rounded-lg overflow-hidden ${idx === currentImageIndex
                                            ? 'ring-4 ring-primary-500'
                                            : 'opacity-60 hover:opacity-100'
                                            } transition-all`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            <span className="text-sm font-semibold text-primary-600 uppercase">
                                {product.category}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600">
                                {product.rating} ({product.reviews} reviews)
                            </span>
                        </div>

                        <div className="text-4xl font-bold text-primary-600 mb-6">
                            PKR {product.price.toFixed(2)}
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-8">
                            {product.description}
                        </p>

                        <div className="space-y-6 mb-8">
                            {/* Size Selection */}
                            {product.sizes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Size
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${selectedSize === size
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection */}
                            {product.colors.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Color
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${selectedColor === color
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="space-y-3 mb-8">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                            <Button variant="outline" size="lg" className="w-full">
                                Buy Now
                            </Button>
                        </div>

                        {/* Features */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Truck className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Free Shipping</div>
                                        <div className="text-sm text-gray-600">On orders over PKR 50</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Secure Payment</div>
                                        <div className="text-sm text-gray-600">100% secure transactions</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Check className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Quality Guarantee</div>
                                        <div className="text-sm text-gray-600">30-day return policy</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Vendor Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Sold by <span className="font-semibold text-gray-900">{product.vendor}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
