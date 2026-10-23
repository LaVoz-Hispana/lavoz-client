import { makeRequest } from "../../axios";
import ProviderFields from "../../components/provider/ProviderFields";
import { providerError, saveProfile } from "../../utils/providerProfile";
import "./firstLogin.scss";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import ResumeLibrary from "../../components/resume/ResumeLibrary";

const FirstLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {currentUser, updateUser} = useContext(AuthContext);
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [texts, setTexts] = useState({
      email: currentUser.email,
      name: currentUser.name,
      city: currentUser.city,
      website: currentUser.website,
      language: currentUser.language,
      bio: currentUser.bio,
      account_type: currentUser.account_type,
      skills: currentUser.skills || '',
      university: currentUser.university || '',
      major: currentUser.major || '',
      grad_year: currentUser.grad_year || '',
      serviceCategoryIds: currentUser.serviceCategoryIds || [],
      provider_type: currentUser.provider_type || '',
      contact_person_name: currentUser.contact_person_name || '',
      company_name: currentUser.company_name || '',
      organization_name: currentUser.organization_name || '',
    });

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
  
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
        mutationFn: (user) => {
            return saveProfile(currentUser, user);
        },
        onSuccess: () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });

    const getStarted = async (e) => {
      e.preventDefault();
      if (await handleClick()) navigate("/");
    }
  
    const handleClick = async () => {
      if (isSubmitting) return false;
      if (currentUser.account_type === "local") {
        if (!texts.provider_type) { setFormError(t("provider.errors.typeRequired")); return false; }
        if (!texts.contact_person_name.trim()) { setFormError(t("provider.errors.contactRequired")); return false; }
        if (texts.provider_type === "company" && !texts.company_name.trim()) { setFormError(t("provider.errors.companyRequired")); return false; }
        if (texts.provider_type === "organization" && !texts.organization_name.trim()) { setFormError(t("provider.errors.organizationRequired")); return false; }
      }
      setIsSubmitting(true);
      try {
        let coverUrl = cover ? await upload(cover) : currentUser.coverPic;
        let profileUrl = profile ? await upload(profile) : currentUser.profilePic;
    
        const savedUser = await mutation.mutateAsync({
          ...texts,
          coverPic: coverUrl,
          profilePic: profileUrl,
        });
        updateUser(savedUser);
        setCover(null);
        setProfile(null);
        return true;
      } catch (error) {
        setFormError(providerError(error, t));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <div className="update">
        <div className="wrapper">

          <h1>{t('update.welcome')}</h1>
          <div className="welcome-msg">
            <span>{t('update.setupDesc')}</span>
            <br />
            <p className="another-msg">{currentUser.account_type === "local" ? t("provider.requiredSetup") : t('update.optional')}</p>
          </div>
          {currentUser.account_type === "student" && <ResumeLibrary optional />}
          <form id="onboarding-profile" onSubmit={getStarted}>
            <div className="files">
              <label style={{textAlign: "center"}} htmlFor="cover">
                <span>{t('update.cover')}</span>
                <div className="imgContainer">
                  <img
                    src={
                      cover
                        ? URL.createObjectURL(cover)
                        : currentUser.coverPic
                    }
                    alt=""
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="cover"
                style={{ display: "none" }}
                accept=".png, .jpg, .jpeg"
                onChange={(e) => setCover(e.target.files[0])}
              />
              <label  style={{textAlign: "center"}} htmlFor="profile">
                <span>{t('update.profilePic')}</span>
                <div className="imgContainer">
                  <img
                    src={
                      profile
                        ? URL.createObjectURL(profile)
                        : currentUser.profilePic
                    }
                    alt=""
                  />
                  <CloudUploadIcon className="icon" />
                </div>
              </label>
              <input
                type="file"
                id="profile"
                style={{ display: "none" }}
                accept=".png, .jpg, .jpeg"
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
            {currentUser.account_type === 'student' && <>
              <div className="row">
                <label className="pc-none">{t('update.skills')}</label>
                <input aria-label={t("update.skills")}
                  type="text"
                  name="skills"
                  value={texts.skills}
                  onChange={handleChange}
                  placeholder={t('update.skillsPlaceholder')}
                />
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

            {currentUser.account_type === "local" && <ProviderFields values={texts} onChange={handleChange} disabled={isSubmitting} />}

            {/* <span className = "description">{t('update.msg')}</span> */}
          </form>
          
          {formError && <span className="error-msg" role="alert">{formError}</span>}
          <button className="continue" type="submit" form="onboarding-profile" disabled={isSubmitting}>{isSubmitting ? t("provider.saving") : t('update.start')}</button>
          
        </div>
      </div>
    );
  };
  
  export default FirstLogin;
