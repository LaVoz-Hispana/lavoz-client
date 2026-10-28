import "./projectShareModal.scss";
import { useState, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";
import TextareaAutosize from "react-textarea-autosize";

const POST_TYPES = [
  { id: "launch", labelKey: "projectPost.launch" },
  { id: "description", labelKey: "projectPost.description" },
  { id: "work_in_progress", labelKey: "projectPost.workInProgress" },
  { id: "progress_update", labelKey: "projectPost.progressUpdate" },
  { id: "achievement", labelKey: "projectPost.achievement" },
  { id: "collaboration", labelKey: "projectPost.collaboration" },
  { id: "general", labelKey: "projectPost.general" },
  { id: "final_results", labelKey: "projectPost.finalResults" },
];

const ProjectShareModal = ({ projectId, projectTitle, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [postType, setPostType] = useState(null);
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts/addPost", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["projectPosts", String(projectId)]);
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const upload = async (filesToUpload) => {
    const results = await Promise.all(
      filesToUpload.slice(0, 10).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await makeRequest.post("/uploadPost", formData);
        return res.data;
      }),
    );
    return results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postType) {
      setError(t("projectPost.selectType"));
      return;
    }
    if (!desc.trim() && files.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const imgUrls = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    if (files.length > 0) {
      try {
        const uploaded = await upload(files);
        uploaded.forEach((url, i) => {
          if (url) imgUrls[i] = url;
        });
      } catch (err) {
        setError(t("projectPost.uploadError"));
        setIsSubmitting(false);
        return;
      }
    }

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
      category: "project_update",
      hasFlag: false,
      article: null,
      url: null,
      projectId,
      postType,
    });

    setDone(true);
    setIsSubmitting(false);
    setTimeout(onClose, 1800);
  };

  const handleFileChange = (e) => {
    if (files.length >= 10) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  if (done) {
    return (
      <div className="project-share-modal">
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-box done-box">
          <CheckCircleIcon style={{ color: "gray", fontSize: "3em" }} />
          <h3>{t("projectPost.posted")}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="project-share-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">
            {t("projectPost.postAbout")} <strong>{projectTitle}</strong>
          </span>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="post-type-row">
          {POST_TYPES.map((pt) => (
            <button
              key={pt.id}
              className={`type-chip ${postType === pt.id ? "active" : ""}`}
              onClick={() => setPostType(pt.id)}
              type="button"
            >
              {t(pt.labelKey)}
            </button>
          ))}
        </div>

        <div className="modal-body">
          <img src={currentUser.profilePic} alt="" className="pfp" />
          <TextareaAutosize
            placeholder={t("projectPost.placeholder")}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={4500}
            minRows={4}
          />
        </div>

        {files.length > 0 && (
          <div className="file-preview-row">
            {files.map((f, i) => (
              <div key={i} className="file-thumb">
                {f.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(f)} alt="" />
                ) : (
                  <video src={URL.createObjectURL(f) + "#t=0.001"} />
                )}
                <button
                  className="remove-file"
                  onClick={() => removeFile(i)}
                  type="button"
                >
                  <DisabledByDefault
                    style={{ color: "gray", fontSize: "small" }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <span className="error-msg">{error}</span>}

        <div className="modal-footer">
          <label htmlFor="project-file-input" className="file-label">
            <ImageOutlinedIcon style={{ color: "gray" }} />
            <span>{t("projectPost.addMedia")}</span>
          </label>
          <input
            id="project-file-input"
            type="file"
            accept=".png,.jpg,.jpeg,.mp4,.mov,.webm"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            className="post-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || (!desc.trim() && files.length === 0)}
            type="button"
          >
            {isSubmitting ? t("share.uploading") : t("share.post")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectShareModal;
