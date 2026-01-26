export default function Footer() {
  return (
    <footer className="mt-6 border-t border-white/10 glass-panel py-6">
      <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 opacity-50">
          <span className="material-symbols-outlined">monitor</span>
          <span className="text-xs font-medium tracking-widest uppercase">
            EEBUS MPC v1.0.0
          </span>
        </div>
        <div className="flex items-center gap-3 opacity-50">
          <span className="material-symbols-outlined">flash_on</span>
          <span className="text-xs font-medium tracking-widest uppercase">
            EEBUS LPC v1.0.0
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Made with ❤️ by{' '}
          <a href="https://github.com/fran1215" target="_blank" rel="noopener noreferrer">
            fran1215
          </a>
          . &copy; 2024 EEBUS Initiative e.V. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
