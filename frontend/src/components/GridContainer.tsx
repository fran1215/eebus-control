import { useState, useEffect } from 'preact/hooks';
import Grid from './Grid.tsx';
import SelectedDevice from './SelectedDevice.tsx';
import type { Device as BackendDevice } from '../api/models/device';
import type { LpcStatus } from '../api/models/lpcState';
import { wsService } from '../services/websocket';

interface GridDevice {
  id: string;
  name: string;
  icon: string;
  power?: number; // W
  energy?: number; // Wh
  current?: number; // A
  voltage?: number; // V
  frequency?: number; // Hz
  consumptionNominalMax?: number; // W
  iconColor: string;
  position: { x: number; y: number }; // Changed to coordinate object
  backendDevice?: BackendDevice; // Store the original backend device
  lpcStatus?: LpcStatus; // EEBUS LPC state reported by the backend
}

const ICON_COLORS = [
  'text-green-500',
  'text-blue-400',
  'text-purple-500',
  'text-orange-500',
  'text-pink-500',
  'text-yellow-500',
];

interface GridContainerProps {
  simulationRunning?: boolean;
  localSki?: string;
  onDevicesChange?: (skis: string[]) => void;
}

export default function GridContainer({ simulationRunning = false, localSki = '', onDevicesChange }: GridContainerProps) {
  const [selectedDevice, setSelectedDevice] = useState<GridDevice | null>(null);
  const [devices, setDevices] = useState<GridDevice[]>([]);

  // Notify parent when devices change
  useEffect(() => {
    if (onDevicesChange) {
      const skis = devices.map(d => d.id);
      onDevicesChange(skis);
    }
  }, [devices, onDevicesChange]);

  // Listen for MPC updates from WebSocket
  useEffect(() => {
    const unsubscribe = wsService.onMessage('mpc_update', (data: any) => {
      const { ski, power, energy, current, voltage, frequency } = data;

      // Kept in the backend's units and formatted at the readouts, so a
      // reading that never arrives can fall back to zero there.
      const readings = { power, energy, current, voltage, frequency };

      // Update the device with matching SKI
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === ski ? { ...device, ...readings } : device
        )
      );

      // Update selected device if it matches
      setSelectedDevice(prevSelected =>
        prevSelected && prevSelected.id === ski
          ? { ...prevSelected, ...readings }
          : prevSelected
      );
      
      console.log(`MPC Update: ${ski} - ${power}W, ${energy}Wh, ${voltage}V, ${current}A, ${frequency}Hz`);
    });

    return unsubscribe;
  }, []);

  // Listen for LPC updates from WebSocket
  useEffect(() => {
    const unsubscribe = wsService.onMessage('lpc_update', (data: any) => {
      const { ski, consumption_nominal_max } = data;
      
      // Update the device with matching SKI
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === ski 
            ? { 
                ...device, 
                consumptionNominalMax: consumption_nominal_max
              }
            : device
        )
      );

      // Update selected device if it matches
      setSelectedDevice(prevSelected => 
        prevSelected && prevSelected.id === ski
          ? {
              ...prevSelected,
              consumptionNominalMax: consumption_nominal_max
            }
          : prevSelected
      );
      
      console.log(`LPC Update: ${ski} - Consumption Nominal Max: ${consumption_nominal_max} W`);
    });

    return unsubscribe;
  }, []);

  // Listen for LPC state updates from WebSocket
  useEffect(() => {
    const applyStatuses = (statuses: LpcStatus[]) => {
      const bySki = new Map(statuses.map(status => [status.ski, status]));

      setDevices(prevDevices =>
        prevDevices.map(device =>
          bySki.has(device.id)
            ? { ...device, lpcStatus: bySki.get(device.id) }
            : device
        )
      );

      setSelectedDevice(prevSelected =>
        prevSelected && bySki.has(prevSelected.id)
          ? { ...prevSelected, lpcStatus: bySki.get(prevSelected.id) }
          : prevSelected
      );
    };

    const unsubscribeUpdate = wsService.onMessage('lpc_state_update', (data: LpcStatus) => {
      applyStatuses([data]);
      console.log(`LPC State: ${data.ski} - ${data.state}`);
    });

    // Snapshot of every device, so a reload or reconnect starts in sync
    const unsubscribeSnapshot = wsService.onMessage('lpc_states', (data: { states: LpcStatus[] }) => {
      applyStatuses(data.states || []);
    });

    const unsubscribeConnected = wsService.onMessage('connected', () => {
      wsService.send('get_lpc_states');
    });

    if (wsService.isConnected()) {
      wsService.send('get_lpc_states');
    }

    return () => {
      unsubscribeUpdate();
      unsubscribeSnapshot();
      unsubscribeConnected();
    };
  }, []);

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
    // Send remove_device message to backend
    wsService.send('remove_device', { ski: deviceId });
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

    const colorIndex = devices.length % ICON_COLORS.length;
    const newDevice: GridDevice = {
      id: backendDevice.ski,
      name: backendDevice.generalInfo.deviceName || backendDevice.shipInfo.instanceName || 'Unnamed Device',
      icon: deviceTypeToIcon(backendDevice.generalInfo.type),
      power: 0,
      energy: 0,
      current: 0,
      voltage: 0,
      frequency: 0,
      iconColor: ICON_COLORS[colorIndex],
      position: generateRandomPosition(),
      backendDevice: backendDevice, // Store the original device
    };

    setDevices([...devices, newDevice]);
    console.log('Device added to grid:', newDevice);

    wsService.send('add_device', { ski: backendDevice.ski});
    // The backend may already know this device's LPC state, so ask rather than
    // leaving the card on Init until its next transition.
    wsService.send('get_lpc_states');
  };

  return (
    <>
      <Grid 
        devices={devices}
        selectedDevice={selectedDevice} 
        onDeviceSelect={setSelectedDevice}
        onAddDevice={handleAddDevice}
        onDeviceDelete={handleDeleteDevice}
        simulationRunning={simulationRunning}
        localSki={localSki}
      />
      {selectedDevice && <SelectedDevice device={selectedDevice} simulationRunning={simulationRunning} />}
    </>
  );
}
