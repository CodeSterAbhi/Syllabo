import React from 'react';

interface FooterProps {
  onTermsClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTermsClick }) => {
  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTermsClick) {
      onTermsClick();
    } else {
      window.history.pushState(null, '', '/terms');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="mt-auto border-t border-stone-200/70 bg-white py-8 px-4 text-slate-600">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-3">
        {/* Brand & Purpose */}
        <div className="space-y-1">
          <p className="font-bold text-slate-900 text-sm">
            Syllabo
          </p>
          <p className="text-xs font-semibold text-slate-700">
            Exam Preparation Platform for Quantum University
          </p>
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            Syllabo is an independent student academic project designed to facilitate structured university exam preparation.
          </p>
        </div>

        {/* Links & Attributions */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs pt-1">
          <a
            href="/terms"
            onClick={handleTermsClick}
            className="text-syllabo-900 font-bold hover:underline hover:text-syllabo-800 transition-colors"
          >
            Terms & Conditions
          </a>
          <span className="text-stone-300">•</span>
          <span className="font-medium text-slate-600">
            Developed by <span className="font-bold text-slate-800">Abhijit Sharma</span>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-slate-500">
            © 2026 Syllabo. All rights reserved.
          </span>
        </div>

        {/* Concise Disclaimer */}
        <p className="text-[10px] text-slate-400">
          Curriculum content and syllabus rights belong to their respective owners.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
