interface NavbarProps {
  simulationRunning?: boolean;
  onToggleSimulation?: () => void;
}

export default function Navbar({ simulationRunning = false, onToggleSimulation }: NavbarProps) {
  const toggleSimulation = () => {
    onToggleSimulation?.();
  };

  return (
    <header className="top-0 z-50 w-full border-b border-white/10 glass-panel px-6 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                hub
              </span>
            </div>
            <h2 className="text-white text-xl font-black leading-tight tracking-tight uppercase">
              EEBUS <span className="text-primary font-light">CONTROL</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={toggleSimulation}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-48 cursor-pointer ${
                simulationRunning
                  ? 'bg-simulation-stop hover:bg-red-600 hover:shadow-red-500/20'
                  : 'bg-simulation-start hover:bg-green-600 hover:shadow-green-500/20'
              } text-white rounded-lg text-xs font-bold transition-all shadow-lg`}
            >
              <span className="material-symbols-outlined text-sm">
                {simulationRunning ? 'stop' : 'play_arrow'}
              </span>
              {simulationRunning ? 'STOP' : 'START'} SIMULATION
            </button>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="size-10 rounded-full bg-primary/30 border border-primary/50 overflow-hidden flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-white">
                settings
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
