import { useState, useEffect } from "preact/hooks";
import type { Device } from "../api/models/device";

interface SidebarDevicesProps {
  apiUrl: string; // backend endpoint
  onDeviceSelect?: (device: Device) => void;
}

export default function SidebarDevices({
  apiUrl,
  onDeviceSelect,
}: SidebarDevicesProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedSki, setSelectedSki] = useState<string>("");

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

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl]);

  const handleClick = (device: Device) => {
    setSelectedSki(device.ski);
    if (onDeviceSelect) onDeviceSelect(device);
  };

  return (
    <aside class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow text-gray-100 h-fit sticky top-6">
      <h5 class="mb-4 text-xl font-semibold tracking-tight text-white">
        Discovered Devices
      </h5>
      <ul class="space-y-2 max-h-[calc(100vh-120px)] overflow-auto">
        {devices.map((device) => (
          <li key={device.ski}>
            <div
              class={`w-full flex flex-col items-start p-3 text-left rounded-lg transition
    ${
      device.ski === selectedSki
        ? "bg-gray-500 text-white"
        : "hover:bg-gray-700 hover:text-white cursor-pointer"
    }`}
              onClick={() => handleClick(device)}
            >
              {/* Instance Name / Device Name */}
              <span class="font-medium text-white truncate w-full">
                {device.shipInfo.instanceName}
              </span>

              {/* Ski / details */}
              <span
                class="text-sm text-gray-300 truncate w-full"
                title={device.ski}
              >
                SKI: {device.ski}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
