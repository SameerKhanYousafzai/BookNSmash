import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        console.log("helo", formData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock form submission
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
                        Get In Touch
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions or need assistance? We're here to help! Reach out to us and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Email Card */}
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-primary-100 p-3 rounded-lg">
                                    <Mail className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Send us an email anytime
                                    </p>
                                    <a
                                        href="mailto:info@booknsmash.com"
                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                    >
                                        info@booknsmash.com
                                    </a>
                                </div>
                            </div>
                        </Card>

                        {/* Phone Card */}
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-secondary-100 p-3 rounded-lg">
                                    <Phone className="w-6 h-6 text-secondary-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Mon-Fri from 9am to 6pm
                                    </p>
                                    <a
                                        href="tel:+923042008421"
                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                    >
                                        +92 3042008421
                                    </a>
                                </div>
                            </div>
                        </Card>

                        {/* Location Card */}
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Come say hello at our office
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        Swenta Solutions<br />
                                        Karachi, Pakistan
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Send Us a Message
                            </h2>

                            {isSubmitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-green-900 mb-2">
                                        Message Sent Successfully!
                                    </h3>
                                    <p className="text-green-700">
                                        Thank you for contacting us. We'll get back to you soon.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="Muhammad Sameer Khan"
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="sameer@example.com"
                                        />
                                    </div>

                                    {/* Message Field */}
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Your Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="6"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Tell us how we can help you..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full py-3 text-base font-medium"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Send Message
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-3">Need Immediate Assistance?</h3>
                    <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                        For urgent matters or event-related inquiries, feel free to call us directly or visit our office during business hours.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="tel:+923001234567"
                            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
                        >
                            <Phone className="w-5 h-5 mr-2" />
                            Call Now
                        </a>
                        <a
                            href="mailto:info@booknsmash.com"
                            className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors inline-flex items-center border border-white/30"
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Email Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
