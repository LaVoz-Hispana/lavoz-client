import ProfileLink from "../profile/ProfileLink";
import "./submitProject.scss";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";


const SubmitProject = ({ project, onClose }) => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const isEditing = Boolean(project);

  const [texts, setTexts] = useState({
    title: "",
    description: "",
    timeline: "",
    deliverables: "",
    categoryId: "",
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [error, setError] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [needsProviderSetup, setNeedsProviderSetup] = useState(currentUser.providerProfileComplete === false);

  useEffect(() => {
    let cancelled = false;
    makeRequest.get("/categories")
      .then((res) => {
        if (!cancelled) setCategories(res.data);
      })
      .catch(() => {
        if (!cancelled) setCategoriesError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!project || categories.length === 0) return;

    const category = categories.find((item) => item.slug === project.categorySlug);
    setTexts({
      title: project.title || "",
      description: project.description || "",
      timeline: project.timeline || "",
      deliverables: project.deliverables || "",
      categoryId: category ? String(category.id) : "",
    });
    setSelectedSkills(
      (project.skills || ",").split(",").map((skill) => skill.trim()).filter(Boolean)
    );
  }, [project, categories]);

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(false);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((currentSkills) =>
      currentSkills.includes(skill)
        ? currentSkills.filter((selectedSkill) => selectedSkill !== skill)
        : [...currentSkills, skill]
    );
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (!skill) return;
    setSelectedSkills((currentSkills) => {
      const existingSkill = currentSkills.find((currentSkill) => currentSkill.toLowerCase() === skill.toLowerCase());
      return existingSkill ? currentSkills : [...currentSkills, skill];
    });
    setCustomSkill("");
  };

  const handleCustomSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const mutation = useMutation({
    mutationFn: (projectData) => (
      isEditing
        ? makeRequest.put(`/projects/${project.id}`, projectData)
        : makeRequest.post("/projects", projectData)
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (!isEditing) {
        setTexts({ title: "", description: "", timeline: "", deliverables: "", categoryId: "" });
        setSelectedSkills([]);
        setCustomSkill("");
      }
      setServerError(null);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (onClose) onClose();
      }, 2000);
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.code === "provider_profile_incomplete") setNeedsProviderSetup(true);
      setServerError(
        data?.code === "provider_profile_incomplete" ? t("provider.completeProfile")
          : typeof data === "string" ? data : data?.message || data?.error || "Something went wrong. Please try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texts.title.trim() || !texts.description.trim() || !texts.categoryId) {
      setError(true);
      return;
    }
    mutation.mutate({ ...texts, skills: selectedSkills.join(", ") });
  };

  return (
    <div className="submit-project">
      <div className="container">
        <div className="top">
          <img src={currentUser.profilePic} alt="" />
          <h2>{isEditing ? t("projects.edit") : t("projects.post")}</h2>
        </div>
        {needsProviderSetup && <p role="status">{t("provider.completeProfile")} <ProfileLink to={`/profile/${currentUser.id}`}>{t("update.update")}</ProfileLink></p>}
        <form onSubmit={handleSubmit}>
          <input aria-label={t("projects.titleField")}
            type="text"
            name="title"
            value={texts.title}
            onChange={handleChange}
            placeholder={t("projects.titleField")}
          />
          <textarea aria-label={t("projects.descField")}
            name="description"
            value={texts.description}
            onChange={handleChange}
            placeholder={t("projects.descField")}
            rows={3}
          />
          <label className="field-label" htmlFor="project-category">{t("projects.category")}</label>
          <select
            id="project-category"
            name="categoryId"
            value={texts.categoryId}
            onChange={handleChange}
            disabled={categoriesError}
          >
            <option value="">{categoriesError ? t("projects.categoriesUnavailable") : t("projects.selectCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="project-skills-picker">
            <label className="field-label">{t("projects.skillsNeeded")}</label>
            <div className="custom-skill-input">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={handleCustomSkillKeyDown}
                placeholder={t("projects.addSkill")}
              />
              <button type="button" onClick={addCustomSkill}>{t("update.addSkill")}</button>
            </div>
            {selectedSkills.length > 0 && (
              <div className="selected-project-skills">
                {selectedSkills.map((skill) => (
                  <button type="button" key={skill} onClick={() => toggleSkill(skill)}>{skill} ×</button>
                ))}
              </div>
            )}
          </div>
          <input aria-label={t("projects.timeline")}
            type="text"
            name="timeline"
            value={texts.timeline}
            onChange={handleChange}
            placeholder={t("projects.timelinePlaceholder")}
          />
          <textarea aria-label={t("projects.deliverables")}
            name="deliverables"
            value={texts.deliverables}
            onChange={handleChange}
            placeholder={t("projects.deliverablesPlaceholder")}
            rows={2}
          />
          {error && <span className="error-msg">{t("projects.error")}</span>}
          {serverError && <span className="error-msg">{serverError}</span>}
          {submitted && <span className="success-msg">{isEditing ? t("projects.updated") : t("projects.posted")}</span>}
          <div className="footer">
            <button type="submit" disabled={mutation.isPending}>
              {isEditing ? t("projects.save") : t("share.post")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;
