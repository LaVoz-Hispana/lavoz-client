import "./submitJob.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import {
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Dropdown } from "react-nested-dropdown";
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";
import { useTranslation } from "react-i18next";
import InsertLinkIcon from "@mui/icons-material/InsertLink";

const SubmitJob = () => {
  const [category, setCategory] = useState(null);
  const [file, setFile] = useState(null);
  const [date, setDate] = useState(new Date());
  const { t } = useTranslation();

  const [texts, setTexts] = useState({
    name: "",
    pay: "",
    schedule: "",
    location: "",
    description: "",
    contact: "",
  });
  const [url, setURL] = useState(null);

  const items = [
    {
      label: t("categories.general"),
      onSelect: () => setCategory("general"),
    },
    {
      label: t("categories.construction"),
      onSelect: () => setCategory("construction"),
    },
    {
      label: t("jobs.restaurant"),
      onSelect: () => setCategory("restaurant"),
    },
    {
      label: t("jobs.students"),
      onSelect: () => setCategory("students"),
    },
    {
      label: t("jobs.sales"),
      onSelect: () => setCategory("sales"),
    },
    {
      label: t("jobs.office"),
      onSelect: () => setCategory("office"),
    },
    {
      label: t("jobs.temporary"),
      onSelect: () => setCategory("temporary"),
    },
  ];

  const [error, setError] = useState(null);

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newJob) => {
      return makeRequest.post("/posts/job", newJob);
    },
    onSuccess: () => {
      // invalidate and refetch
      queryClient.invalidateQueries(["jobs"]);
    },
  });

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
    if (
      texts.name === "" ||
      category === null ||
      texts.pay === "" ||
      texts.schedule === "" ||
      texts.contact == ""
    ) {
      setError(true);
      return;
    }
    let imgUrl = "";
    if (file) imgUrl = await upload(file);
    let name = texts.name;
    let location = texts.location;
    let description = texts.description;
    let contact = texts.contact;
    let pay = texts.pay;
    let schedule = texts.schedule;
    mutation.mutate({
      name,
      location,
      description,
      img: imgUrl,
      contact,
      pay,
      schedule,
      category,
      url,
    });
    setError(false);
    setFile(null);
    setURL("");
    setCategory(null);
    setTexts({
      name: "",
      pay: "",
      schedule: "",
      location: "",
      description: "",
      contact: "",
    });
  };

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: [e.target.value] }));
  };

  return (
    <div className="submit-job">
      <div className="container">
        <div className="top">
          <img src={currentUser.profilePic} alt="" />
          <h2>{t("jobs.post")}</h2>
        </div>
        <form>
          <div className="row">
            <label>{t("jobs.type")}</label>
            <Dropdown items={items} containerWidth="200px">
              {({ isOpen, onClick }) => (
                <button type="button" onClick={onClick} className={"dropdown"}>
                  {category === null ? "Select" : category}
                </button>
              )}
            </Dropdown>
          </div>
          <input
            type="text"
            value={texts.name}
            name="name"
            onChange={handleChange}
            placeholder={t("jobs.name")}
          />
          <input
            type="text"
            value={texts.pay}
            name="pay"
            onChange={handleChange}
            placeholder={t("jobs.pay")}
          />
          <input
            type="text"
            value={texts.schedule}
            name="schedule"
            onChange={handleChange}
            placeholder={t("jobs.schedule")}
          />
          <input
            type="text"
            value={texts.location}
            name="location"
            onChange={handleChange}
            placeholder={t("jobs.location")}
          />
          <input
            type="text"
            value={texts.description}
            name="description"
            onChange={handleChange}
            placeholder={t("jobs.description")}
          />
          <input
            type="text"
            value={texts.contact}
            name="contact"
            onChange={handleChange}
            placeholder={t("jobs.contact")}
          />
        </form>
        <div className="middle">
          {file && (
            <>
              <button
                className="x"
                style={{ marginLeft: 300 }}
                onClick={() => setFile(null)}
              >
                <DisabledByDefault style={{ color: "gray" }} />
              </button>
              {file.type.startsWith("image/") ? (
                <img className="file" alt="" src={URL.createObjectURL(file)} />
              ) : (
                <video className="file" controls>
                  <source src={URL.createObjectURL(file)} type={"video/mp4"} />
                  Your browser does not support the video tag.
                </video>
              )}
            </>
          )}
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              accept=".png, .jpg, .jpeg, .mp4, .mp3, .mov, .m4a"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>{t("share.add")}</span>
              </div>
            </label>
            <label>
              <div className="item">
                <InsertLinkIcon style={{ color: "gray" }} />
                <input
                  name="url"
                  type="text"
                  placeholder={t("share.url")}
                  value={url}
                  style={{ border: "none", fontSize: 12, color: "blue" }}
                  onChange={(e) => setURL(e.target.value)}
                />
              </div>
            </label>
          </div>
          <div className="right">
            <button onClick={handleClick}>{t("share.post")}</button>
          </div>
        </div>
        {error && <span className="error-msg">{t("jobs.error")}</span>}
      </div>
    </div>
  );
};

export default SubmitJob;
