import { useState, useEffect } from "preact/hooks";
import Navbar from "./Navbar.tsx";
import GridContainer from "./GridContainer.tsx";
import Footer from "./Footer.tsx";
import { wsService } from "../services/websocket";

export default function AppContainer() {
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [localSki, setLocalSki] = useState<string>("");
  const [deviceSkis, setDeviceSkis] = useState<string[]>([]);

  const handleSimulationToggle = () => {
    const newState = !simulationRunning;
    if (newState) {
      // Start simulation with current devices
      wsService.send("start_simulation", { devices: deviceSkis });
    } else {
      // Stop simulation
      wsService.send("stop_simulation", {});
    }
    setSimulationRunning(newState);
  };

  useEffect(() => {
    // Connect to WebSocket on component mount
    wsService.connect();

    // Listen for connection status
    const handler = (type: string, data: any) => {
      if (type === "connected") {
        setConnected(true);
        setLocalSki(data.ski || "");
        console.log("Connected to WebSocket server:", data);
      }
    };

    wsService.addHandler(handler);

    // Cleanup on unmount
    return () => {
      wsService.removeHandler(handler);
      // Don't disconnect as other components might still be using it
    };
  }, []);

  return (
    <>
      <Navbar
        simulationRunning={simulationRunning}
        onToggleSimulation={handleSimulationToggle}
      />
      {!connected && (
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="glass-card p-4 rounded-xl border border-yellow-500/30 flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-500 animate-pulse">
              sync
            </span>
            <p className="text-white text-sm">
              Connecting to WebSocket server...
            </p>
          </div>
        </div>
      )}
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <GridContainer
          simulationRunning={simulationRunning}
          localSki={localSki}
          onDevicesChange={setDeviceSkis}
        />
      </main>
      <Footer />
    </>
  );
}
