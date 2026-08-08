import "./job.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useContext, useEffect } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from "react-i18next";
import InsertLink from "@mui/icons-material/InsertLink";
import { isAdmin } from "../../utils/admin";

const Job = ({ job }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const isImage = (url) => {
    if (url === null) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".heic"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };
  
  const isVideo = (url) => {
    if (url === null) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (jobId) => {
      return makeRequest.delete("/posts/jobs/" + jobId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["jobs"]);
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
    const img = job.img;
    if (currentUser.id === job.userId || isAdmin(currentUser)) {
      deleteMutation.mutate(job.id);
      if (job.img != null && job.img != "") {
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
  };

  return (
    <div className="job">
      <div className="container">
        <div className="top">
            <h3>{job.name}</h3>
            <div className="user">
            <div className="userInfo">
                <img src={job.profilePic} alt="" />
                <div className="details">
                <Link
                    to={`/profile/${job.userId}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <span className="name">{job.username}</span>
                </Link>
                </div>
            </div>
            </div>
            <div className = "center">
              {!currentUser? <div/> : job.userId === currentUser.id && 
                <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
              }
              {!currentUser ? <div/> : menuOpen && (job.userId === currentUser.id || isAdmin(currentUser)) && (
                <button className="delete" onClick={handleDelete}>delete job</button>
              )}
            </div>
        </div>
        
        <div className="content">
          {job.url && job.url != "" &&
            <div className="row">
                <InsertLink/>
                <span>
                  <a className="link" href={ensureAbsoluteUrl(job.url)} target="_blank" rel="noopener noreferrer" style={{fontSize: 14}}>{job.url}</a>
                </span>
            </div>
          }
            <div className="row">
                <PaidIcon/>
                <span>{job.pay}</span>
            </div>
            <div className="row">
                <CalendarMonthIcon/>
                <span>{job.schedule}</span>
            </div>
            <div className="row">
                <LocationOnIcon/>
                <span>{job.location}</span>
            </div>
            <div className="row">
                <EmailIcon/>
                <span className="contact">
                  {t('jobs.contact')}  
                  <a className="link" href={`mailto:${job.contact}`} target="_blank" rel="noopener noreferrer">{job.contact}</a>
                </span>
            </div>
            {job.description && 
            <div className="row">
                <span>{job.description}</span>
            </div>}
          {isImage(job.img) && <img src={job.img}/>}
          {isVideo(job.img) && (
            <video controls>
              <source src={job.img} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default Job;
