import React, { useEffect, useRef } from 'react';
import { FaLinkedin } from 'react-icons/fa';

const Home: React.FC = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const productsRef = useRef<HTMLElement | null>(null);
  const socialRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scale-100', 'opacity-100');
            entry.target.classList.remove('scale-90', 'opacity-0');
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px"
      }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (productsRef.current) observer.observe(productsRef.current);
    if (socialRef.current) observer.observe(socialRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans snap-y snap-mandatory overflow-y-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Navigator Hub
              </h1>
            </a>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => scrollToSection(productsRef)}
                className="text-gray-600 hover:text-gray-900 text-lg font-medium transition-colors"
              >
                Products
              </button>
              <a 
                href="/login" 
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-lg font-medium"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen snap-start flex items-center transform transition-all duration-1000 scale-90 opacity-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Boost your Career With Us!
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Where Mentors and Mentees Connect, Learn, and Grow Together
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Join our vibrant community of professionals and aspirants. Whether you're looking to share your expertise or seeking guidance, Navigator Hub is your platform for meaningful career connections.
            </p>
            <button 
              onClick={() => scrollToSection(productsRef)}
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section 
        ref={productsRef}
        className="min-h-screen snap-start flex items-center transform transition-all duration-1000 scale-90 opacity-0 bg-gradient-to-br from-white via-blue-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Our Products</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a 
              href="/login" 
              className="block p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Influence Navigator</h3>
              <p className="text-gray-600">
                Increase your reach on social media with our AI posts generator feature
              </p>
            </a>
            <div className="p-6 rounded-xl bg-white shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">Talent Navigator</h3>
              <p className="text-gray-600">Coming Soon...</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => scrollToSection(socialRef)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
            >
              Scroll for more
            </button>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section 
        ref={socialRef}
        className="min-h-screen snap-start flex items-center transform transition-all duration-1000 scale-90 opacity-0 bg-gradient-to-br from-purple-50 via-blue-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Follow Us on Social Media</h2>
          <a 
            href="https://www.linkedin.com/company/navigator-hub/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FaLinkedin className="w-8 h-8" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">© 2024 Navigator Hub | All Rights Reserved</p>
          <div className="flex justify-center gap-4">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-500">|</span>
            <a href="/" className="text-gray-300 hover:text-white transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;