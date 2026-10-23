import { useState, useContext, useEffect } from "react";
import { makeRequest } from "../../axios";
import ProviderFields from "../../components/provider/ProviderFields";
import { providerError, saveProfile } from "../../utils/providerProfile";
import "./update.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/authContext";
import NotificationPreferences from "./NotificationPreferences";
import ResumeLibrary from "../resume/ResumeLibrary";

const Update = ({ setOpenUpdate, user, first }) => {
    const { t } = useTranslation();
    const [cover, setCover] = useState(null);
    const [profile, setProfile] = useState(null);
    const [skillInput, setSkillInput] = useState("");
    const [skills, setSkills] = useState(() =>
      (user.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean)
    );
    const [categories, setCategories] = useState([]);
    const [categoriesError, setCategoriesError] = useState(false);
    const [formError, setFormError] = useState(null);
    const { updateUser, currentUser } = useContext(AuthContext);
    const [texts, setTexts] = useState({
      email: user.email,
      phone: user.phone || '',
      name: user.name || "",
      username: user.username,
      city: user.city,
      website: user.website,
      language: user.language,
      bio: user.bio,
      account_type: user.account_type,
      skills: user.skills || '',
      university: user.university || '',
      major: user.major || '',
      grad_year: user.grad_year || '',
      serviceCategoryIds: (user.serviceCategories || []).map((category) => String(category.id)),
      provider_type: user.provider_type || '',
      contact_person_name: user.contact_person_name || '',
      company_name: user.company_name || '',
      organization_name: user.organization_name || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (user.account_type !== "student") return undefined;
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
    }, [user.account_type]);
  
    const upload = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await makeRequest.post("/upload", formData);
        return res.data;
      } catch (err) {
        throw err;
      }
    };
  
    const handleChange = (e) => {
      setFormError(null);
      setTexts((prev) => e.target.name === "provider_type" ? {
        ...prev,
        provider_type: e.target.value,
        company_name: e.target.value === "company" ? prev.company_name : "",
        organization_name: e.target.value === "organization" ? prev.organization_name : "",
      } : ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleServiceCategory = (categoryId) => {
      const id = String(categoryId);
      setTexts((prev) => ({
        ...prev,
        serviceCategoryIds: prev.serviceCategoryIds.includes(id)
          ? prev.serviceCategoryIds.filter((selectedId) => selectedId !== id)
          : [...prev.serviceCategoryIds, id],
      }));
    };

    const addSkill = () => {
      const skill = skillInput.trim();
      if (!skill || skills.some((existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase())) return;
      setSkills((currentSkills) => [...currentSkills, skill]);
      setSkillInput("");
    };

    const removeSkill = (skillToRemove) => {
      setSkills((currentSkills) => currentSkills.filter((skill) => skill !== skillToRemove));
    };

    const handleSkillKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSkill();
      }
    };
  
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
        mutationFn: (profile) => {
            return saveProfile(user, profile);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["user"] });
          queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
    });
  
    const handleClick = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      if (user.account_type === "local") {
        if (!texts.provider_type) return setFormError(t("provider.errors.typeRequired"));
        if (!texts.contact_person_name.trim()) return setFormError(t("provider.errors.contactRequired"));
        if (texts.provider_type === "company" && !texts.company_name.trim()) return setFormError(t("provider.errors.companyRequired"));
        if (texts.provider_type === "organization" && !texts.organization_name.trim()) return setFormError(t("provider.errors.organizationRequired"));
      }
      setIsSubmitting(true);

      try {
        let coverUrl = cover ? await upload(cover) : user.coverPic;
        let profileUrl = profile ? await upload(profile) : user.profilePic;

        const updatedTexts = { ...texts, skills: skills.join(", ") };
        const savedUser = await mutation.mutateAsync({
          ...updatedTexts,
          coverPic: coverUrl,
          profilePic: profileUrl,
        });
        updateUser(savedUser);
        setOpenUpdate(false);
        setCover(null);
        setProfile(null);
        setIsSubmitting(false);
      } catch (error) {
        setFormError(providerError(error, t));
        setIsSubmitting(false);
      }
    };
  
    return (
      <div className="update">
        <div className="wrapper">
          <h1>{t('update.submit')}</h1>
          <NotificationPreferences userId={currentUser.id} />
          {currentUser.account_type === "student" && Number(user.id) === Number(currentUser.id) && <ResumeLibrary />}
          <form onSubmit={handleClick}>
            <div className="files">
              <label htmlFor="cover">
                <span className="img-label">{t('update.cover')}</span>
                <div className="imgContainer">
                  <img
                    src={
                      cover
                        ? URL.createObjectURL(cover)
                        : user.coverPic
                    }
                    alt=""
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="cover"
                accept=".png, .jpg, .jpeg"
                style={{ display: "none" }}
                onChange={(e) => setCover(e.target.files[0])}
              />
              <label htmlFor="profile">
                <span className="img-label">{t('update.profilePic')}</span>
                <div className="imgContainer">
                  <img
                    src={
                      profile
                        ? URL.createObjectURL(profile)
                        : user.profilePic
                    }
                    alt=""
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="profile"
                accept=".png, .jpg, .jpeg"
                style={{ display: "none" }}
                onChange={(e) => setProfile(e.target.files[0])}
              />
            </div>
            <div className="row">
              <label className="pc-none">{t('update.email')}</label>
              <input aria-label={t("update.email")}
                type="text"
                value={texts.email}
                name="email"
                readOnly
                placeholder={t('update.email')}
              />
            </div>

            <div className="row">
              <label className="pc-none">{t('update.phone')}</label>
              <input aria-label={t("update.phone")}
                type="tel"
                value={texts.phone}
                name="phone"
                onChange={handleChange}
                placeholder={t('update.phone')}
              />
            </div>

            <div className="row">
              <label className="pc-none">{t('update.name')}</label>
              <input aria-label={t("update.name")}
                type="text"
                value={texts.name}
                name="name"
                onChange={handleChange}
                placeholder={t('update.name')}
              />
            </div>

            <div className='row'>
              <label className="pc-none">{t('update.bio')}</label>
              <input aria-label={t("update.bio")}
                type="text"
                value={texts.bio}
                name="bio"
                onChange={handleChange}
                placeholder={t('update.bio')}
              />
            </div>
            <div className="row">
              <label className="pc-none">{t('update.country')}</label>
              <input aria-label={t("update.country")}
                type="text"
                name="city"
                value={texts.city}
                onChange={handleChange}
                placeholder={t('update.country')}
              />
            </div>
            <div className="row">
              <label className="pc-none">{t('update.language')}</label>
              <input aria-label={t("update.language")}
                type="text"
                name="language"
                value={texts.language}
                onChange={handleChange}
                placeholder={t('update.language')}
              />
            </div>
            {/* <div className="row">
              <label className="pc-none">Facebook {t('update.link')}</label>
              <input
                type="text"
                name="facebook"
                value={texts.facebook}
                onChange={handleChange}
                placeholder={"Facebook"}
              />
            </div>
            <div className="row">
              <label className="pc-none">Instagram {t('update.link')}</label>
              <input
                type="text"
                name="instagram"
                value={texts.instagram}
                onChange={handleChange}
                placeholder={"Instagram"}
              />
            </div>
            <div className="row">
              <label className="pc-none">Twitter {t('update.link')}</label>
              <input
                type="text"
                name="twitter"
                value={texts.twitter}
                onChange={handleChange}
                placeholder={"Twitter"}
              />
            </div> */}
            <div className="row">
              <label className="pc-none">{t('update.website')}</label>
              <input aria-label={t("update.website")}
                type="text"
                name="website"
                value={texts.website}
                onChange={handleChange}
                placeholder={t('update.website')}
              />
            </div>
            {user.account_type === 'student' && <>
              <div className="row">
                <label className="pc-none">{t('update.skills')}</label>
                <div className="skill-editor">
                  <div className="skill-input-row">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder={t('update.skillsPlaceholder')}
                    />
                    <button type="button" onClick={addSkill}>{t('update.addSkill')}</button>
                  </div>
                  {skills.length > 0 && (
                    <div className="skill-editor-tags">
                      {skills.map((skill) => (
                        <div key={skill} className="skill-editor-tag">
                          <span>{skill}</span>
                          <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="row">
                <label className="pc-none">{t('register.services')}</label>
                <div className="service-category-options" aria-label={t('register.services')}>
                  {categoriesError && <span>{t('register.servicesUnavailable')}</span>}
                  {categories.map((category) => {
                    const categoryId = String(category.id);
                    return (
                      <label key={category.id} className="service-category-option">
                        <input
                          type="checkbox"
                          checked={texts.serviceCategoryIds.includes(categoryId)}
                          onChange={() => toggleServiceCategory(categoryId)}
                          disabled={categoriesError}
                        />
                        <span>{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="row">
                <label className="pc-none">{t('update.university')}</label>
                <select name="university" value={texts.university} onChange={handleChange}>
                  <option value="">{t('update.selectUniversity')}</option>
                  <option value="Texas A&M University">Texas A&M University</option>
                  <option value="Blinn College">Blinn College</option>
                </select>
              </div>
              <div className="row">
                <label className="pc-none">{t('update.major')}</label>
                <input aria-label={t("update.major")}
                  type="text"
                  name="major"
                  value={texts.major}
                  onChange={handleChange}
                  placeholder={t('update.major')}
                />
              </div>
              <div className="row">
                <label className="pc-none">{t('update.gradYear')}</label>
                <input aria-label={t("update.gradYear")}
                  type="text"
                  name="grad_year"
                  value={texts.grad_year}
                  onChange={handleChange}
                  placeholder={t('update.gradYearPlaceholder')}
                />
              </div>
            </>}

            {user.account_type === "local" && <ProviderFields values={texts} onChange={handleChange} disabled={isSubmitting} />}

            {/* <span className = "description">{t('update.msg')}</span> */}
            {formError && <span className="error-msg" role="alert">{formError}</span>}
            <button type="submit" disabled={isSubmitting}> {!isSubmitting ? t('update.update') : t('update.updating') } </button>
          </form>
          <button className="close" onClick={() => setOpenUpdate(false)}>
            <DisabledByDefaultIcon style={{color: "red"}}/>
          </button>
        </div>
      </div>
    );
  };
  
  export default Update;
