import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import Divider from "@mui/material/Divider";
import { gray } from "../../shared-theme/themePrimitives";
import { useTheme } from "@mui/material/styles";

const secondaryListItems = [
  { text: "Local Ski", icon: <HomeRoundedIcon /> },
  { text: "Settings", icon: <SettingsRoundedIcon /> },
];

export default function MenuContent({
  devices = [],
  localSki = null,
}: {
  devices?: any[];
  localSki?: string | null;
}) {
  const theme = useTheme();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {devices.length > 0 ? (
          devices.map((device, idx) => (
            <ListItem
              key={device.ski || idx}
              disablePadding
              sx={{
                display: "block",
                mb: 1.5, // more space between entries
                px: 1,
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[900]
                      : theme.palette.grey[100],
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[900]
                        : theme.palette.grey[200],
                  },
                }}
              >
                <ListItemText
                  primary={
                    device.shipInfo?.instanceName ||
                    device.generalInfo?.deviceName ||
                    "Unknown Device"
                  }
                  secondary={`SKI: ${device.ski}`}
                  slotProps={{
                    primary: {
                      sx: {
                        color: theme.palette.mode === "dark" ? "#000" : undefined,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No devices found" />
          </ListItem>
        )}
      </List>
      <Divider sx={{ my: 1 }} />
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={
                  item.text === "Local Ski" && localSki
                    ? `${item.text}: ${localSki}`
                    : item.text
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
