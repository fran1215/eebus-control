import { useState } from 'preact/hooks';
import Grid from './Grid.tsx';
import SelectedDevice from './SelectedDevice.tsx';
import type { Device as BackendDevice } from '../api/models/device';

interface GridDevice {
  id: string;
  name: string;
  icon: string;
  power?: string;
  flow?: string;
  borderColor: string;
  iconColor: string;
  position: { x: number; y: number }; // Changed to coordinate object
  backendDevice?: BackendDevice; // Store the original backend device
}

const BORDER_COLORS = [
  'border-l-green-500',
  'border-l-blue-400',
  'border-l-purple-500',
  'border-l-orange-500',
  'border-l-pink-500',
  'border-l-yellow-500',
];

const ICON_COLORS = [
  'text-green-500',
  'text-blue-400',
  'text-purple-500',
  'text-orange-500',
  'text-pink-500',
  'text-yellow-500',
];

export default function GridContainer() {
  const [selectedDevice, setSelectedDevice] = useState<GridDevice | null>(null);
  const [devices, setDevices] = useState<GridDevice[]>([]);

  const generateRandomPosition = (): { x: number; y: number } => {
    const positions = [
      { x: 15, y: 10 },
      { x: 70, y: 10 },
      { x: 20, y: 20 },
      { x: 65, y: 20 },
      { x: 15, y: 35 },
      { x: 70, y: 35 },
      { x: 15, y: 50 },
      { x: 70, y: 50 },
      { x: 15, y: 65 },
      { x: 70, y: 65 },
      { x: 25, y: 75 },
      { x: 60, y: 75 },
    ];
    
    // Find positions that aren't occupied
    const availablePositions = positions.filter(pos => {
      // Check if any existing device is too close to this position
      return !devices.some(d => {
        const dx = Math.abs(d.position.x - pos.x);
        const dy = Math.abs(d.position.y - pos.y);
        // Need at least 25% distance horizontally or 20% vertically to avoid overlap
        return dx < 25 && dy < 20;
      });
    });
    
    if (availablePositions.length > 0) {
      return availablePositions[0]; // Take the first available position
    }
    
    // If all predefined positions are taken, try to find any free spot
    for (let attempt = 0; attempt < 50; attempt++) {
      const candidate = {
        x: 10 + Math.random() * 65,
        y: 10 + Math.random() * 70,
      };
      
      const isFree = !devices.some(d => {
        const dx = Math.abs(d.position.x - candidate.x);
        const dy = Math.abs(d.position.y - candidate.y);
        return dx < 25 && dy < 20;
      });
      
      if (isFree) {
        return candidate;
      }
    }
    
    // Fallback - place it at a default spot if somehow everything is full
    return { x: 50, y: 50 };
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
    // Clear selection if deleted device was selected
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(null);
    }
    console.log('Device removed from grid:', deviceId);
  };

  const handleAddDevice = (backendDevice: BackendDevice) => {
    // Check if device already exists (using SKI as unique ID)
    if (devices.find(d => d.id === backendDevice.ski)) {
      console.log('Device already added');
      return;
    }

    // Map device type to icon (you can expand this mapping)
    const deviceTypeToIcon = (type: string): string => {
      const typeMap: Record<string, string> = {
        'ev_charger': 'ev_station',
        'wallbox': 'ev_station',
        'hvac': 'heat_pump',
        'battery': 'battery_charging_full',
        'storage': 'battery_charging_full',
        'inverter': 'power',
        'heatpump': 'heat_pump',
      };
      
      const normalizedType = type.toLowerCase();
      return typeMap[normalizedType] || 'device_hub'; // default icon
    };

    const colorIndex = devices.length % BORDER_COLORS.length;
    const newDevice: GridDevice = {
      id: backendDevice.ski,
      name: backendDevice.generalInfo.deviceName || backendDevice.shipInfo.instanceName || 'Unnamed Device',
      icon: deviceTypeToIcon(backendDevice.generalInfo.type),
      power: '0.0 kW',
      borderColor: BORDER_COLORS[colorIndex],
      iconColor: ICON_COLORS[colorIndex],
      position: generateRandomPosition(),
      backendDevice: backendDevice, // Store the original device
    };

    setDevices([...devices, newDevice]);
    console.log('Device added to grid:', newDevice);
  };

  return (
    <>
      <Grid 
        devices={devices}
        selectedDevice={selectedDevice} 
        onDeviceSelect={setSelectedDevice}
        onAddDevice={handleAddDevice}
        onDeviceDelete={handleDeleteDevice}
      />
      {selectedDevice && <SelectedDevice device={selectedDevice} />}
    </>
  );
}
