import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MenuContent from "./MenuContent";
import ComputerIcon from "@mui/icons-material/Computer";

import { useEffect, useState } from "react";

const drawerWidth = 400;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

type Device = any; // Replace 'any' with your actual device type if available

const SideMenu = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [localSki, setLocalSki] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = () => {
      fetch("/api/mdns/discovery")
        .then((res) => res.json())
        .then((data) => setDevices(data))
        .catch((err) => console.error("Failed to fetch devices:", err));
    };

    fetchDevices(); // initial fetch
    const interval = setInterval(fetchDevices, 5000);

    fetch("/api/ski/local")
      .then((res) => res.json())
      .then((data) => setLocalSki(data.ski))
      .catch((err) => console.error("Failed to fetch local SKI:", err));

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          ml: "auto",
          mr: "auto",
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <ComputerIcon sx={{ mr: 1 }} />
        Devices
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent devices={devices} localSki={localSki} />
      </Box>
    </Drawer>
  );
};

export default SideMenu;
