import "./submitService.scss";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";

const SubmitService = ({ onClose, service }) => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const isEditing = Boolean(service);

  const [texts, setTexts] = useState({
    title: "",
    description: "",
    availability: "",
    categoryId: "",
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: student } = useQuery({
    queryKey: ["user", currentUser?.id],
    queryFn: () =>
      makeRequest.get(`/users/find/${currentUser.id}`).then((res) => res.data),
    enabled: Boolean(currentUser?.id),
  });

  const studentSkills = useMemo(
    () =>
      (student?.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [student?.skills],
  );
  const selectedCategories = useMemo(
    () => student?.serviceCategories || [],
    [student?.serviceCategories],
  );

  useEffect(() => {
    if (!service) return;

    const category = selectedCategories.find(
      (item) => item.slug === service.categorySlug,
    );
    setTexts({
      title: service.title || "",
      description: service.description || "",
      availability: service.availability || "",
      categoryId: category ? String(category.id) : "",
    });
    setSelectedSkills(
      (service.skills || ",")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    );
  }, [service, selectedCategories]);

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(false);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((currentSkills) =>
      currentSkills.includes(skill)
        ? currentSkills.filter((selectedSkill) => selectedSkill !== skill)
        : [...currentSkills, skill],
    );
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (!skill) return;
    setSelectedSkills((currentSkills) => {
      const existingSkill = currentSkills.find(
        (currentSkill) => currentSkill.toLowerCase() === skill.toLowerCase(),
      );
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

  const [serverError, setServerError] = useState(null);

  const mutation = useMutation({
    mutationFn: (serviceData) =>
      isEditing
        ? makeRequest.put(`/services/${service.id}`, serviceData)
        : makeRequest.post("/services", serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      if (!isEditing) {
        setTexts({
          title: "",
          description: "",
          availability: "",
          categoryId: "",
        });
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
      setServerError(
        typeof data === "string"
          ? data
          : data?.message ||
              data?.error ||
              "Something went wrong. Please try again.",
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
    <div className="submit-service">
      <div className="wrapper">
        <h2>{isEditing ? t("services.edit") : t("services.post")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={texts.title}
            onChange={handleChange}
            placeholder={t("services.titleField")}
          />
          <textarea
            name="description"
            value={texts.description}
            onChange={handleChange}
            placeholder={t("services.descField")}
            rows={3}
          />
          <label className="field-label" htmlFor="service-category">
            {t("services.category")}
          </label>
          <select
            id="service-category"
            name="categoryId"
            value={texts.categoryId}
            onChange={handleChange}
          >
            <option value="">{t("services.selectCategory")}</option>
            {selectedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="service-skills-picker">
            <label className="field-label">{t("update.skills")}</label>
            {studentSkills.length > 0 && (
              <div className="student-skill-options">
                {studentSkills.map((skill) => (
                  <label key={skill} className="student-skill-option">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="custom-skill-input">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={handleCustomSkillKeyDown}
                placeholder={t("services.skillsPlaceholder")}
              />
              <button type="button" onClick={addCustomSkill}>
                {t("update.addSkill")}
              </button>
            </div>
            {selectedSkills.length > 0 && (
              <div className="selected-service-skills">
                {selectedSkills.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            name="availability"
            value={texts.availability}
            onChange={handleChange}
            placeholder={t("services.availabilityPlaceholder")}
          />
          {error && <span className="error-msg">{t("services.error")}</span>}
          {serverError && <span className="error-msg">{serverError}</span>}
          {submitted && (
            <span className="success-msg">
              {isEditing ? t("services.updated") : t("services.posted")}
            </span>
          )}
          <div className="footer">
            <button type="submit" disabled={mutation.isPending}>
              {isEditing ? t("services.save") : t("share.post")}
            </button>
          </div>
        </form>
        {onClose && (
          <button className="close" onClick={onClose}>
            <DisabledByDefaultIcon style={{ color: "red" }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SubmitService;
