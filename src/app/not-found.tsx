import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating sparkles/dots */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-400/40 rounded-full animate-float-slow" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400/30 rounded-full animate-float-medium" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-300/50 rounded-full animate-float-fast" />
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-float-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 bg-pink-400/30 rounded-full animate-float-medium" />

            {/* Gradient orbs */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-300/20 dark:from-pink-900/10 dark:to-purple-900/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-300/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center max-w-lg mx-auto">
            {/* 404 Text */}
            <h1 className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              404
            </h1>

            {/* Message */}
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Page Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Looks like this dress got lost somewhere between collections...
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-800 rounded-full hover:border-pink-400 dark:hover:border-pink-600 hover:bg-pink-50 dark:hover:bg-slate-700 transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Catalog
              </Link>
            </div>
          </div>

          {/* Brand footer */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Sapfir Couture</span>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
            50% { transform: translateY(-15px) translateX(-8px); opacity: 0.6; }
          }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
            50% { transform: translateY(-25px) translateX(5px); opacity: 0.9; }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
          .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
          .animate-sway { animation: sway 4s ease-in-out infinite; }
          .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
          .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
          .animate-gradient { animation: gradient 3s ease infinite; }
          .animation-delay-500 { animation-delay: 0.5s; }
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}} />
      </body>
    </html>
  );
}
