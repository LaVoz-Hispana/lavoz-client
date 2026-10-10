import { makeRequest } from "../../axios";
import "./firstLogin.scss";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import ResumeLibrary from "../../components/resume/ResumeLibrary";

const FirstLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {currentUser} = useContext(AuthContext);
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [texts, setTexts] = useState({
      email: currentUser.email,
      password: currentUser.password,
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
      org_name: currentUser.org_name || '',
      org_type: currentUser.org_type || '',
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
      console.log(file)
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await makeRequest.post("/upload", formData);
        return res.data;
      } catch (err) {
        console.log(err);
      }
    };
  
    const handleChange = (e) => {
      setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
            return makeRequest.put("/users", user);
        },
        onSuccess: () => {
          // Invalidate and refetch
          queryClient.invalidateQueries(["user"]);
        },
    });

    const getStarted = async (e) => {
      e.preventDefault();
      await handleClick();
      navigate("/");
    }
  
    const handleClick = async () => {
    
      try {
        let coverUrl = cover ? await upload(cover) : currentUser.coverPic;
        let profileUrl = profile ? await upload(profile) : currentUser.profilePic;
    
        await mutation.mutateAsync({
          ...texts,
          coverPic: coverUrl,
          profilePic: profileUrl,
        });
        setCover(null);
        setProfile(null);
      } catch (error) {
        console.error("File upload failed:", error.message);
        // Handle the error, e.g., show a user-friendly message
      }
    };
  
    return (
      <div className="update">
        <div className="wrapper">

          <h1>{t('update.welcome')}</h1>
          <div className="welcome-msg">
            <span>{t('update.setupDesc')}</span>
            <br />
            <p className="another-msg">{t('update.optional')}</p>
          </div>
          {currentUser.account_type === "student" && <ResumeLibrary optional />}
          <form>
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
              <input
                type="text"
                value={texts.email}
                name="email"
                onChange={handleChange}
                placeholder={t('update.email')}
              />
            </div>

            <div className="row">
            <label className="pc-none">{t('update.password')}</label>
              <input
                type="password"
                value={texts.password}
                name="password"
                onChange={handleChange}
                placeholder={t('update.password')}
              />
            </div>
            <div className="row">
              <label className="pc-none">{t('update.name')}</label>
              <input
                type="text"
                value={texts.name}
                name="name"
                onChange={handleChange}
                placeholder={t('update.name')}
              />
            </div>
            <div className='row'>
              <label className="pc-none">{t('update.bio')}</label>
              <input
                type="text"
                value={texts.bio}
                name="bio"
                onChange={handleChange}
                placeholder={t('update.bio')}
              />
            </div>
            <div className="row">
              <label className="pc-none">{t('update.country')}</label>
              <input
                type="text"
                name="city"
                value={texts.city}
                onChange={handleChange}
                placeholder={t('update.country')}
              />
            </div>
            <div className="row">
              <label className="pc-none">{t('update.language')}</label>
              <input
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
              <input
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
                <input
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
                <input
                  type="text"
                  name="major"
                  value={texts.major}
                  onChange={handleChange}
                  placeholder={t('update.major')}
                />
              </div>
              <div className="row">
                <label className="pc-none">{t('update.gradYear')}</label>
                <input
                  type="text"
                  name="grad_year"
                  value={texts.grad_year}
                  onChange={handleChange}
                  placeholder={t('update.gradYearPlaceholder')}
                />
              </div>
            </>}

            {currentUser.account_type === 'local' && <>
              <div className="row">
                <label className="pc-none">{t('update.orgType')}</label>
                <select name="org_type" value={texts.org_type} onChange={handleChange}>
                  <option value="">{t('update.selectOrgType')}</option>
                  <option value="Business">{t('update.orgTypeBusiness')}</option>
                  <option value="Non-profit">{t('update.orgTypeNonprofit')}</option>
                  <option value="Resident">{t('update.orgTypeResident')}</option>
                </select>
              </div>
              {(texts.org_type === 'Business' || texts.org_type === 'Non-profit') && (
                <div className="row">
                  <label className="pc-none">{t('update.orgName')}</label>
                  <input
                    type="text"
                    name="org_name"
                    value={texts.org_name}
                    onChange={handleChange}
                    placeholder={t('update.orgNamePlaceholder')}
                  />
                </div>
              )}
            </>}

            {/* <span className = "description">{t('update.msg')}</span> */}
          </form>
          
          <button className="continue" onClick={getStarted}>{t('update.start')}</button>
          
        </div>
      </div>
    );
  };
  
  export default FirstLogin;
