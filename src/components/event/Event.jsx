import "./event.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { isAdmin } from "../../utils/admin";


const Event = ({ event }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const isImage = (url) => {
    if (url === null) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".heic"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };
  
  const isVideo = (url) => {
    if (url === null) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  }; 
  
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (eventId) => {
      return makeRequest.delete("/posts/events/" + eventId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["events"]);
    },
  });
  
  const delete_from_s3 = async (img) => {
    try {
      await makeRequest.delete(`/delete/${encodeURIComponent(img)}`);
    } catch (err) {
      console.log(err);
    }
  }
  
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const img = event.file;
    if (currentUser.id === event.userId || isAdmin(currentUser)) {
      deleteMutation.mutate(event.id);
      if (event.file != null && event.file != "") {
        await delete_from_s3(img);
      }
    }
  };

  function ensureAbsoluteUrl(url) {
    // Check if the URL starts with http://, https://, or www.
    if (!url.match(/^(https?:\/\/|www\.)/)) {
      // If it doesn't start with any, add https://www.
      return `https://www.${url}`;
    } else if (url.match(/^www\./)) {
      // If it starts with www., add https:// only.
      return `https://${url}`;
    }
    // If it starts with http:// or https://, return as is.
    return url;
  }
  
  return (
    <div className="event">
      <div className="container">
        <div className="top">
            <h3>{event.name}</h3>
            <div className="user">
            <div className="userInfo">
                <img src={event.profilePic} alt="" />
                <div className="details">
                <Link
                    to={`/profile/${event.userId}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <span className="name">{event.username}</span>
                </Link>
                </div>
            </div>
            </div>
            <div className = "center">
              {(!currentUser ? <div/> : event.userId === currentUser.id || isAdmin(currentUser)) &&
                <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
              }
              {!currentUser ? <div/> : menuOpen && (event.userId === currentUser.id || isAdmin(currentUser)) && (
                <button className="delete" onClick={handleDelete}>delete event</button>
              )}
            </div>
        </div>
        
        <div className="content">
            <div className="row">
              <AnnouncementIcon />
              <span className="event-category">{event.category}</span>
            </div>
            <div className="row">
                <AccessTimeIcon/>
                <span className="date">{moment(event.date).format('MMMM D, YYYY hh:mm A')}</span>
            </div>
            <div className="row">
                <LocationOnIcon/>
                <span>{event.location}</span>
            </div>
            {event.url && 
            <div className="row">
                <InsertLinkIcon/>
                <a className="link" href={ensureAbsoluteUrl(event.url)} target="_blank" rel="noopener noreferrer">{event.url}</a>
            </div>}
            {event.description && 
            <div className="row">
                <HelpOutlineIcon/>
                <span>{event.description}</span>
            </div>}
          {isImage(event.file) && <img src={event.file}/>}
          {isVideo(event.file) && (
            <video controls>
              <source src={event.file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default Event;
