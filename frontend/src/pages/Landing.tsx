import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import {
    Video,
    Monitor,
    Edit,
    Share2,
    Shield,
    Star,
    ArrowRight,
    PlayCircle,
    Sparkles,
    X,
} from "lucide-react";
import { HomeSEO } from "../components/SEOHead";

export function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already signed in
  useEffect(() => {
      if (isSignedIn) {
          navigate("/dashboard");
      }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowSignIn(false);
            setShowSignUp(false);
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const features = [
    {
      icon: Monitor,
      title: 'Flexible Recording',
      description: 'Record browser tabs, windows, or entire desktop with just a few clicks.',
      gradient: 'from-gray-700 to-gray-600'
    },
    {
      icon: Edit,
      title: 'Built-in Editor',
      description: 'Trim videos and add AI-generated captions without leaving the app.',
      gradient: 'from-gray-700 to-gray-600'
    },
    {
      icon: Share2,
      title: 'Smart Sharing',
      description: 'Share via direct download, social media, or secure shareable links.',
      gradient: 'from-gray-700 to-gray-600'
    },
    {
      icon: Shield,
      title: 'Download Control',
      description: 'Toggle download permissions per video for complete control over distribution.',
      gradient: 'from-gray-700 to-gray-600'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '2M+', label: 'Videos Created' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.9/5', label: 'User Rating' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'TechCorp',
      content: 'ScreenForge transformed how we create product demos. The built-in editor saves us hours of work.',
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Rodriguez',
      role: 'UX Designer',
      company: 'DesignStudio',
      content: 'The sharing controls are exactly what we needed. We can control who downloads our design reviews.',
      avatar: '👨‍🎨'
    },
    {
      name: 'Alex Thompson',
      role: 'Developer',
      company: 'StartupXYZ',
      content: 'Clean interface, powerful features. Perfect for creating tutorial content for our documentation.',
      avatar: '👨‍💻'
    }
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden relative">
          <HomeSEO />
          {/* Neon Background Grid System */}
          <div className="fixed inset-0 pointer-events-none z-0">
              {/* Horizontal flowing lines */}
              <div
                  className="neon-line neon-line-horizontal neon-primary absolute top-1/4 left-0 opacity-40 dark:opacity-100"
                  style={{ animationDelay: "0s" }}
              />
              <div
                  className="neon-line neon-line-horizontal neon-cyan absolute top-1/2 left-0 opacity-40 dark:opacity-100"
                  style={{ animationDelay: "4s" }}
              />
              <div
                  className="neon-line neon-line-horizontal neon-purple absolute top-3/4 left-0 opacity-40 dark:opacity-100"
                  style={{ animationDelay: "8s" }}
              />

              {/* Vertical flowing lines */}
              <div
                  className="neon-line neon-line-vertical neon-green absolute top-0 left-1/4 opacity-40 dark:opacity-100"
                  style={{ animationDelay: "2s" }}
              />
              <div
                  className="neon-line neon-line-vertical neon-pink absolute top-0 right-1/3 opacity-40 dark:opacity-100"
                  style={{ animationDelay: "6s" }}
              />
              <div
                  className="neon-line neon-line-vertical neon-orange absolute top-0 right-1/4 opacity-40 dark:opacity-100"
                  style={{ animationDelay: "10s" }}
              />

              {/* Orbital neon elements */}
              <div className="absolute top-1/3 left-1/3">
                  <div
                      className="neon-orbit neon-primary opacity-60 dark:opacity-100"
                      style={{ animationDelay: "0s" }}
                  />
              </div>
              <div className="absolute top-2/3 right-1/4">
                  <div
                      className="neon-orbit neon-purple opacity-60 dark:opacity-100"
                      style={{ animationDelay: "5s" }}
                  />
              </div>
              <div className="absolute bottom-1/4 left-1/2">
                  <div
                      className="neon-orbit neon-cyan opacity-60 dark:opacity-100"
                      style={{ animationDelay: "10s" }}
                  />
              </div>

              {/* Corner accent lines */}
              <div className="absolute top-0 left-0 w-32 h-0.5 bg-gradient-to-r from-primary-500 to-transparent neon-pulse opacity-70 dark:opacity-100" />
              <div className="absolute top-0 left-0 w-0.5 h-32 bg-gradient-to-b from-primary-500 to-transparent neon-pulse opacity-70 dark:opacity-100" />
              <div
                  className="absolute top-0 right-0 w-32 h-0.5 bg-gradient-to-l from-purple-500 to-transparent neon-pulse opacity-70 dark:opacity-100"
                  style={{ animationDelay: "1s" }}
              />
              <div
                  className="absolute top-0 right-0 w-0.5 h-32 bg-gradient-to-b from-purple-500 to-transparent neon-pulse opacity-70 dark:opacity-100"
                  style={{ animationDelay: "1s" }}
              />
              <div
                  className="absolute bottom-0 left-0 w-32 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent neon-pulse opacity-70 dark:opacity-100"
                  style={{ animationDelay: "2s" }}
              />
              <div
                  className="absolute bottom-0 left-0 w-0.5 h-32 bg-gradient-to-t from-cyan-500 to-transparent neon-pulse opacity-70 dark:opacity-100"
                  style={{ animationDelay: "2s" }}
              />
              <div
                  className="absolute bottom-0 right-0 w-32 h-0.5 bg-gradient-to-l from-green-500 to-transparent neon-pulse opacity-70 dark:opacity-100"
                  style={{ animationDelay: "3s" }}
              />
              <div
                  className="absolute bottom-0 right-0 w-0.5 h-32 bg-gradient-to-t from-green-500 to-transparent neon-pulse opacity-70 dark:opacity-100"
                  style={{ animationDelay: "3s" }}
              />
          </div>

          {/* Animated Background */}
          <div className="fixed inset-0 opacity-10 dark:opacity-20 z-1">
              <div
                  className="absolute w-96 h-96 bg-gradient-to-r from-primary-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"
                  style={{
                      left: mousePosition.x - 192,
                      top: mousePosition.y - 192,
                      transition: "all 0.3s ease-out",
                  }}
              />
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl animate-bounce" />
              <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Header */}
          <header
              className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
                  isScrolled
                      ? "navbar-scrolled glass-dark backdrop-blur-xl"
                      : "navbar-top bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50"
              }`}
          >
              <div className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                          <div className="relative">
                              <Video className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
                          </div>
                          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              ScreenForge
                          </span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4">
                          <button
                              onClick={() => setShowSignIn(true)}
                              className="text-gray-200 hover:text-gray-100 font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base px-2 sm:px-3 py-1"
                          >
                              Sign In
                          </button>
                          <button
                              onClick={() => setShowSignUp(true)}
                              className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full hover:shadow-lg hover:shadow-primary-500/25 font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                          >
                              Get Started
                          </button>
                      </div>
                  </div>
              </div>
          </header>

          {/* Hero Section */}
          <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
              <div
                  className="container mx-auto px-4 text-center relative z-10"
                  style={{ paddingTop: "1rem sm:2rem" }}
              >
                  <div
                      className={`transition-all duration-1000 ${
                          isVisible
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-8"
                      }`}
                  >
                      <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-full border border-primary-500/30 mb-6 sm:mb-8 mx-4">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600 dark:text-primary-400 mr-2" />
                          <span className="text-xs sm:text-sm text-primary-700 dark:text-primary-300 font-medium">
                              New: AI-powered captions now available
                          </span>
                      </div>

                      <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold mb-8 md:mb-12 leading-tight">
                          <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                              Record, Edit, Share
                          </span>
                          <br />
                          <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-cyan-600 dark:from-primary-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent animate-pulse">
                              Like a Pro
                          </span>
                      </h1>

                      <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
                          Create stunning screen recordings with our
                          comprehensive suite of tools. Built-in editing, AI
                          captions, and sophisticated sharing controls — all in
                          one platform.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 px-4">
                          <button
                              onClick={() => setShowSignUp(true)}
                              className="group bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full hover:shadow-xl hover:shadow-primary-500/25 font-medium text-base sm:text-lg md:text-xl lg:text-2xl transition-all duration-300 hover:scale-105 flex items-center w-full sm:w-auto justify-center"
                          >
                              Start Recording Free
                              <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-7 md:w-7 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button className="group border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 font-medium text-base sm:text-lg md:text-xl lg:text-2xl transition-all duration-300 hover:scale-105 flex items-center w-full sm:w-auto justify-center">
                              <PlayCircle className="mr-2 md:mr-3 h-5 w-5 md:h-7 md:w-7 group-hover:scale-110 transition-transform" />
                              Watch Demo
                          </button>
                      </div>
                  </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 left-10 opacity-40 dark:opacity-60">
                  <div className="animate-float">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl backdrop-blur-sm border border-blue-500/20" />
                  </div>
              </div>
              <div className="absolute top-40 right-16 opacity-40 dark:opacity-60">
                  <div className="animate-float-delayed">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full backdrop-blur-sm border border-purple-500/20" />
                  </div>
              </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 relative z-10">
              <div className="container mx-auto px-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {stats.map((stat, index) => (
                          <div key={index} className="text-center group">
                              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-105">
                                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                                      {stat.number}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">
                                      {stat.label}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Features Section */}
          <section className="py-24 relative z-10">
              {/* Section-specific neon lines */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                      className="neon-line neon-line-horizontal neon-purple absolute top-10 left-0 opacity-40 dark:opacity-100"
                      style={{ animationDelay: "1s", width: "150px" }}
                  />
                  <div
                      className="neon-line neon-line-horizontal neon-cyan absolute bottom-10 right-0 opacity-40 dark:opacity-100"
                      style={{ animationDelay: "3s", width: "200px" }}
                  />
                  <div className="absolute top-1/2 left-4 w-1 h-24 bg-gradient-to-b from-transparent via-primary-600 dark:via-primary-400 to-transparent opacity-40 dark:opacity-60 neon-pulse" />
                  <div
                      className="absolute top-1/2 right-4 w-1 h-24 bg-gradient-to-b from-transparent via-purple-600 dark:via-purple-400 to-transparent opacity-40 dark:opacity-60 neon-pulse"
                      style={{ animationDelay: "1.5s" }}
                  />
              </div>

              <div className="container mx-auto px-4">
                  <div className="text-center mb-20">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              Everything you need for
                          </span>
                          <br />
                          <span className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                              professional recordings
                          </span>
                      </h2>
                      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mx-auto px-4">
                          From capture to sharing, ScreenForge provides all the
                          tools you need to create and distribute professional
                          screen recordings.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 relative">
                      {features.map((feature, index) => {
                          const Icon = feature.icon;

                          // Bento grid layout: rectangle-square top, square-rectangle bottom
                          const getCardClasses = (index: number) => {
                              if (index === 0)
                                  return "lg:col-span-2 lg:row-span-1"; // Rectangle (wide)
                              if (index === 1)
                                  return "lg:col-span-1 lg:row-span-1"; // Square
                              if (index === 2)
                                  return "lg:col-span-1 lg:row-span-1"; // Square
                              if (index === 3)
                                  return "lg:col-span-2 lg:row-span-1"; // Rectangle (wide)
                              return "";
                          };

                          return (
                              <div
                                  key={index}
                                  className={`group relative ${getCardClasses(
                                      index
                                  )}`}
                                  style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                  {/* Neon border effect on cards */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                                  <div
                                      className={`bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 lg:p-8 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative z-10 h-full ${
                                          index === 0 || index === 3
                                              ? "flex flex-col lg:flex-row lg:items-center lg:text-left"
                                              : "flex flex-col text-center"
                                      }`}
                                  >
                                      <div
                                          className={`${
                                              index === 0 || index === 3
                                                  ? "lg:flex-shrink-0 lg:mr-6 mb-4 lg:mb-0"
                                                  : "mx-auto mb-6"
                                          }`}
                                      >
                                          <div
                                              className={`bg-gradient-to-r ${
                                                  feature.gradient
                                              } w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                                                  index === 0 || index === 3
                                                      ? "mx-auto lg:mx-0"
                                                      : "mx-auto"
                                              }`}
                                          >
                                              <Icon className="h-8 w-8 text-white" />
                                          </div>
                                      </div>
                                      <div
                                          className={`flex-1 ${
                                              index === 0 || index === 3
                                                  ? "text-center lg:text-left"
                                                  : "text-center"
                                          }`}
                                      >
                                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                              {feature.title}
                                          </h3>
                                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                              {feature.description}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </section>

          {/* Recording Options Section */}
          <section className="py-24 relative z-10">
              <div className="container mx-auto px-4">
                  <div className="text-center mb-20">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              Three ways to capture
                          </span>
                          <br />
                          <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                              your perfect shot
                          </span>
                      </h2>
                      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 px-4">
                          Choose the perfect recording scope for your needs
                      </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 relative">
                      {[
                          {
                              icon: "🌐",
                              title: "Browser Tab",
                              description:
                                  "Record a specific browser tab for focused demonstrations",
                              color: "from-gray-700 to-gray-600",
                          },
                          {
                              icon: "🖥️",
                              title: "Browser Window",
                              description:
                                  "Capture entire browser window including multiple tabs",
                              color: "from-gray-700 to-gray-600",
                          },
                          {
                              icon: "🖨️",
                              title: "Full Desktop",
                              description:
                                  "Record your entire screen for comprehensive tutorials",
                              color: "from-gray-700 to-gray-600",
                          },
                      ].map((option, index) => (
                          <div key={index} className="group relative">
                              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                                  <div className="text-center">
                                      <div
                                          className={`bg-gradient-to-r ${option.color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 text-3xl`}
                                      >
                                          {option.icon}
                                      </div>
                                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                          {option.title}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                          {option.description}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-24 relative z-10">
              {/* Testimonials section neon effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                      className="neon-line neon-line-vertical neon-green absolute top-0 left-8 opacity-40 dark:opacity-100"
                      style={{ animationDelay: "2s", height: "120px" }}
                  />
                  <div
                      className="neon-line neon-line-vertical neon-pink absolute top-0 right-8 opacity-40 dark:opacity-100"
                      style={{ animationDelay: "4s", height: "150px" }}
                  />
                  <div className="absolute top-0 left-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-20 dark:opacity-40 neon-pulse" />
              </div>

              <div className="container mx-auto px-4">
                  <div className="text-center mb-20">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              Loved by creators
                          </span>
                          <br />
                          <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                              worldwide
                          </span>
                      </h2>
                  </div>

                  <div className="overflow-hidden relative">
                      <div className="flex animate-scroll-left">
                          {/* First set of testimonials */}
                          {testimonials.map((testimonial, index) => (
                              <div
                                  key={`first-${index}`}
                                  className="flex-shrink-0 w-96 mx-4"
                              >
                                  <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 relative group">
                                      {/* Neon glow effect on hover */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />

                                      <div className="relative z-10">
                                          <div className="flex items-center mb-6">
                                              {[...Array(5)].map((_, i) => (
                                                  <Star
                                                      key={i}
                                                      className="h-5 w-5 text-yellow-400 fill-current"
                                                  />
                                              ))}
                                          </div>
                                          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                                              "{testimonial.content}"
                                          </p>
                                          <div className="flex items-center">
                                              <div className="text-3xl mr-4">
                                                  {testimonial.avatar}
                                              </div>
                                              <div>
                                                  <div className="text-gray-900 dark:text-white font-semibold">
                                                      {testimonial.name}
                                                  </div>
                                                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                                                      {testimonial.role} at{" "}
                                                      {testimonial.company}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {/* Duplicate set for seamless scrolling */}
                          {testimonials.map((testimonial, index) => (
                              <div
                                  key={`second-${index}`}
                                  className="flex-shrink-0 w-96 mx-4"
                              >
                                  <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 relative group">
                                      {/* Neon glow effect on hover */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />

                                      <div className="relative z-10">
                                          <div className="flex items-center mb-6">
                                              {[...Array(5)].map((_, i) => (
                                                  <Star
                                                      key={i}
                                                      className="h-5 w-5 text-yellow-400 fill-current"
                                                  />
                                              ))}
                                          </div>
                                          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                                              "{testimonial.content}"
                                          </p>
                                          <div className="flex items-center">
                                              <div className="text-3xl mr-4">
                                                  {testimonial.avatar}
                                              </div>
                                              <div>
                                                  <div className="text-gray-900 dark:text-white font-semibold">
                                                      {testimonial.name}
                                                  </div>
                                                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                                                      {testimonial.role} at{" "}
                                                      {testimonial.company}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 relative z-10">
              <div className="container mx-auto px-4 text-center relative">
                  <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 backdrop-blur-sm border border-primary-500/20 rounded-3xl p-8 sm:p-12 md:p-16 relative">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              Ready to create
                          </span>
                          <br />
                          <span className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                              professional recordings?
                          </span>
                      </h2>
                      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 mx-auto px-4">
                          Join thousands of creators, designers, and developers
                          who trust ScreenForge for their screen recording
                          needs.
                      </p>
                      <button
                          onClick={() => setShowSignUp(true)}
                          className="group bg-gradient-to-r from-primary-500 to-purple-500 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full hover:shadow-xl hover:shadow-primary-500/25 font-medium text-lg sm:text-xl transition-all duration-300 hover:scale-105 flex items-center mx-auto"
                      >
                          Get Started Free
                          <Sparkles className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
                      </button>
                  </div>
              </div>
          </section>

          {/* Footer */}
          <footer className="glass-dark backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 py-16 relative z-10 bg-white/50 dark:bg-gray-900/50">
              <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="flex items-center space-x-3 mb-8 md:mb-0">
                          <Video className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                              ScreenForge
                          </span>
                      </div>
                      <div className="flex items-center space-x-8">
                          <a
                              href="#"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                          >
                              Privacy
                          </a>
                          <a
                              href="#"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                          >
                              Terms
                          </a>
                          <a
                              href="#"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                          >
                              Support
                          </a>
                      </div>
                  </div>
                  <div className="border-t border-gray-200/30 dark:border-gray-800/30 mt-12 pt-8 text-center">
                      <p className="text-gray-500">
                          © 2025 ScreenForge. Professional screen recording made
                          simple.
                      </p>
                  </div>
              </div>
          </footer>

          {/* Sign In Modal */}
          {showSignIn && (
              <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  onClick={(e) => {
                      if (e.target === e.currentTarget) {
                          setShowSignIn(false);
                      }
                  }}
              >
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                      <button
                          onClick={() => setShowSignIn(false)}
                          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                          <X className="h-5 w-5" />
                      </button>
                      <div className="p-6">
                          <SignIn
                              appearance={{
                                  elements: {
                                      rootBox: "w-full",
                                      card: "bg-transparent shadow-none border-none",
                                      headerTitle:
                                          "text-gray-900 dark:text-white",
                                      headerSubtitle:
                                          "text-gray-600 dark:text-gray-400",
                                      socialButtonsBlockButton:
                                          "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
                                      formButtonPrimary:
                                          "bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600",
                                      formFieldInput:
                                          "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                                      formFieldLabel:
                                          "text-gray-700 dark:text-gray-300",
                                      identityPreviewText:
                                          "text-gray-600 dark:text-gray-400",
                                      formFieldInputShowPasswordButton:
                                          "text-gray-500 dark:text-gray-400",
                                  },
                              }}
                              redirectUrl="/dashboard"
                          />
                      </div>
                  </div>
              </div>
          )}

          {/* Sign Up Modal */}
          {showSignUp && (
              <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  onClick={(e) => {
                      if (e.target === e.currentTarget) {
                          setShowSignUp(false);
                      }
                  }}
              >
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                      <button
                          onClick={() => setShowSignUp(false)}
                          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                          <X className="h-5 w-5" />
                      </button>
                      <div className="p-6">
                          <SignUp
                              appearance={{
                                  elements: {
                                      rootBox: "w-full",
                                      card: "bg-transparent shadow-none border-none",
                                      headerTitle:
                                          "text-gray-900 dark:text-white",
                                      headerSubtitle:
                                          "text-gray-600 dark:text-gray-400",
                                      socialButtonsBlockButton:
                                          "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
                                      formButtonPrimary:
                                          "bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600",
                                      formFieldInput:
                                          "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                                      formFieldLabel:
                                          "text-gray-700 dark:text-gray-300",
                                      identityPreviewText:
                                          "text-gray-600 dark:text-gray-400",
                                      formFieldInputShowPasswordButton:
                                          "text-gray-500 dark:text-gray-400",
                                  },
                              }}
                              redirectUrl="/dashboard"
                          />
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
}
