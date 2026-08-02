import "./comment.scss";
import moment from "moment";

const Comment = ({ comment }) => {
  const containerStyle = {
    height: 0,
    paddingBottom: "25%",
    position: "relative",
    marginBottom: 10,
  };

  const iframeStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
  };

  return (
    <div className="comment">
      <div className="comment-content">
        <img className="pfp" src={comment.profilePic} alt="" />
        <div className="comment-info">
          <span>{comment.username}</span>
          <p>{comment.desc}</p>
        </div>
        <span className="date">{moment(comment.createdAt).fromNow()}</span>
      </div>
      {comment.gif && (
        <div style={containerStyle}>
          <iframe
            src={comment.gif}
            width="100%"
            height="100%"
            style={iframeStyle}
            frameBorder="0"
            className="giphy-embed"
            allowFullScreen
            title="Giphy Embed"
          />
        </div>
      )}
    </div>
  );
};

export default Comment;
