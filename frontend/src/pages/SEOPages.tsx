// Additional pages for better SEO
import { useState } from 'react';
import { useDocumentHead } from "../hooks/useDocumentHead";
import { Link } from "react-router-dom";
import {
    Video,
    Monitor,
    Edit,
    Share2,
    Shield,
    Download,
    Zap,
    CheckCircle,
    ArrowRight,
} from "lucide-react";

export function FeaturesPage() {
    useDocumentHead({
        title: "Features - ScreenForge | Comprehensive Screen Recording Tool",
        description:
            "Explore ScreenForge's powerful features: screen recording, video editing, AI captions, secure sharing, and download controls. Everything you need for professional screen capture.",
        keywords:
            "screen recording features, video editing tools, AI captions, screen capture software, video sharing, download controls",
        canonicalUrl: "https://screenforge.app/features",
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center space-x-2">
                            <Video className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold">
                                ScreenForge
                            </span>
                        </Link>
                        <nav className="flex space-x-6">
                            <Link
                                to="/features"
                                className="text-blue-600 font-medium"
                            >
                                Features
                            </Link>
                            <Link
                                to="/pricing"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Pricing
                            </Link>
                            <Link
                                to="/help"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Help
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Powerful Features for
                        <span className="text-blue-600">
                            {" "}
                            Professional Recording
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        ScreenForge combines advanced screen recording
                        capabilities with intelligent editing tools and secure
                        sharing options to create the ultimate screen capture
                        experience.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Monitor,
                                title: "Multi-Source Recording",
                                description:
                                    "Record browser tabs, application windows, or entire desktop with high-quality capture up to 4K resolution.",
                            },
                            {
                                icon: Edit,
                                title: "Built-in Video Editor",
                                description:
                                    "Trim, cut, and edit your recordings without leaving the app. Professional editing tools at your fingertips.",
                            },
                            {
                                icon: Zap,
                                title: "AI-Powered Captions",
                                description:
                                    "Automatically generate accurate captions and subtitles using advanced AI speech recognition technology.",
                            },
                            {
                                icon: Share2,
                                title: "Smart Sharing Options",
                                description:
                                    "Share via direct download, social media integration, or secure shareable links with custom permissions.",
                            },
                            {
                                icon: Shield,
                                title: "Advanced Security",
                                description:
                                    "Control who can view and download your videos with granular permission settings and expiration dates.",
                            },
                            {
                                icon: Download,
                                title: "Download Controls",
                                description:
                                    "Enable or disable download permissions per video to maintain complete control over your content distribution.",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Experience Professional Screen Recording?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of professionals who trust ScreenForge
                        for their screen recording needs.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

export function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false);

    useDocumentHead({
        title: "Pricing - ScreenForge | Affordable Screen Recording Plans",
        description:
            "Choose the perfect ScreenForge plan for your needs. Free tier available with unlimited recordings. Pro features for advanced users and teams.",
        keywords:
            "screen recording pricing, video recording plans, ScreenForge cost, free screen recorder, professional recording software",
        canonicalUrl: "https://screenforge.app/pricing",
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center space-x-2">
                            <Video className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold">
                                ScreenForge
                            </span>
                        </Link>
                        <nav className="flex space-x-6">
                            <Link
                                to="/features"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Features
                            </Link>
                            <Link
                                to="/pricing"
                                className="text-blue-600 font-medium"
                            >
                                Pricing
                            </Link>
                            <Link
                                to="/help"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Help
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Simple, Transparent
                        <span className="text-blue-600"> Pricing</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Start for free and upgrade when you need more features.
                        No hidden fees, no surprises.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mb-12">
                        <span
                            className={`mr-3 ${
                                !isAnnual
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500"
                            }`}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isAnnual ? "bg-blue-600" : "bg-gray-200"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isAnnual ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                        <span
                            className={`ml-3 ${
                                isAnnual
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500"
                            }`}
                        >
                            Annual
                        </span>
                        <span className="ml-2 text-sm text-green-600 font-medium">
                            Save 20%
                        </span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Plan */}
                        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Free
                            </h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Unlimited recordings",
                                    "Basic editing tools",
                                    "1080p quality",
                                    "5GB storage",
                                    "Public sharing",
                                ].map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                Get Started Free
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Pro
                            </h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">
                                    ${isAnnual ? "15" : "19"}
                                </span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Everything in Free",
                                    "4K recording quality",
                                    "AI-powered captions",
                                    "Advanced editing tools",
                                    "100GB storage",
                                    "Private sharing",
                                    "Download controls",
                                    "Priority support",
                                ].map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Start Pro Trial
                            </button>
                        </div>

                        {/* Team Plan */}
                        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Team
                            </h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">
                                    ${isAnnual ? "39" : "49"}
                                </span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Everything in Pro",
                                    "Team collaboration",
                                    "Admin dashboard",
                                    "Unlimited storage",
                                    "Advanced analytics",
                                    "Custom branding",
                                    "SSO integration",
                                    "Dedicated support",
                                ].map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
