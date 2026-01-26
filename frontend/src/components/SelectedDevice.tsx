interface Device {
  id: string;
  name: string;
  icon: string;
  power?: string;
  flow?: string;
  borderColor: string;
  iconColor: string;
  position: string;
}

interface SelectedDeviceProps {
  device: Device;
}

export default function SelectedDevice({ device }: SelectedDeviceProps) {
  return (
    <div className="mt-8">
      <div className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <span className={`material-symbols-outlined text-3xl ${device.iconColor}`}>
                {device.icon}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  {device.name}
                </h2>
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded border border-primary/30 uppercase">
                  Selected
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Device ID: {device.id.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex bg-white/5 p-1 rounded-lg">
            <button className="px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-md tab-active">
              MPC Monitor
            </button>
            <button className="px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-md text-slate-500 hover:text-white">
              LPC Control
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-primary/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
              Power
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl digital-readout font-bold text-white">
                {device.power || device.flow || '0.00'}
              </span>
              <span className="text-primary font-bold text-xs">kW</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="material-symbols-outlined text-xs text-green-500">
                {device.flow ? 'arrow_downward' : 'arrow_upward'}
              </span>
              <span>{device.flow ? 'Charging' : 'Active'}</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-blue-400/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
              Energy
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl digital-readout font-bold text-white">84.5</span>
              <span className="text-blue-400 font-bold text-xs">kWh</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full w-[84%]"></div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-amber-400/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
              Current
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl digital-readout font-bold text-white">9.12</span>
              <span className="text-amber-400 font-bold text-xs">A</span>
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-bold uppercase text-slate-600">
              <span>3-Phase Balance</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-purple-400/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
              Voltage
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl digital-readout font-bold text-white">230.1</span>
              <span className="text-purple-400 font-bold text-xs">V</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Nominal</span>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-teal-400/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
              Frequency
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl digital-readout font-bold text-white">50.00</span>
              <span className="text-teal-400 font-bold text-xs">Hz</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-grow bg-white/5 h-1 rounded-full relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 size-2 bg-teal-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden mt-8 max-w-2xl relative z-10">
          <div className="glass-card p-8 rounded-2xl border border-white/10">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">
              LPC Control Panel
            </h3>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  Load Limit Power (kW)
                </label>
                <div className="flex gap-4">
                  <input
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all flex-grow"
                    placeholder="0.00"
                    type="number"
                  />
                  <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20">
                    Send Limit
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 italic">
                  This command will update the SHIP/SPINE PowerLimit record for the current node.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
