import { useState } from 'preact/hooks';
import { wsService } from '../services/websocket';

interface Device {
  id: string;
  name: string;
  icon: string;
  power?: string;
  borderColor: string;
  iconColor: string;
  position: string;
  energy?: string;
  current?: string;
  voltage?: string;
  frequency?: string;
  powerLimit?: string;
  powerLimitContractual?: boolean;
}

interface SelectedDeviceProps {
  device: Device;
  simulationRunning?: boolean;
}

export default function SelectedDevice({ device, simulationRunning }: SelectedDeviceProps) {
  const [activeTab, setActiveTab] = useState<'mpc' | 'lpc'>('mpc');
  const [lpcActive, setLpcActive] = useState(false);
  const [lpcValue, setLpcValue] = useState('');
  const [lpcDuration, setLpcDuration] = useState('');

  const handleSendLimit = () => {
    console.log('Send LPC limit:', { active: lpcActive, value: lpcValue, duration: lpcDuration });
    wsService.send('lpc_limit', { ski: device.id, limit: parseFloat(lpcValue), active: lpcActive, duration: lpcDuration ? parseInt(lpcDuration) : 0 });
  };

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
            <button
              onClick={() => setActiveTab('mpc')}
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-md ${
                activeTab === 'mpc' ? 'tab-active' : 'text-slate-500 hover:text-white'
              }`}
            >
              MPC Monitor
            </button>
            <button
              onClick={() => setActiveTab('lpc')}
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-md ${
                activeTab === 'lpc' ? 'tab-active' : 'text-slate-500 hover:text-white'
              }`}
            >
              LPC Control
            </button>
          </div>
        </div>

        {activeTab === 'mpc' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            <div className="glass-card p-6 rounded-2xl border-t-2 border-t-primary/50">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
                Power
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl digital-readout font-bold text-white">
                  {simulationRunning ? device.power : '0.00'}
                </span>
                <span className="text-primary font-bold text-xs">kW</span>
              </div>
              {device.powerLimit && (
                <div>
                  <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[84%]"></div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-green-500"></span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {device.powerLimitContractual ? 'Contractual' : 'Nominal'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="glass-card p-6 rounded-2xl border-t-2 border-t-blue-400/50">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
                Energy
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl digital-readout font-bold text-white">
                  {simulationRunning ? device.energy : '0.00'}
                </span>
                <span className="text-blue-400 font-bold text-xs">kWh</span>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-t-2 border-t-amber-400/50">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
                Current
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl digital-readout font-bold text-white">
                  {simulationRunning ? device.current : '0.00'}
                </span>
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
                <span className="text-4xl digital-readout font-bold text-white">
                  {simulationRunning ? device.voltage : '0.00'}
                </span>
                <span className="text-purple-400 font-bold text-xs">V</span>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border-t-2 border-t-teal-400/50">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">
                Frequency
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl digital-readout font-bold text-white">
                  {simulationRunning ? device.frequency : '0.00'}
                </span>
                <span className="text-teal-400 font-bold text-xs">Hz</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-grow bg-white/5 h-1 rounded-full relative">
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 size-2 bg-teal-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lpc' && (
          <div className="relative z-10">
            <div className="glass-card p-8 rounded-2xl border border-white/10 max-w-3xl">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">
                LPC Control Panel
              </h3>
              <div className="flex items-start gap-8">
                {/* Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Status
                  </label>
                  <button
                    onClick={() => setLpcActive(!lpcActive)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      lpcActive
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${
                      lpcActive ? 'bg-green-500' : 'bg-slate-600'
                    }`}>
                      <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                        lpcActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${
                      lpcActive ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {lpcActive ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </div>

                {/* Value */}
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Limit Value (W)
                  </label>
                  <input
                    type="number"
                    value={lpcValue}
                    onInput={(e) => setLpcValue((e.target as HTMLInputElement).value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Duration (s)
                  </label>
                  <input
                    type="number"
                    value={lpcDuration}
                    onInput={(e) => setLpcDuration((e.target as HTMLInputElement).value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Send button */}
                <div className="space-y-2">
                  <label className="text-[10px] text-transparent font-black uppercase tracking-widest">
                    Action
                  </label>
                  <button
                    onClick={handleSendLimit}
                    disabled={!simulationRunning}
                    className="bg-primary hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:shadow-none whitespace-nowrap"
                  >
                    Send LPC Limit
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 italic mt-4">
                Sets the consumption power limit for this device via EEBUS LPC (Limitation of Power Consumption).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
