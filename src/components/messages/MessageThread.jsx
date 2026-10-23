import ProfileLink from "../profile/ProfileLink";
import { useContext, useState, useRef, useEffect } from "react";

import { AuthContext } from "../../context/authContext";
import moment from 'moment';
import "./messages.scss";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import SendIcon from '@mui/icons-material/Send';
import InputEmoji from 'react-input-emoji';
import Message from "./Message";
import DefaultAvatar from "../../assets/pfp.jpg";
import ProviderBadge from "../provider/ProviderBadge";

const MessageThread = ({user, name}) => {
  const { currentUser } = useContext(AuthContext);
  const [inputText, setInputText] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const queryClient = useQueryClient();
  const userId = user;
  const [msgSubmitted, setMsgSubmitted] = useState(false);

  // Ref to the last message element
  const endOfMessagesRef = useRef(null);

  let inputHandler = (e) => {
    //convert input text to lower case
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
  };

  const handleClick = () => {
    if (newMsg == "") {return;}
    const msgTo = userId;
    const msg = newMsg;
    setMsgSubmitted(true);
    setTimeout(() => {
      mutation.mutate({ msg, msgTo });
      setMsgSubmitted(false);
    }, 700);
    setNewMsg("");

  };

  const mutation = useMutation({
    mutationFn: (newMessage) => {
      return makeRequest.post("/messages", newMessage);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["messages"]);
    },
  });

  const { data: threadUser } = useQuery({
    queryKey: ["threadUser", currentUser.id, userId],
    queryFn: () => makeRequest.get("/messages/participant/" + userId).then((res) => res.data),
  });

  const { isLoading, error, data: mData } = useQuery({
    queryKey: ["messages", currentUser.id, userId],
    queryFn: () => makeRequest.get("/messages?userId=" + userId).then((res) => {return res.data})
  });

  // Auto-scroll to the latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mData]); // Depend on mData, so it triggers on message change

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading messages: {error.message}</div>;
  }

  // Group messages by day
  const groupedMessages = mData.reduce((result, message) => {
    const day = moment(message.createdAt).format("YYYY-MM-DD");
    if (!result[day]) {
      result[day] = [];
    }
    result[day].push(message);
    return result;
  }, {});

  const handleChange = (e) => {
    setNewMsg(e.target.value);
  }

  return (
        <div className="msg-right">
            {!isLoading && mData &&
              <div className="thread">
                {threadUser && (
                  threadUser.profileVisible ? <ProfileLink to={`/profile/${threadUser.id}`} className="thread-header" style={{ textDecoration: "none", color: "inherit" }}>
                    <img src={threadUser.profilePic || DefaultAvatar} alt="" className="thread-header-pic" />
                    <span className="thread-header-name">{threadUser.username}</span><ProviderBadge providerType={threadUser.provider_type} label={threadUser.providerTypeLabel} />
                  </ProfileLink> : <div className="thread-header"><img src={threadUser.profilePic || DefaultAvatar} alt="" className="thread-header-pic" /><span className="thread-header-name">{threadUser.username}</span><ProviderBadge providerType={threadUser.provider_type} label={threadUser.providerTypeLabel} /></div>
                )}
                {/* Render messages grouped by day */}
                {Object.entries(groupedMessages).map(([day, messages]) => (
                    <div key={day} className="convo">
                    <div className="date">
                        {moment(day).format("dddd M/D/YYYY")}
                    </div>
                    {messages.map((message) => (
                        <Message key={message.id} message={message} currentUser={currentUser}>
                        {/* Add ref to the last message */}
                        </Message>
                    ))}
                    <div ref={endOfMessagesRef} />
                    </div>
                ))}
              </div>
            }
            
            <div className="writePC">
              <img className="pfp" src={currentUser.profilePic} alt="" />
              <InputEmoji 
                placeholder="Message..." 
                value={newMsg}
                onChange={setNewMsg}
                borderRadius = {10}
              />
              <button className="submit" disabled = {msgSubmitted} onClick = {handleClick}> <SendIcon style={msgSubmitted === false ? {color: "gray"} : {color: "green"}}/> </button>
            </div>

            <div className="writeMobile">
              <input 
                placeholder="Message..."
                value={newMsg}
                onChange={handleChange}
              />
              <button className="submit" disabled = {msgSubmitted} onClick = {handleClick}> <SendIcon style={msgSubmitted === false ? {color: "gray"} : {color: "green"}}/> </button>
            </div>

        </div>
  );
};

export default MessageThread;
