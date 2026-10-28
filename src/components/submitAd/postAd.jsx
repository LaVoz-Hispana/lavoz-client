// This is the code for the "post ad" component -- where businesses can post an ad to show up in the social feed in any category (general, news, tamu, great things, etc)

import "../share/share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import Flag from "../../assets/tamu_flag.png";
import Tamu from "../../assets/tamu.jpg";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import {
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Dropdown } from "react-nested-dropdown";
import "react-nested-dropdown/dist/styles.css";
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReactSimplyCarousel from "react-simply-carousel";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const PostAd = () => {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const items = [
    {
      label: t("categories.general"),
      onSelect: () => setCategory("general"),
    },
    {
      label: t("categories.jobs"),
      onSelect: () => setCategory("jobs"),
    },
    {
      label: t("categories.events"),
      onSelect: () => setCategory("events"),
    },
    {
      label: t("categories.articles"),
      onSelect: () => setCategory("news"),
    },
    {
      label: t("categories.tamu"),
      items: [
        {
          label: t("categories.tamu"),
          onSelect: () => setCategory("tamu"),
        },
        {
          label: t("categories.games"),
          onSelect: () => setCategory("games"),
        },
        {
          label: t("categories.advice"),
          onSelect: () => setCategory("games"),
        },
        {
          label: t("categories.fans"),
          onSelect: () => setCategory("games"),
        },
      ],
    },
    {
      label: t("categories.greatThings"),
      onSelect: () => setCategory("greatThings"),
    },
    {
      label: "MarketStation",
      onSelect: () => setCategory("market"),
    },
  ];

  const [files, setFiles] = useState([]);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState(null);
  const [displayMessage, setDisplayMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [tooManyFiles, setTooManyFiles] = useState(false);

  const isVideo = (url) => {
    if (url === null) return false;
    const videoExtensions = [".mp4", ".mov", ".webp", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isAudio = (url) => {
    if (url === null) return false;
    const videoExtensions = [".mp3", ".m4a"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const getVideoDuration = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(duration);
      };
      video.onerror = reject;

      video.src = URL.createObjectURL(file);
    });
  };

  const upload = async (files) => {
    try {
      const uploadedUrls = await Promise.all(
        files.slice(0, 10).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await makeRequest.post("/upload", formData);
          return res.data;
        }),
      );
      return uploadedUrls;
    } catch (err) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.error
      ) {
        setError(err.response.data.error);
      } else {
        // Handle other errors
        console.log("79");
        console.log(err);
      }
    }
  };

  const containerStyle = {
    height: 0,
    paddingBottom: "15%",
    position: "relative",
  };

  const iframeStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
  };

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newAd) => {
      return makeRequest.post("/ads", newAd);
    },
    onSuccess: () => {
      // invalidate and refetch
      queryClient.invalidateQueries(["ads"]);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (category === null) {
      setCategory("general-ad");
    }
    if (files.length > 10) {
      setTooManyFiles(true);
      return;
    }
    setIsSubmitting(true);

    let imgUrls = [null, null, null, null, null, null, null, null, null, null];
    if (files.length > 0) {
      try {
        const uploadedUrls = await upload(files.slice(0, 10));
        uploadedUrls.forEach((url, index) => {
          if (url !== null) {
            imgUrls[index] = url;
          }
        });
      } catch (err) {
        console.error("Error uploading files:", err);
        setError("An error occurred during post creation.");
        setIsSubmitting(false);
      }
    }

    setError(false);
    setDisplayMessage(0);
    mutation.mutate({
      desc,
      img0: imgUrls[0],
      img1: imgUrls[1],
      img2: imgUrls[2],
      img3: imgUrls[3],
      img4: imgUrls[4],
      img5: imgUrls[5],
      img6: imgUrls[6],
      img7: imgUrls[7],
      img8: imgUrls[8],
      img9: imgUrls[9],
      category,
      gifUrl: null,
      hasFlag: false,
    });
    setDesc("");
    setCategory(null);
    setTooManyFiles(false);
    setIsSubmitting(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setFiles([]);
    }, 3000);
  };

  const handleX = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    if (files.length <= 10) setTooManyFiles(false);
  };
  const handleFileChange = async (e) => {
    if (files.length >= 10) {
      setTooManyFiles(true);
      return;
    }
    const selectedFiles = Array.from(e.target.files);
    for (let file of selectedFiles) {
      if (isVideo(file.name)) {
        try {
          const duration = await getVideoDuration(file);
          if (duration > 60) {
            setError("video-error");
            setDisplayMessage(1);
            return;
          } else {
            setDisplayMessage(0);
          }
        } catch (err) {
          console.error("error:", err);
        }
      } else if (isAudio(file.name)) {
        try {
          const duration = await getVideoDuration(file);
          if (duration > 60) {
            setError("audio-error");
            setDisplayMessage(1);
            return;
          } else {
            setDisplayMessage(0);
          }
        } catch (err) {
          console.error("error:", err);
        }
      }
    }
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setTimeout(() => {
      setActiveSlideIndex(activeSlideIndex + 1);
    }, 600);
  };

  const getCarousel = () => {
    return (
      <div style={{ flexWrap: "nowrap" }}>
        <ReactSimplyCarousel
          containerProps={{
            style: {
              display: "flex",
              alignItems: "center",
              margin: "auto",
              padding: "auto",
            },
          }}
          activeSlideIndex={activeSlideIndex}
          activeSlideProps={{
            marginBottom: 30,
          }}
          itemsToShow={1}
          itemsToScroll={1}
          swipeTreshold={20}
          onRequestChange={setActiveSlideIndex}
          forwardBtnProps={{
            children: (
              <ArrowForwardIosIcon style={{ color: "gray" }} fontSize="large" />
            ),
            className: "right-arrow",
          }}
          backwardBtnProps={{
            children: (
              <ArrowBackIosNewIcon style={{ color: "gray" }} fontSize="large" />
            ),
            className: "left-arrow",
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
                marginLeft: 2,
              },
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
                marginLeft: 2,
              },
            },
          }}
          speed={400}
        >
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              {file.type.startsWith("image/") ? (
                <div>
                  <button
                    className="x-carousel"
                    style={{ marginLeft: 300 }}
                    onClick={() => handleX(index)}
                  >
                    <DisabledByDefault style={{ color: "gray" }} />
                  </button>
                  <img className="file" src={URL.createObjectURL(file)} />
                </div>
              ) : (
                <div>
                  <button
                    className="x-carousel"
                    style={{ marginLeft: 300 }}
                    onClick={() => handleX(index)}
                  >
                    <DisabledByDefault style={{ color: "gray" }} />
                  </button>
                  <video controls>
                    <source
                      src={URL.createObjectURL(file)}
                      className="file"
                      type={"video/mp4"}
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ))}
        </ReactSimplyCarousel>
      </div>
    );
  };

  const renderFilePreviews = () => {
    if (files.length > 1) {
      return getCarousel();
    } else if (files.length === 1) {
      return (
        <>
          <button
            className="x"
            style={{ marginLeft: 300 }}
            onClick={() => handleX(0)}
          >
            <DisabledByDefault style={{ color: "gray" }} />
          </button>
          {files[0].type.startsWith("image/") ? (
            <img className="file" alt="" src={URL.createObjectURL(files[0])} />
          ) : (
            <video className="file" controls>
              <source src={URL.createObjectURL(files[0])} type={"video/mp4"} />
              Your browser does not support the video tag.
            </video>
          )}
        </>
      );
    } else return;
  };

  return (
    <div className="share">
      {submitted === true ? (
        <div className="thanks-container">
          <CheckCircleIcon style={{ color: "green", fontSize: "3em" }} />
          <h2>{t("adConfirmation.thanks")}</h2>
          <p>{t("adConfirmation.msg")}</p>
          <button onClick={() => setSubmitted(false)}>
            {t("adConfirmation.postAnother")}
          </button>
        </div>
      ) : isSubmitting && files.length !== 0 ? (
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
          {files && files[0] && (
            <div style={{ position: "relative" }}>
              {files[0].type.startsWith("image/") ? (
                <img
                  className="filePreview"
                  alt=""
                  src={URL.createObjectURL(files[0])}
                />
              ) : (
                <video controls className="filePreview">
                  <source
                    src={URL.createObjectURL(files[0]) + "#t=0.001"}
                    type={"video/mp4"}
                  />
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="loading-circle"></div>
            </div>
          )}
        </div>
      ) : (
        // :
        //   showConfirmation ?
        //   <div className="container" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        //     <CheckCircleIcon style={{color: "grey", fontSize: "3em"}}/>
        //     <h2 className="confirmationHeading">{t('share.confirmationHeading')}</h2>
        //     <p className="confirmationText">{t('share.confirmationText')}</p>
        //     {/* <button className="confirmationButton" onClick={() => setShowConfirmation(false)}>{t('share.submitMore')}</button> */}
        //   </div>
        <div className="container">
          <div className="top">
            <img src={currentUser.profilePic} alt="" />
            <input
              type="text"
              placeholder={t("share.createAd")}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>

          <div className="middle">{renderFilePreviews()}</div>

          <hr />
          <div className="bottom">
            <div className="left">
              <div className="item">
                <img src={Friend} />
                <Dropdown items={items}>
                  {({ isOpen, onClick }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      className={"category-label"}
                    >
                      {category === null
                        ? t("share.select")
                        : category === "news"
                          ? t("categories.articles")
                          : category}
                    </button>
                  )}
                </Dropdown>
              </div>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                accept=".png, .jpg, .jpeg, .mp4, .mp3, .mov, .m4a"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file">
                <div className="item">
                  <img src={Image} alt="" />
                  {files.length >= 1 ? (
                    <span>{t("share.addMore")}</span>
                  ) : (
                    <span>{t("share.add")}</span>
                  )}
                </div>
              </label>
            </div>
            <div className="right">
              <button onClick={handleClick} disabled={isSubmitting}>
                {" "}
                {isSubmitting ? t("share.uploading") : t("share.post")}{" "}
              </button>
            </div>
          </div>
          {error && (
            <span className="error-msg">{t("share.pleaseSelect")}</span>
          )}
          {tooManyFiles && <span className="error-msg">{t("share.ten")}</span>}
        </div>
      )}
    </div>
  );
};

export default PostAd;
