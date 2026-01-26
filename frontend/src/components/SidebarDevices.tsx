import { useState, useEffect } from "preact/hooks";
import type { Device } from "../api/models/device";

interface SidebarDevicesProps {
  apiUrl: string; // backend endpoint
  onDeviceSelect?: (device: Device) => void;
  onAddDevice?: (device: Device) => void;
  onDeviceDelete?: (deviceId: string) => void;
  addedDeviceIds?: string[]; // List of SKIs that are already added
}

export default function SidebarDevices({
  apiUrl,
  onDeviceSelect,
  onAddDevice,
  onDeviceDelete,
  addedDeviceIds = [],
}: SidebarDevicesProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedSki, setSelectedSki] = useState<string>("");

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

  // Poll every 5 seconds
  useEffect(() => {
    let isMounted = true;

    async function fetchDevices() {
      try {
        const res = await fetch(apiUrl);
        const data: Device[] = await res.json();
        if (isMounted) setDevices(data);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
      }
    }

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);

    console.log("Devices fetched:", devices);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl]);

  const handleClick = (device: Device) => {
    setSelectedSki(device.ski);
    if (onDeviceSelect) onDeviceSelect(device);
  };

  const handleAddDevice = (device: Device) => {
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
        <div className="glass-panel h-full rounded-3xl p-6 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">
                Discovered
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                SHIP/SPINE Search
              </p>
            </div>
            <span className="size-6 bg-primary/20 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm animate-spin">
                sync
              </span>
            </span>
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
                  </div>
                  <button
                    onClick={(e) => 
                      addedDeviceIds.includes(device.ski)
                        ? handleDeleteDevice(e, device.ski, device.generalInfo.deviceName || device.shipInfo.instanceName || "Unnamed Device")
                        : handleAddDevice(device)
                    }
                    className={`size-6 rounded-full flex items-center justify-center transition-all relative group/btn ${
                      addedDeviceIds.includes(device.ski)
                        ? 'bg-green-600 hover:bg-red-600 cursor-pointer'
                        : 'bg-primary hover:scale-110 cursor-pointer'
                    }`}
                    title={addedDeviceIds.includes(device.ski) ? 'Remove from grid' : 'Add to grid'}
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
                <p className="text-[9px] font-mono text-slate-500 truncate mb-2">
                  {device.ski}
                </p>
                {/* <div className="flex gap-1">
                  {device.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-slate-400 font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
