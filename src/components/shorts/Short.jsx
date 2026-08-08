import "./short.scss";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import moment from "moment";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import ShortReactions from "../reactionBar/ShortReactions";
import { isAdmin } from "../../utils/admin";

const Short = ({ short }) => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const shortId = short.id;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (shortId) => {
      return makeRequest.delete("/posts/shorts/" + shortId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["shorts"]);
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
    const video = short.videoURL;
    if (currentUser.id === short.userId || isAdmin(currentUser)) {
      deleteMutation.mutate(shortId);
      if (short.videoURL !== null && short.videoURL !== "") {
        await delete_from_s3(video);
      }
    }
  };

  return (
    <div className="short">
        <div className="container">
            <div className="deleteMenu">
              {currentUser && menuOpen && (short.userId === currentUser.id || isAdmin(currentUser)) && (
                <button onClick={handleDelete}>delete</button>
              )}
              <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
            </div>
            <div className="content">
              <div className="centered">
                <video controls>
                    <source src={short.videoURL + "#t=0.001"} className="video" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            <div className="userInfo">
                <img src={short.profilePic} alt="" />
                <div className="details">
                    <Link
                        to={`/profile/${short.userId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <span className="name">{short.username}</span>
                    </Link>
                    <span className="date">{moment(short.createdAt).fromNow()}</span>
                </div>
            </div>

            <p>{short.desc}</p>

            <div>
              <ShortReactions shortId={short.id} shortUserId={short.userId} currentUser={currentUser}/>
            </div>
        </div>
    </div>
  );
};

export default Short;
