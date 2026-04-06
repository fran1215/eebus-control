import { useState, useEffect } from "preact/hooks";
import { ConnectionState, type Device } from "../api/models/device";
import { wsService } from "../services/websocket";

interface SimulatedDeviceState {
  running: boolean;
  ski: string;
  deviceName: string;
}

interface SidebarDevicesProps {
  onDeviceSelect?: (device: Device) => void;
  onAddDevice?: (device: Device) => void;
  onDeviceDelete?: (deviceId: string) => void;
  addedDeviceIds?: string[]; // List of SKIs that are already added
}

export default function SidebarDevices({
  onDeviceSelect,
  onAddDevice,
  onDeviceDelete,
  addedDeviceIds = [],
}: SidebarDevicesProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedSki, setSelectedSki] = useState<string>("");
  const [newDeviceCount, setNewDeviceCount] = useState<number>(0);
  const [showSimForm, setShowSimForm] = useState(false);
  const [simDeviceName, setSimDeviceName] = useState("SimDevice");
  const [simNominalMax, setSimNominalMax] = useState("10000");
  const [simDevice, setSimDevice] = useState<SimulatedDeviceState | null>(null);
  const [simCreating, setSimCreating] = useState(false);

  // Map device type to Material Symbols icon
  const getDeviceIcon = (type: string): string => {
    const typeMap: Record<string, string> = {
      'ev_charger': 'ev_station',
      'wallbox': 'ev_station',
      'hvac': 'heat_pump',
      'battery': 'battery_charging_full',
      'storage': 'battery_charging_full',
      'inverter': 'power',
      'heatpump': 'heat_pump',
      'heat pump': 'heat_pump',
      'solar': 'solar_power',
      'grid': 'electrical_services',
    };
    
    const normalizedType = type.toLowerCase();
    return typeMap[normalizedType] || 'device_hub'; // default icon
  };

  // Setup WebSocket listeners for automatic updates
  useEffect(() => {
    // Listen for discovery and connection state updates
    const handler = (type: string, data: any) => {
      if (type === 'mdns_discovery') {
        setDevices(data);
      } else if (type === 'connection_state_update') {
        setDevices(prev => prev.map(d =>
          d.ski === data.ski ? { ...d, connectionState: data.connectionState } : d
        ));
      } else if (type === 'new_devices_discovered') {
        console.log(`${data.newCount} new device(s) discovered!`, data.newDevices);
        setNewDeviceCount(data.newCount);
        // Clear the notification after 3 seconds
        setTimeout(() => setNewDeviceCount(0), 3000);
      } else if (type === 'simulated_device_started') {
        setSimDevice({ running: true, ski: data.ski, deviceName: data.device_name });
        setSimCreating(false);
        setShowSimForm(false);
      } else if (type === 'simulated_device_stopped') {
        setSimDevice(null);
      }
    };

    wsService.addHandler(handler);

    return () => {
      wsService.removeHandler(handler);
    };
  }, []);

  const handleCreateSimDevice = () => {
    setSimCreating(true);
    wsService.send('start_simulated_device', {
      device_name: simDeviceName,
      device_model: 'SimModel',
      nominal_max: parseFloat(simNominalMax) || 10000,
      port: 4712,
    });
  };

  const handleStopSimDevice = () => {
    wsService.send('stop_simulated_device', {});
  };

  const handleClick = (device: Device) => {
    setSelectedSki(device.ski);
    if (onDeviceSelect) onDeviceSelect(device);
  };

  const handleAddDevice = (device: Device) => {
    if (device.connectionState !== ConnectionState.Completed) return;
    if (onAddDevice) {
      onAddDevice(device);
    }
  };

  const handleDeleteDevice = (e: Event, deviceId: string, deviceName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove "${deviceName}" from the grid?`)) {
      onDeviceDelete?.(deviceId);
    }
  };

  return (
    <aside>
      <div className="lg:col-span-1">
        <div className="glass-panel min-h-[450px] rounded-3xl p-6 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">
                Discovered
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                SHIP/SPINE Search
              </p>
            </div>
            <div className="flex items-center gap-2">
              {newDeviceCount > 0 && (
                <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                  +{newDeviceCount} new
                </div>
              )}
              <span className="size-6 bg-primary/20 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm animate-spin">
                  sync
                </span>
              </span>
            </div>
          </div>
          <div className="space-y-3 flex-grow overflow-y-auto pr-1">
            {devices.map((device) => (
              <div
                key={device.ski}
                className="glass-card p-4 rounded-xl border border-white/5 hover:border-primary/50 group transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      {getDeviceIcon(device.generalInfo.type.toLowerCase())}
                    </span>
                    <h5 className="text-xs font-bold text-white">
                      {device.generalInfo.deviceName || device.shipInfo.instanceName || "Unnamed Device"}
                    </h5>
                    {simDevice && device.ski === simDevice.ski && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-bold rounded border border-purple-500/30">
                        SIM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {device.connectionState !== ConnectionState.Completed && (
                      <span
                        className="material-symbols-outlined text-amber-400 text-sm"
                        title={`Not connected (state: ${device.connectionState ?? 'unknown'})`}
                      >
                        warning
                      </span>
                    )}
                    <button
                      onClick={(e) =>
                        addedDeviceIds.includes(device.ski)
                          ? handleDeleteDevice(e, device.ski, device.generalInfo.deviceName || device.shipInfo.instanceName || "Unnamed Device")
                          : handleAddDevice(device)
                      }
                      disabled={!addedDeviceIds.includes(device.ski) && device.connectionState !== ConnectionState.Completed}
                      className={`size-6 rounded-full flex items-center justify-center transition-all relative group/btn ${
                        addedDeviceIds.includes(device.ski)
                          ? 'bg-green-600 hover:bg-red-600 cursor-pointer'
                          : device.connectionState === ConnectionState.Completed
                            ? 'bg-primary hover:scale-110 cursor-pointer'
                            : 'bg-slate-600 opacity-50 cursor-not-allowed'
                      }`}
                      title={addedDeviceIds.includes(device.ski) ? 'Remove from grid' : device.connectionState !== ConnectionState.Completed ? 'Device not connected' : 'Add to grid'}
                    >
                      <span className={`material-symbols-outlined text-white text-xs absolute transition-opacity ${
                        addedDeviceIds.includes(device.ski) ? 'opacity-100 group-hover/btn:opacity-0' : 'opacity-100'
                      }`}>
                        {addedDeviceIds.includes(device.ski) ? 'check' : 'add'}
                      </span>
                      {addedDeviceIds.includes(device.ski) && (
                        <span className="material-symbols-outlined text-white text-xs absolute opacity-0 group-hover/btn:opacity-100 transition-opacity">
                          close
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[9px] font-mono text-slate-500 truncate mb-2">
                  {device.ski}
                </p>
              </div>
            ))}
          </div>

          {/* Simulated Device Section */}
          <div className="mt-4 pt-4 border-t border-white/10">
            {!simDevice ? (
              <>
                {!showSimForm ? (
                  <button
                    onClick={() => setShowSimForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl text-xs font-bold transition-all border border-purple-500/20 hover:border-purple-500/40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      add_circle
                    </span>
                    CREATE SIMULATED DEVICE
                  </button>
                ) : (
                  <div className="glass-card p-4 rounded-xl border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                        New Simulated Device
                      </h4>
                      <button
                        onClick={() => setShowSimForm(false)}
                        className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                        Device Name
                      </label>
                      <input
                        type="text"
                        value={simDeviceName}
                        onInput={(e) => setSimDeviceName((e.target as HTMLInputElement).value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none mt-1"
                        placeholder="SimDevice"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                        Nominal Max Power (W)
                      </label>
                      <input
                        type="number"
                        value={simNominalMax}
                        onInput={(e) => setSimNominalMax((e.target as HTMLInputElement).value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none mt-1"
                        placeholder="10000"
                      />
                    </div>
                    <button
                      onClick={handleCreateSimDevice}
                      disabled={simCreating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      {simCreating ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          CREATING...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          START DEVICE
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400 animate-pulse"></span>
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                      {simDevice.deviceName}
                    </h4>
                    <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-bold rounded">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <p className="text-[9px] font-mono text-purple-400/60 truncate mb-3">
                  {simDevice.ski}
                </p>
                <button
                  onClick={handleStopSimDevice}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-bold transition-all border border-red-500/20 hover:border-red-500/40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">stop</span>
                  STOP DEVICE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
