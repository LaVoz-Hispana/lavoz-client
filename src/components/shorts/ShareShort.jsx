import "./short.scss";
import Image from "../../assets/img.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import {
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";
import { useTranslation } from "react-i18next";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DefaultUser from "../../assets/pfp.jpg";
import { Link } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ShareShort = () => {
  const [file, setFile] = useState(null);
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newShort) => {
      return makeRequest.post("/posts/short", newShort);
    },
    onSuccess: () => {
      // invalidate and refetch
      queryClient.invalidateQueries(["shorts"]);
    },
  });

  const getVideoDuration = async (inputFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(duration);
      };
      video.onerror = reject;

      video.src = URL.createObjectURL(inputFile);
    });
  };

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/uploadPost", formData);
      return res.data;
    } catch (err) {
      console.log(err);
      setError(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!file || file === null) {
      setError("Please select a video. Video can be up to 30s long.");
      return;
    }
    setIsSubmitting(true);
    let imgUrl = "";
    imgUrl = await upload(file);
    mutation.mutate({ imgUrl, desc: caption });
    setError(null);
    setCaption("");
    setIsSubmitting(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setFile(null);
    }, 3000);
  };

  const handleChange = async (e) => {
    const short = e.target.files[0];
    try {
      const duration = await getVideoDuration(short);
      if (duration > 30) {
        setError("Short videos must be shorter than 30 seconds.");
        return;
      } else {
        setFile(short);
        setError(null);
        return;
      }
    } catch (err) {
      console.error("error:", err);
    }
  };

  return (
    <div className="share-short">
      {!currentUser ? (
        <div className="guest-container">
          <div className="top">
            <img src={DefaultUser} alt="" />
            <span className="textInput">{t("shorts.guest")}</span>
          </div>
          <div className="content">
            <hr />
            <div
              className="row"
              style={{ marginTop: 0, display: "flex", flexDirection: "row" }}
            >
              <Link to={"/register"}>
                <button className="guest-button">Learn More</button>
              </Link>
            </div>
          </div>
        </div>
      ) : isSubmitting && file ? (
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <h2 className="confirmationHeading" style={{ margin: 0 }}>
              {t("share.processingHeading")}
            </h2>
            <div className="loading-text" style={{ margin: 0, marginLeft: 2 }}>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
          <div
            className="confirmationText"
            style={{ textAlign: "center", margin: 5 }}
          >
            <p>{t("share.processingText")}</p>
          </div>
          {file && (
            <div style={{ position: "relative" }}>
              <video controls className="filePreview">
                <source
                  src={URL.createObjectURL(file) + "#t=0.001"}
                  type={"video/mp4"}
                />
                Your browser does not support the video tag.
              </video>
              <div className="loading-circle"></div>
            </div>
          )}
        </div>
      ) : showConfirmation ? (
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CheckCircleIcon style={{ color: "grey", fontSize: "3em" }} />
          <h2 className="confirmationHeading">
            {t("share.confirmationHeading")}
          </h2>
          <p className="confirmationText">{t("share.confirmationText")}</p>
          {/* <button className="confirmationButton" onClick={() => setShowConfirmation(false)}>{t('share.submitMore')}</button> */}
        </div>
      ) : (
        <div className="container">
          {!file ? (
            <div
              style={{
                display: "flex",
                gap: 15,
                flexDirection: "column",
                justifyContent: "spaceBetween",
                alignItems: "center",
              }}
            >
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                accept=".mp4, .mp3, .mov, .m4a"
                onChange={handleChange}
              />
              <label htmlFor="file">
                <AddCircleIcon style={{ cursor: "pointer", fontSize: 75 }} />
              </label>
              <span className="directions">{t("shorts.post")}</span>
            </div>
          ) : (
            <div className="preview">
              <button className="x" onClick={() => setFile(null)}>
                <DisabledByDefault style={{ color: "gray" }} />
              </button>
              <video controls>
                <source
                  src={URL.createObjectURL(file) + "#t=0.001"}
                  type={"video/mp4"}
                />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          <hr />
          <div className="bottom">
            <div className="left">
              <img src={currentUser.profilePic} alt="" />
              <input
                type="text"
                placeholder={t("shorts.caption")}
                onChange={(e) => setCaption(e.target.value)}
                value={caption}
              />
            </div>
            <div className="right">
              <button onClick={handleClick} disabled={isSubmitting}>
                {" "}
                {isSubmitting ? t("share.uploading") : t("share.post")}{" "}
              </button>
            </div>
          </div>
          {error != null && (
            <span className="error-msg">{t("shorts.post")}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareShort;
