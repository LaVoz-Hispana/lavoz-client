import "./post.scss";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import RecommendIcon from '@mui/icons-material/Recommend';
import Tamu from "../../assets/tamu_flag.png";
import Comment from "../comment/Comment";
import InputEmoji from 'react-input-emoji';
import Carousel from "react-simply-carousel";
import { useTranslation } from 'react-i18next';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ImageNotFound from "../../assets/img_not_found.png";
import AddGif from "@mui/icons-material/GifBox";
import ReactGiphySearchbox from 'react-giphy-searchbox';
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";
import Reactions from "../reactionBar/Reactions";
import { isAdmin } from "../../utils/admin";
import PoststationAdminLogo from "../../assets/poststation-admin.png";
import {
  createPostTextRegex,
  ensureAbsoluteUrl,
  getDisplayUrl,
  trimTrailingPunctuation,
} from "../../utils/postLinks";

const Post = ({ post, openComments = false }) => {
  const { t } = useTranslation();

  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [reaction, setReaction] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const postId = post.id;
  const isOfficialPost = Boolean(post.isAdminPost);
  const authorName = isOfficialPost ? "Poststation" : post.username;
  const authorProfilePic = isOfficialPost ? PoststationAdminLogo : post.profilePic;
  const [rated, setRated] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [gifOpen, setGifOpen] = useState(false);
  const [gif, setGif] = useState(null);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const MAX_LENGTH = 2250;
  const PREVIEW_LENGTH = 400;
  
  const containerStyle = {
    height: 0,
    paddingBottom: '25%',
    position: 'relative',
  };

  const iframeStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () => makeRequest.get("/likes?postId=" + post.id).then((res) => {return res.data})
  });
  const queryClient = useQueryClient();

  // Extract non-null image URLs from the post object
  const imageUrls = Object.keys(post)
  .filter(key => key.startsWith('img') && post[key] !== null)
  .map(key => post[key]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      const hasReacted = data.some((like) => like.userId === currentUser.id);

      if (hasReacted) {
        await makeRequest.delete('/likes?postId=' + post.id);
      }

      return makeRequest.post('/likes', { postId: post.id, reaction: reaction, postUserId: post.userId });
    },
    onSuccess: () => {
      // Close reactions after a short delay
      setTimeout(() => {
        setReactionsOpen(false);
      }, 800);
      queryClient.invalidateQueries(['likes']);
    },
  });

  const deleteLikeMutation = useMutation({
    mutationFn: () => {
      return makeRequest.delete("/likes?postId=" + post.id);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["likes"]);
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (postId) => {
      return makeRequest.delete("/posts/" + postId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["posts"]);
    },
  });

  useEffect(() => {
    if (!currentUser) return;
    if (data && data.some((like) => like.userId === currentUser.id)) {
      const userReaction = data.find((like) => like.userId === currentUser.id).reaction;
      setReaction(userReaction);
    } else {
      setReaction(0);
    }
  }, [data, currentUser]);
  
  useEffect(() => {
    if (!currentUser) return;
    if (data) {
      const hasReacted = data.some((like) => like.userId === currentUser.id);
      setRated(hasReacted);
    }
  }, [data, currentUser]);

  useEffect(() => {
    // Set commentOpen based on the openComments prop
    setCommentOpen(openComments);
  }, [openComments]); // Depend on openComments so it updates if the prop changes

  const delete_from_s3 = async (img) => {
    try {
      await makeRequest.delete(`/delete/${encodeURIComponent(img)}`);
    } catch (err) {
      console.log(err);
    }
  };
  
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (currentUser.id === post.userId || isAdmin(currentUser)) {
      const img0 = post.img0;
      const img1 = post.img1;
      const img2 = post.img2;
      const img3 = post.img3;
      const img4 = post.img4;
      const img5 = post.img5;
      const img6 = post.img6;
      const img7 = post.img7;
      const img8 = post.img8;
      const img9 = post.img9;
      deleteMutation.mutate(post.id);
      if (post.img0 != null && post.img0 != "") {
        await delete_from_s3(img0);
      }
      if (post.img1 != null && post.img1 != "") {
        await delete_from_s3(img1);
      }
      if (post.img2 != null && post.img2 != "") {
        await delete_from_s3(img2);
      }
      if (post.img3 != null && post.img3 != "") {
        await delete_from_s3(img3);
      }
      if (post.img4 != null && post.img4 != "") {
        await delete_from_s3(img4);
      }
      if (post.img5 != null && post.img5 != "") {
        await delete_from_s3(img5);
      }
      if (post.img6 != null && post.img6 != "") {
        await delete_from_s3(img6);
      }
      if (post.img7 != null && post.img7 != "") {
        await delete_from_s3(img7);
      }
      if (post.img8 != null && post.img8 != "") {
        await delete_from_s3(img8);
      }
      if (post.img9 != null && post.img9 != "") {
        await delete_from_s3(img9);
      }
    }
  };

  const isImage = (url) => {
    if (url === null) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".heic"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };
  
  const isVideo = (url) => {
    if (url === null) return false;
    const videoExtensions = [".mp4", ".mov", ".webp", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isAudio = (url) => {
    if (url === null) return false;
    const audioExtensions = [".mp3", ".m4a", ".wav"];
    return audioExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  }

  const handleChange = (e) => {
    setDesc(e.target.value);
  }

  // FOR COMMENTS 
  const handleClick = () => {
    if (desc === "" || desc === null) return;
    const postId = post.id;
    const postUserId = post.userId;
    commentMutation.mutate({ desc, postId, postUserId, gif });
    setDesc("");
    setGif(null);
    setGifOpen(false);
  };

  const commentMutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments", post.id]);
    },
  });

  const { isLoading: commentsLoading, error: commentError, data: commentData } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => makeRequest.get("/comments?postId=" + postId).then((res) => {return res.data})
  });

  const displayComments = () => {
    if (!currentUser) {
      navigate("/guest");
      return; 
    }
    return(
      <div className="comments">
        <div className="writePC">
          <img className="pfp" src={currentUser.profilePic} alt="" />
            <InputEmoji 
              placeholder={t('post.write')} 
              value={desc}
              onChange={setDesc}
              borderRadius = {10}
            />
            <label>
              <AddGif style={{color: "gray", cursor: "pointer"}} onClick={()=>setGifOpen(!gifOpen)}/>
            </label>
          <button className="submit" onClick={handleClick}>{t('post.send')}</button>
        </div>

        <div className="writeMobile">
          <img className="pfp" src={currentUser.profilePic} alt="" />
          <input 
            placeholder={t('post.write')}
            value={desc}
            onChange={handleChange}
          />
          <button className="submit" onClick={handleClick}>{t('post.send')}</button>
        </div>

        {gif && 
          <div>
            <button className="x" style={{position: "relative", left: "70%"}}onClick={()=>setGif(null)}>
              <DisabledByDefault style={{color: "gray", fontSize: "medium", cursor: "pointer"}}/>
            </button>
            <div style={containerStyle}>
              <iframe
                src={gif}
                width="100%"
                height="100%"
                style={iframeStyle}
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
                title="Giphy Embed"
              ></iframe>
              {/* <p>
                <a href={gif}>
                  via GIPHY
                </a>
              </p> */}
            </div>
          </div>
        }
        {gifOpen &&
          <div className='searchbox-wrapper'>
            <ReactGiphySearchbox 
              apiKey='wTlyF2IWF5BelAJ5IdnYcy5NJPZlEW5Z' 
              onSelect={(item) => {
                setGif(item.embed_url);
                setGifOpen(false);
              }}
              masonryConfig = {[
                {columns: 2, imageWidth:110,gutter:5},
                {mq: "700px", columns: 3, imageWidth: 120, gutter: 5}
              ]}
              />
          </div>
        }
        {commentError
          ? "Something went wrong"
          : commentsLoading
          ? "loading"
          : commentData.map((comment) => (
            (<Comment comment={comment} key={comment.id} />)
          )
        )}
      </div>
    )
  }


  const getCarousel = () => {
    return(
      <div>
        <Carousel
          userSelect={true}
          activeSlideIndex={activeSlide}
          swipeTreshold={70}
          onRequestChange={setActiveSlide}
          forwardBtnProps={{
            children: <ArrowForwardIosIcon style={{color: "gray"}} fontSize="medium"/>,
            className: "right-arrow"
          }}
          backwardBtnProps={{
            children: <ArrowBackIosNewIcon style={{color: "gray"}} fontSize="medium"/>,
            className: "left-arrow"
          }}
          dotsNav={{
            show: true,
            itemBtnProps: {
              style: {
                height: 14,
                width: 14,
                borderRadius: "50%",
                border: 0,
                background: "lightgray",
                marginTop: 10,
                marginRight: 2,
                marginLeft: 2
              }
            },
            activeItemBtnProps: {
              style: {
                height: 14,
                width: 14,
                borderRadius: "50%",
                border: 0,
                background: "black",
                marginTop: 10,
                marginRight: 2,
                marginLeft: 2
              }
            }
          }}
          itemsToShow={1}
          speed={400}
        >
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                width: 400,
                height: 400
              }}
            > 
            {isImage(imageUrl) ? <img className="image" src={imageUrl}/> 
            : isVideo(imageUrl) ?
            <video controls>
              <source src={imageUrl + "#t=0.001"} className="video" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            : 
            <audio controls>
              <source src={post.img0} className="video" />
            </audio>
            }
            </div>
          ))}
        </Carousel>
      </div>
    )
  }

  const getSingleFile = () => {
    if (post.img0 === 'not-found') {
      return <img className="image" src={ImageNotFound}/>
    }
    if (isImage(post.img0)) 
      return <img className="image" src={post.img0}/>
    else if (isVideo(post.img0)) { 
      return (
        <video controls>
          <source src={post.img0 +"#t=0.001"} className="video" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )
    } else if (isAudio(post.img0)) {
      return (
        <audio controls>
          <source src={post.img0} className="video" />
        </audio>
      )
    }
  }

  
  const jobCategories = ["construction", "restaurant", "students", "office", "sales", "temporary"];

  const postTypeLabel = (type) => {
    if (!type) return null;
    return t(`projectPost.${type}`, type.replace(/_/g, " "));
  };

  const taggedUsers = post.taggedUsers
    ? post.taggedUsers.split("||").map((tag) => {
        const [id, username] = tag.split("::");
        return { id, username };
      })
    : [];

  const renderPostText = (text) => {
    if (!text) return null;

    const renderMentions = (segment, keyPrefix) => {
      if (taggedUsers.length === 0) return segment;

      return segment.split(/(@[^\s@]+)/g).map((part, index) => {
        if (!part) return null;
        const taggedUser = taggedUsers.find((user) => `@${user.username}`.toLowerCase() === part.toLowerCase());
        return taggedUser
          ? <Link key={`${keyPrefix}-mention-${index}`} to={`/profile/${taggedUser.id}`} className="inline-mention">{part}</Link>
          : part;
      });
    };

    const nodes = [];
    const richTextRegex = createPostTextRegex();
    let lastIndex = 0;
    let match;

    while ((match = richTextRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(...renderMentions(text.slice(lastIndex, match.index), `text-${lastIndex}`));
      }

      if (match[1] && match[2]) {
        nodes.push(
          <a
            key={`md-link-${match.index}`}
            href={ensureAbsoluteUrl(match[2])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-link"
          >
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        const { trimmed, suffix } = trimTrailingPunctuation(match[3]);
        const displayUrl = getDisplayUrl(trimmed);
        nodes.push(
          <a
            key={`url-${match.index}`}
            href={ensureAbsoluteUrl(trimmed)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-link"
          >
            {displayUrl}
          </a>
        );
        if (suffix) nodes.push(suffix);
      }

      lastIndex = richTextRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      nodes.push(...renderMentions(text.slice(lastIndex), `text-${lastIndex}`));
    }

    return nodes;
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={authorProfilePic} alt="" />
            <div className="details">
              {isOfficialPost ? (
                <span className="name">{authorName}</span>
              ) : (
                <Link
                  to={`/profile/${post.userId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="name">{authorName}</span>
                </Link>
              )}
              <span className="date">{moment(post.createdAt).fromNow()}</span>
              {/* Display only if job: displays job category */}
              {jobCategories.includes(post.category) && (<span className="categ">{post.category}</span>)}
            </div>
            {post.flag === 1 &&
              <img className="flag" src={Tamu}/>
            }
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {currentUser && menuOpen && (post.userId === currentUser.id || isAdmin(currentUser)) && (
            <button onClick={handleDelete}>delete</button>
          )}
        </div>
        
        <div className="content">
            {(() => {
              const postText = post.article != null ? post.article : (post.desc ?? "");
              const truncatedPostText = postText.length > MAX_LENGTH ? postText.substring(0, MAX_LENGTH) : postText;

              return (
                <div style={{ whiteSpace: "pre-line" }}>
                  {renderPostText(isExpanded
                    ? truncatedPostText
                    : truncatedPostText.substring(0, PREVIEW_LENGTH)
                  )}
                  {truncatedPostText.length > PREVIEW_LENGTH && (
                    <span
                      onClick={() => setIsExpanded(!isExpanded)}
                      style={{ color: "blue", cursor: "pointer", marginLeft: 5 }}
                    >
                      {isExpanded ? t('post.seeLess') : t('post.seeMore')}
                    </span>
                  )}
                </div>
              );
            })()}

            {post.projectId && (
              <Link to={`/projects/${post.projectId}`} className="project-reference-card">
                <strong>{post.projectTitle || t("projectPost.project")}</strong>
                {post.projectDescription && <p>{post.projectDescription}</p>}
                <div className="reference-footer">
                  <span>{t("projectPost.project")}</span>
                  {post.postType && (
                    <span className="post-type-chip">{postTypeLabel(post.postType)}</span>
                  )}
                </div>
              </Link>
            )}

            <div className="centered" style={{ marginTop: 10 }}>
              {post.img1 === null ? getSingleFile() : getCarousel()}
            </div>

            {post.gifUrl && 
            <div style={containerStyle}>
              <iframe
                src={post.gifUrl}
                width="100%"
                height="100%"
                style={iframeStyle}
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
                title="Giphy Embed"
              ></iframe>
              {/* <p>
                <a href={post.gifUrl}>
                  via GIPHY
                </a>
              </p> */}
            </div>
            
            }
        </div>
        
        <div>

          <div className="info bottom">
            <Reactions postId={postId} postUserId={post.userId} currentUser={currentUser}/>
            {/* <div className="item" onClick={() => open(1)}>
              <ShareOutlinedIcon />
              {t('post.share')}
            </div> */}
            {commentError || commentsLoading ? "loading"
            :
            <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
              <TextsmsOutlinedIcon />
              {commentData.length} 
              {commentData.length === 1 ? t('post.comment') : t('post.comment')+'s'}
            </div>
            }
          </div>
        </div>
        {commentOpen && displayComments()}
      </div>
    </div>
  );
};

export default Post;
