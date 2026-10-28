import React from "react";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const NotificationBell = ({ iconColor }) => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const {
    isLoading,
    error,
    data: notifications,
  } = useQuery({
    queryKey: ["newNotifications"],
    queryFn: () =>
      makeRequest.get("/notifications/new").then((res) => res.data),
  });

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : !notifications ? (
        ""
      ) : (
        <Tooltip
          title={
            notifications.length
              ? `You have ${notifications.length} new notifications!`
              : "No new notifications"
          }
        >
          <IconButton
            color={iconColor}
            onClick={notifications.length ? handleOpen : null}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon style={{ color: iconColor }} />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default NotificationBell;
