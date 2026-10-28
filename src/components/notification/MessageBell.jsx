import React from "react";
import Badge from "@mui/material/Badge";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const MessageBell = ({ iconColor }) => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const {
    isLoading,
    error,
    data: messages,
  } = useQuery({
    queryKey: ["newMessages"],
    queryFn: () => makeRequest.get("/messages/new").then((res) => res.data),
  });

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : !messages ? (
        ""
      ) : (
        <Tooltip
          title={
            messages.length
              ? `You have ${messages.length} new messages!`
              : "No new messages"
          }
        >
          <IconButton
            color={iconColor}
            onClick={messages.length ? handleOpen : null}
          >
            <Badge badgeContent={messages.length} color="error">
              <EmailOutlinedIcon style={{ color: iconColor }} />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default MessageBell;
