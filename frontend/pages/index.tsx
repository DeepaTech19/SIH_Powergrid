import { FormEvent, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const challengeCards = [
  {
    title: 'Budgets',
    delay: 0,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Locations',
    delay: 200,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'Tower Types',
    delay: 400,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 7 10H5Z" />
        <path d="m12 22 7-10H5Z" />
      </svg>
    ),
  },
  {
    title: 'Sub-stations',
    delay: 600,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="14" width="18" height="7" rx="2" ry="2" />
        <line x1="6" y1="14" x2="6" y2="11" />
        <line x1="18" y1="14" x2="18" y2="11" />
        <path d="M6 11h.01" />
        <path d="M18 11h.01" />
        <path d="M12 11h.01" />
        <path d="M4 11h16" />
        <path d="M12 14v-3" />
      </svg>
    ),
  },
  {
    title: 'Taxes',
    delay: 800,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4s1.7-1 2-4c0-2.2-2.3-3.5-5-5-1.3-1-2-1.3-3-1.3-1 0-1.7.3-3 1 .3-1.7 1.5-3 3-3z" />
      </svg>
    ),
  },
  {
    title: 'Geography',
    delay: 1000,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const featureCards = [
  {
    title: 'Accurate Forecasting',
    description: 'Leverage AI to predict material needs with high accuracy based on project variables.',
    delay: 0,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    title: 'Inventory Control',
    description: 'Maintain optimal stock levels, automate reorder points, and prevent costly shortages.',
    delay: 200,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Dashboards',
    description: 'Access dynamic visualizations and reports for informed, data-driven decision-making.',
    delay: 400,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20V16" />
      </svg>
    ),
  },
];

const processSteps = [
  {
    step: '1',
    title: 'Input Data',
    description: 'Securely upload your project details including budget, locations, and material specifications.',
    delay: 0,
  },
  {
    step: '2',
    title: 'AI Analysis',
    description: 'Our intelligent model analyzes the data, identifying patterns and forecasting future needs.',
    delay: 200,
  },
  {
    step: '3',
    title: 'Get Forecast',
    description: 'Receive a detailed breakdown of required materials and smart procurement suggestions.',
    delay: 400,
  },
  {
    step: '4',
    title: 'Optimize',
    description: 'Track your inventory in real-time and continuously optimize your supply chain.',
    delay: 600,
  },
];

const solutionCards = [
  {
    title: 'Minimize Costs',
    description: 'Prevent over-stocking and leverage bulk purchasing insights.',
    delay: 0,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Avoid Shortages',
    description: 'Ensure materials are available when needed, eliminating costly delays.',
    delay: 200,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  {
    title: 'Improve Efficiency',
    description: 'Streamline your supply chain and reduce manual planning efforts.',
    delay: 400,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    ),
  },
  {
    title: 'Enhance Decisions',
    description: 'Make strategic choices with confidence, backed by reliable data.',
    delay: 600,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.03 5.39a2.4 2.4 0 0 0-3.46 0l-3.03 3.03a2.4 2.4 0 0 0 0 3.46l3.03 3.03a2.4 2.4 0 0 0 3.46 0l3.03-3.03a2.4 2.4 0 0 0 0-3.46Z" />
        <path d="m9.01 15.01 3-3" />
        <path d="M2.39 15.03a2.4 2.4 0 0 0 0 3.46l3.03 3.03a2.4 2.4 0 0 0 3.46 0l3.03-3.03a2.4 2.4 0 0 0 0-3.46Z" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, [loading]);

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    const heroSection = document.getElementById('hero-section');
    const mainHeader = document.getElementById('main-header');
    if (!heroSection || !mainHeader) return;

    const handleScroll = () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        mainHeader.classList.add('shadow-md', 'bg-white/95');
      } else {
        mainHeader.classList.remove('shadow-md', 'bg-white/95');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleLearnMore = () => {
    const target = document.getElementById('challenges');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>POWERGRID Material Demand Forecasting</title>
        <meta name="description" content="AI-powered material demand forecasting for POWERGRID" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="home-page" className="bg-cream antialiased text-gray-800">
        <header id="main-header" className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40 transition-all duration-300">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-8 w-auto text-jungle-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75" />
              </svg>
              <span className="ml-3 font-black text-xl text-jungle-green tracking-tight">POWERGRID</span>
            </div>
            <div className="hidden md:flex items-center space-x-8" id="home-page-nav">
              <a href="#features" className="text-gray-600 hover:text-pop-pink font-bold transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-pop-pink font-bold transition-colors">How it works</a>
              <a href="#solution" className="text-gray-600 hover:text-pop-pink font-bold transition-colors">Solution</a>
              <a href="#contact" className="text-gray-600 hover:text-pop-pink font-bold transition-colors">Contact</a>
            </div>
            <div className="flex items-center">
              <button
                id="home-signin-btn"
                type="button"
                onClick={handleSignIn}
                className="bg-jungle-green text-white py-2.5 px-6 rounded-xl hover:bg-black font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </div>
          </nav>
        </header>

        <main>
          <section id="hero-section" className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900" />
            <div
              className="absolute top-0 left-0 w-full h-full opacity-20"
              style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl filter mix-blend-screen animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl filter mix-blend-screen" />

            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 pt-20 lg:pt-0">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
                  Next-Gen AI Forecasting
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  Optimize Material Demand with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Intelligent AI</span>
                </h1>
                <p className="text-base text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Eliminate shortages and reduce overstocking. Our predictive platform analyzes historical data to forecast procurement needs for POWERGRID projects across India.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <button
                    id="get-started-btn"
                    type="button"
                    onClick={handleSignIn}
                    className="bg-blue-600 text-white py-3.5 px-8 rounded-full font-semibold hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Get Started
                  </button>
                  <button
                    id="learn-more-btn"
                    type="button"
                    onClick={handleLearnMore}
                    className="bg-slate-800/50 text-white backdrop-blur-sm border border-white/10 py-3.5 px-8 rounded-full font-semibold hover:bg-white/10 transition-all hover:border-white/30"
                  >
                    Learn More
                  </button>
                </div>
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-slate-400 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>98% Forecast Accuracy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Real-time Analytics</span>
                  </div>
                </div>
              </div>

              <div className="relative animate-float hidden lg:block">
                <svg viewBox="0 0 600 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
                  <defs>
                    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(30, 41, 59, 0.8)" />
                      <stop offset="100%" stopColor="rgba(15, 23, 42, 0.9)" />
                    </linearGradient>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <rect x="50" y="50" width="500" height="320" rx="16" fill="url(#cardGradient)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="glass-panel" />
                  <circle cx="80" cy="80" r="4" fill="#ef4444" opacity="0.8" />
                  <circle cx="96" cy="80" r="4" fill="#f59e0b" opacity="0.8" />
                  <circle cx="112" cy="80" r="4" fill="#22c55e" opacity="0.8" />
                  <rect x="75" y="110" width="80" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
                  <rect x="75" y="135" width="60" height="6" rx="3" fill="rgba(255,255,255,0.05)" />
                  <rect x="75" y="155" width="50" height="6" rx="3" fill="rgba(255,255,255,0.05)" />
                  <rect x="75" y="175" width="65" height="6" rx="3" fill="rgba(255,255,255,0.05)" />
                  <line x1="180" y1="110" x2="180" y2="330" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="210" y1="300" x2="520" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="210" y1="250" x2="520" y2="250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1="210" y1="200" x2="520" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <path d="M210 280 Q 260 270, 310 220 T 410 200 T 520 160 V 300 H 210 Z" fill="url(#chartGradient)" opacity="0.3" />
                  <path d="M210 280 Q 260 270, 310 220 T 410 200 T 520 160" stroke="#2dd4bf" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#glow)" />
                  <circle cx="310" cy="220" r="4" fill="#1e293b" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="410" cy="200" r="4" fill="#1e293b" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="520" cy="160" r="4" fill="#1e293b" stroke="#2dd4bf" strokeWidth="2" />
                  <g transform="translate(420, 90)">
                    <rect width="140" height="60" rx="8" fill="rgba(30, 41, 59, 0.9)" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="1" className="glass-panel" />
                    <circle cx="30" cy="30" r="12" fill="rgba(45, 212, 191, 0.2)" />
                    <path d="M24 30 L28 34 L36 26" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="50" y="25" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Efficiency</text>
                    <text x="50" y="42" fill="white" fontSize="14" fontFamily="sans-serif" fontWeight="bold">+24.5%</text>
                  </g>
                  <g transform="translate(20, 280)">
                    <rect width="130" height="50" rx="8" fill="rgba(30, 41, 59, 0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="glass-panel" />
                    <circle cx="25" cy="25" r="8" fill="#3b82f6" />
                    <rect x="45" y="18" width="60" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
                    <rect x="45" y="30" width="40" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
                  </g>
                </svg>
              </div>
            </div>
          </section>

          <section id="challenges" className="py-32 bg-cream relative overflow-hidden">
            <div className="container mx-auto px-6">
              <div className="text-center mb-20 reveal-on-scroll">
                <span className="text-sm font-black uppercase text-pop-pink tracking-widest mb-4 block">Challenges</span>
                <h2 className="text-5xl md:text-7xl font-black text-jungle-green mt-2 uppercase leading-none">The Complexity<br />of Scale</h2>
                <p className="text-gray-500 mt-8 text-lg max-w-2xl mx-auto font-medium">
                  POWERGRID executes numerous national projects. We help you manage variables like budgets, locations, and taxes to prevent cost overruns.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center max-w-7xl mx-auto">
                {challengeCards.map(({ title, icon, delay }) => (
                  <div
                    key={title}
                    className="reveal-on-scroll group bg-white p-8 rounded-3xl shadow-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-transparent hover:border-lime-accent"
                    style={delay ? { transitionDelay: `${delay}ms` } : undefined}
                  >
                    <div className="bg-lime-accent/30 text-jungle-green rounded-2xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform">{icon}</div>
                    <p className="font-bold text-jungle-green text-lg">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="py-32 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-20 reveal-on-scroll">
                <span className="text-sm font-black uppercase text-pop-pink tracking-widest mb-4 block">Platform Features</span>
                <h2 className="text-5xl md:text-6xl font-black text-jungle-green mt-2 uppercase leading-none">Everything You Need<br />To Forecast</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featureCards.map(({ title, description, delay, icon }) => (
                  <div
                    key={title}
                    className="reveal-on-scroll bg-[#F5F5F0] p-10 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-gray-200"
                    style={delay ? { transitionDelay: `${delay}ms` } : undefined}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm">{icon}</div>
                    <h3 className="text-2xl font-bold text-jungle-green mb-4">{title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-32 bg-jungle-green text-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-24 reveal-on-scroll">
                <span className="text-sm font-black uppercase text-lime-accent tracking-widest mb-4 block">Our Process</span>
                <h2 className="text-5xl md:text-6xl font-black mt-2 uppercase leading-none">Four Steps<br />To Efficiency</h2>
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {processSteps.map(({ step, title, description, delay }) => (
                    <div
                      key={step}
                      className="reveal-on-scroll bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
                    >
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-lime-accent text-jungle-green text-xl font-black mr-4">{step}</div>
                        <h3 className="text-2xl font-bold">{title}</h3>
                      </div>
                      <p className="text-gray-300 font-medium">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="solution" className="py-32 bg-cream">
            <div className="container mx-auto px-6">
              <div className="text-center mb-20 reveal-on-scroll">
                <span className="text-sm font-black uppercase text-pop-pink tracking-widest mb-4 block">The Solution</span>
                <h2 className="text-5xl md:text-6xl font-black text-jungle-green mt-2 uppercase leading-none">Unlock Tangible<br />Business Value</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {solutionCards.map(({ title, description, delay, icon }) => (
                  <div
                    key={title}
                    className="reveal-on-scroll bg-white p-8 rounded-3xl shadow-card hover:-translate-y-2 transition-transform duration-300"
                    style={delay ? { transitionDelay: `${delay}ms` } : undefined}
                  >
                    <div className="flex justify-start items-center mb-6 h-14 w-14 rounded-2xl bg-lime-accent/40 text-jungle-green">{icon}</div>
                    <h3 className="text-xl font-bold text-jungle-green mb-2">{title}</h3>
                    <p className="text-gray-500 font-medium">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="py-32 bg-white relative">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
                <div className="reveal-on-scroll">
                  <span className="text-sm font-black uppercase text-pop-pink tracking-widest mb-4 block">Get in Touch</span>
                  <h2 className="text-5xl font-black text-jungle-green mb-6 leading-none">READY TO OPTIMIZE<br />YOUR PROJECTS?</h2>
                  <p className="text-gray-500 text-lg font-medium mb-8">Contact our team to schedule a demo or learn more about how POWERGRID is transforming material forecasting.</p>
                  <div className="bg-cream p-8 rounded-3xl border border-gray-100">
                    <h3 className="text-xl font-bold text-jungle-green mb-6">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-sm text-jungle-green">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <p className="font-bold text-jungle-green">Headquarters</p>
                          <p className="text-gray-500 mt-1 font-medium text-sm">
                            POWERGRID Corporation of India Ltd.<br />
                            Gurgaon (Haryana) - 122001, INDIA
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-white p-3 rounded-xl shadow-sm text-jungle-green">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="font-bold text-jungle-green">Email Us</p>
                          <p className="text-gray-500 mt-1 font-medium text-sm">support@powergrid.in</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="bg-jungle-green p-10 rounded-[2.5rem] shadow-2xl reveal-on-scroll" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-lime-accent mb-2 uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white focus:border-lime-accent focus:ring-0 outline-none transition font-medium placeholder-white/30"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-lime-accent mb-2 uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white focus:border-lime-accent focus:ring-0 outline-none transition font-medium placeholder-white/30"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-lime-accent mb-2 uppercase tracking-wider">Work Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white focus:border-lime-accent focus:ring-0 outline-none transition font-medium placeholder-white/30"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-lime-accent mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white focus:border-lime-accent focus:ring-0 outline-none transition font-medium placeholder-white/30"
                      placeholder="Tell us about your project needs..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-pop-pink text-white font-black py-4 rounded-xl hover:bg-white hover:text-pop-pink transition-colors duration-300 text-lg shadow-lg"
                  >
                    SEND MESSAGE
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-cream border-t border-gray-200 text-jungle-green">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="font-black text-2xl">POWERGRID</h3>
                <p className="text-gray-500 mt-2 text-sm font-medium">AI-Powered Material Demand Forecasting</p>
              </div>
              <div className="text-gray-400 text-sm font-medium">
                <p>&copy; 2025 POWERGRID Corporation of India Ltd.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
