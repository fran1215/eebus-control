import { useState, useEffect } from 'preact/hooks';
import SidebarDevices from './SidebarDevices';
import type { Device as BackendDevice, Device } from '../api/models/device';
import { wsService } from '../services/websocket';

interface GridDevice {
  id: string;
  name: string;
  icon: string;
  power?: string;
  flow?: string;
  borderColor: string;
  iconColor: string;
  position: { x: number; y: number };
  selected?: boolean;
}

interface GridProps {
  devices: GridDevice[];
  selectedDevice?: GridDevice | null;
  onDeviceSelect?: (device: Device) => void;
  onAddDevice?: (device: BackendDevice) => void;
  onDeviceDelete?: (deviceId: string) => void;
  simulationRunning?: boolean;
  localSki?: string;
}

// Helper to parse position object for SVG calculations
const parsePosition = (position: { x: number; y: number }): { top: number; left: number } => {
  return { top: position.y, left: position.x };
};

// Calculate the edge point of a rectangle where a line from the center should connect
const getEdgePoint = (
  centerX: number,
  centerY: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): { x: number; y: number } => {
  // Calculate device center
  const deviceCenterX = rectX + rectWidth / 2;
  const deviceCenterY = rectY + rectHeight / 2;
  
  // Calculate angle from CEM to device
  const angle = Math.atan2(deviceCenterY - centerY, deviceCenterX - centerX);
  
  // Calculate intersection with device rectangle edges
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  // Check which edge the line intersects
  let edgeX = deviceCenterX;
  let edgeY = deviceCenterY;
  
  // Test intersection with each edge
  const halfWidth = rectWidth / 2;
  const halfHeight = rectHeight / 2;
  
  // Horizontal edges
  if (Math.abs(sin) > 0.001) {
    const yEdge = sin > 0 ? deviceCenterY - halfHeight : deviceCenterY + halfHeight;
    const xAtEdge = deviceCenterX + (yEdge - deviceCenterY) * (cos / sin);
    
    if (Math.abs(xAtEdge - deviceCenterX) <= halfWidth) {
      edgeX = xAtEdge;
      edgeY = yEdge;
      return { x: edgeX, y: edgeY };
    }
  }
  
  // Vertical edges
  if (Math.abs(cos) > 0.001) {
    const xEdge = cos > 0 ? deviceCenterX - halfWidth : deviceCenterX + halfWidth;
    const yAtEdge = deviceCenterY + (xEdge - deviceCenterX) * (sin / cos);
    
    if (Math.abs(yAtEdge - deviceCenterY) <= halfHeight) {
      edgeX = xEdge;
      edgeY = yAtEdge;
    }
  }
  
  return { x: edgeX, y: edgeY };
};

export default function Grid({ devices, selectedDevice, onDeviceSelect, onAddDevice, onDeviceDelete, simulationRunning = false, localSki = '' }: GridProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [showCemPopover, setShowCemPopover] = useState(false);

  // Use the localSki prop instead of fetching it

  const handleAddDevice = (discoveredDevice: BackendDevice) => {
    onAddDevice?.(discoveredDevice);
  };

  const handleScanGrid = () => {
    setIsScanning(true);
    console.log('Scanning local grid...');
    setTimeout(() => setIsScanning(false), 2000);
  };

  const handleDeviceClick = (device: GridDevice) => {
    onDeviceSelect?.(device);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="glass-panel rounded-3xl relative overflow-hidden grid-container border border-white/10 min-h-[450px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div 
              className="size-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_50px_rgba(19,146,236,0.3)] relative cursor-pointer hover:scale-105 transition-transform group/cem"
              onMouseEnter={() => setShowCemPopover(true)}
              onMouseLeave={() => setShowCemPopover(false)}
            >
              <span className="material-symbols-outlined text-4xl text-white">
                router
              </span>
              {/* Modern Popover */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-200 ${
                showCemPopover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}>
                <div className="glass-card px-4 py-3 rounded-xl border border-primary/30 shadow-xl min-w-[280px] backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      router
                    </span>
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                      Master CEM
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mb-0.5">
                        Device Name
                      </p>
                      <p className="text-white text-xs font-medium">
                        Energy Management System
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mb-0.5">
                        SKI
                      </p>
                      <p className="text-primary text-[10px] font-mono break-all">
                        {localSki || 'Loading...'}
                      </p>
                    </div>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800/90 border-r border-b border-primary/30 rotate-45"></div>
                </div>
              </div>
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <p className="text-white font-black text-sm uppercase tracking-widest">
                  Master CEM
                </p>
                <p className="text-primary text-[10px] font-bold">
                  NODE_001_ACTIVE
                </p>
              </div>
            </div>
          </div>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
            preserveAspectRatio="none"
            viewBox="0 0 1000 600"
          >
            {/* Center point (CEM) is at 500, 300 in the 1000x600 viewBox */}
            {devices.map((device) => {
              const pos = parsePosition(device.position);
              // Convert percentage to viewBox coordinates
              const rectX = (pos.left / 100) * 1000;
              const rectY = (pos.top / 100) * 600;
              
              // Device card dimensions in viewBox coordinates
              // w-48 is 192px, assuming container is ~1000px, that's ~192/1000 * 1000 = 192
              const rectWidth = 192;
              const rectHeight = 100; // Approximate height
              
              // Calculate edge point where line should connect
              const edgePoint = getEdgePoint(500, 300, rectX, rectY, rectWidth, rectHeight);
              
              return (
                <line
                  key={device.id}
                  stroke="#1392ec"
                  stroke-dasharray="4"
                  stroke-width="1"
                  x1="500"
                  y1="300"
                  x2={edgePoint.x}
                  y2={edgePoint.y}
                />
              );
            })}
          </svg>
          {devices.map((device) => (
            <div 
              key={device.id} 
              className="absolute z-10"
              style={{
                left: `${device.position.x}%`,
                top: `${device.position.y}%`,
              }}
            >
              <button
                onClick={() => handleDeviceClick(device)}
                className={`glass-card p-4 rounded-xl w-48 border-l-4 ${device.borderColor} hover:ring-2 hover:ring-primary text-left transition-all ${
                  selectedDevice?.id === device.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`material-symbols-outlined ${device.iconColor}`}>
                    {device.icon}
                  </span>
                  <h4 className="text-white font-bold text-xs truncate">
                    {device.name}
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 uppercase font-bold">
                      {device.power ? 'Power' : 'Flow'}
                    </span>
                    <span className="text-white font-mono">
                      {simulationRunning ? (device.power || device.flow) : '0.00'}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <SidebarDevices 
        onAddDevice={onAddDevice}
        onDeviceDelete={onDeviceDelete}
        addedDeviceIds={devices.map(d => d.id)}
      />
    </div>
  );
}