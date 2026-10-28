import "./submitEvent.scss";
import Image from "../../assets/img.png";
import Friend from "../../assets/friend.png";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Dropdown } from "react-nested-dropdown";
import "react-nested-dropdown/dist/styles.css";
import { useTranslation } from "react-i18next";
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";
import { useLocation } from "react-router-dom";

// Utility: get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

const SubmitEvent = ({ categ }) => {
  const [category, setCategory] = useState(categ);
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [poster, setPoster] = useState("");
  const [error, setError] = useState("");

  const [texts, setTexts] = useState({
    name: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    time: getCurrentTime(),
    description: "",
    url: "",
  });

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newEvent) => makeRequest.post("/posts/event", newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
    },
  });

  const items = [
    { label: t("categories.general"), onSelect: () => setCategory("general") },
    { label: t("categories.jobs"), onSelect: () => setCategory("jobs") },
    { label: t("categories.events"), onSelect: () => setCategory("events") },
    {
      label: t("categories.articles"),
      items: [
        { label: t("categories.local"), onSelect: () => setCategory("local") },
        { label: t("categories.us"), onSelect: () => setCategory("usa") },
        { label: t("categories.latam"), onSelect: () => setCategory("latam") },
        {
          label: t("categories.global"),
          onSelect: () => setCategory("global"),
        },
      ],
    },
    {
      label: t("categories.tamu"),
      items: [
        { label: t("categories.tamu"), onSelect: () => setCategory("tamu") },
        { label: t("categories.games"), onSelect: () => setCategory("games") },
        {
          label: t("categories.advice"),
          onSelect: () => setCategory("advice"),
        },
        { label: t("categories.fans"), onSelect: () => setCategory("fans") },
      ],
    },
    {
      label: t("categories.greatThings"),
      onSelect: () => setCategory("greatThings"),
    },
  ];

  const newsOptions = [
    { label: t("categories.local"), onSelect: () => setCategory("local") },
    { label: t("categories.us"), onSelect: () => setCategory("usa") },
    { label: t("categories.latam"), onSelect: () => setCategory("latam") },
    { label: t("categories.global"), onSelect: () => setCategory("global") },
  ];

  const tamuOptions = [
    { label: t("categories.tamu"), onSelect: () => setCategory("tamu") },
    { label: t("categories.games"), onSelect: () => setCategory("games") },
    { label: t("categories.advice"), onSelect: () => setCategory("advice") },
    { label: t("categories.fans"), onSelect: () => setCategory("fans") },
  ];

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!texts.name) missingFields.push(t("events.name"));
    if (!texts.location) missingFields.push(t("events.location"));
    if (!category) missingFields.push(t("events.category"));

    if (missingFields.length > 0) {
      setError(missingFields.join(", "));
      return;
    }

    let imgUrl = "";
    if (file) imgUrl = await upload(file);

    // Destructure only valid keys from texts
    const { name, location, date, time, description, url } = texts;

    mutation.mutate({
      name,
      location,
      date,
      time,
      description,
      img: imgUrl,
      url,
      category,
    });

    // Clear state after success
    setError("");
    setFile(null);
    setCategory(categ);
    setTexts({
      name: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
      time: getCurrentTime(),
      description: "",
      url: "",
    });
  };

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  useEffect(() => {
    if (file && file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPoster(canvas.toDataURL("image/jpeg"));
      };
    } else {
      setPoster("");
    }
  }, [file]);

  return (
    <div className="submit-event">
      {!currentUser ? (
        <div />
      ) : (
        <div className="container">
          <div className="top">
            <img src={currentUser.profilePic} alt="" />
            <h2>{t("events.submit")}</h2>
          </div>
          <form>
            <input
              type="text"
              value={texts.name}
              name="name"
              onChange={handleChange}
              placeholder={t("events.name")}
            />
            <input
              type="date"
              value={texts.date}
              name="date"
              onChange={handleChange}
            />
            <input
              type="time"
              value={texts.time}
              name="time"
              onChange={handleChange}
            />
            <input
              type="text"
              value={texts.location}
              name="location"
              onChange={handleChange}
              placeholder={t("events.location")}
            />
            <input
              type="text"
              value={texts.description}
              name="description"
              onChange={handleChange}
              placeholder={t("events.description")}
            />
            <input
              type="text"
              value={texts.url}
              name="url"
              onChange={handleChange}
              placeholder={t("events.url")}
            />
          </form>

          <div className="middle">
            {file && (
              <div className="fileContainer">
                <button className="x" onClick={() => setFile(null)}>
                  <DisabledByDefault style={{ color: "gray" }} />
                </button>
                {file.type.startsWith("image/") ? (
                  <img
                    className="file"
                    alt=""
                    src={URL.createObjectURL(file)}
                  />
                ) : (
                  <video className="file" controls poster={poster}>
                    <source src={URL.createObjectURL(file)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </div>

          <hr />

          <div className="bottom">
            <div className="left">
              <div className="item">
                <img src={Friend} />
                {categ ? (
                  <span>{categ}</span>
                ) : pathname === "/tamu" ? (
                  <Dropdown items={tamuOptions}>
                    {({ onClick }) => (
                      <button onClick={onClick} className="category-label">
                        {category || "Select Category *"}
                      </button>
                    )}
                  </Dropdown>
                ) : pathname === "/news" ? (
                  <Dropdown items={newsOptions}>
                    {({ onClick }) => (
                      <button onClick={onClick} className="category-label">
                        {category || "Select Category *"}
                      </button>
                    )}
                  </Dropdown>
                ) : (
                  <Dropdown items={items}>
                    {({ onClick }) => (
                      <button onClick={onClick} className="category-label">
                        {category || "Select Category *"}
                      </button>
                    )}
                  </Dropdown>
                )}
              </div>

              <input
                type="file"
                id="file-event"
                style={{ display: "none" }}
                accept=".png, .jpg, .jpeg, .mp4, .mp3, .mov, .m4a"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="file-event">
                <div className="item">
                  <img src={Image} alt="" />
                  <span>{t("share.add")}</span>
                </div>
              </label>
            </div>

            <div className="right">
              <button onClick={handleClick}>{t("share.post")}</button>
            </div>
          </div>

          {error && <span className="error-msg">{error}</span>}
        </div>
      )}
    </div>
  );
};

export default SubmitEvent;
