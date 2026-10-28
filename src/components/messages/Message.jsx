import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./messages.scss";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import DefaultAvatar from "../../assets/pfp.jpg";

const Message = ({ message, currentUser }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return makeRequest.put("/messages/markRead", { id: message.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["newMessages"]);
    },
  });

  useEffect(() => {
    // Call the API endpoint if notification.new is true
    if (message.read === 0 && message.msgFrom !== currentUser.id) {
      const timer = setTimeout(() => {
        mutation.mutate(message);
      }, 5000); // Delay in milliseconds (20000ms = 20s)

      // Cleanup function to clear the timeout if the component unmounts
      // or if the effect runs again before the timeout is completed.
      return () => clearTimeout(timer);
    }
  }, [message, mutation]);

  return (
    <div className="row">
      {message.msgTo === currentUser.id && (
        <img
          src={message.profilePic || DefaultAvatar}
          className="profilePic"
          alt=""
        />
      )}
      <div
        className={message.msgFrom === currentUser.id ? "msg-to" : "msg-from"}
      >
        {message.msg}
      </div>
      {message.read === 0 && message.msgFrom !== currentUser.id && (
        <FiberManualRecordIcon
          style={{ color: "red", marginRight: 15 }}
          fontSize="small"
        />
      )}
    </div>
  );
};

export default Message;
