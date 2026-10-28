import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import "./socialHub.scss";

const StudyGroups = ({ onBack }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newGroup, setNewGroup] = useState({
    subject: "",
    course: "",
    title: "",
    description: "",
    location: "",
    time: "",
    maxMembers: "",
  });

  const [studyGroups, setStudyGroups] = useState([
    {
      id: 1,
      subject: "MATH",
      course: "MATH 151",
      title: "Calculus I Study Group",
      description:
        "Weekly study sessions for Calculus I. We review homework, practice problems, and prepare for exams together.",
      location: "Evans Library, Room 204",
      time: "Tuesdays 6:00 PM",
      members: 8,
      maxMembers: 12,
    },
    {
      id: 2,
      subject: "CSCE",
      course: "CSCE 121",
      title: "Intro to Programming Study Group",
      description:
        "Learn C++ programming together. Perfect for beginners who want to practice coding and understand concepts better.",
      location: "Zachry Building, Room 310",
      time: "Wednesdays 7:00 PM",
      members: 6,
      maxMembers: 10,
    },
    {
      id: 3,
      subject: "PHYS",
      course: "PHYS 218",
      title: "Physics II Study Group",
      description:
        "Study group for Physics II covering electricity, magnetism, and optics. Homework help and exam prep.",
      location: "Mitchell Physics Building, Room 103",
      time: "Thursdays 5:30 PM",
      members: 5,
      maxMembers: 8,
    },
    {
      id: 4,
      subject: "CHEM",
      course: "CHEM 107",
      title: "General Chemistry Study Group",
      description:
        "Weekly chemistry study sessions. We work through problems, review concepts, and help each other succeed.",
      location: "Chemistry Building, Room 225",
      time: "Mondays 4:00 PM",
      members: 10,
      maxMembers: 15,
    },
  ]);

  const subjects = [
    "All",
    "MATH",
    "CSCE",
    "PHYS",
    "CHEM",
    "BIOL",
    "HIST",
    "ENGL",
    "STAT",
  ];

  const filteredGroups = studyGroups.filter((group) => {
    const matchesSearch =
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "" ||
      selectedSubject === "All" ||
      group.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleCreateGroup = (e) => {
    e.preventDefault();
    const groupData = {
      id: Date.now(),
      subject: newGroup.subject,
      course: newGroup.course,
      title: newGroup.title,
      description: newGroup.description,
      location: newGroup.location,
      time: newGroup.time,
      members: 1,
      maxMembers: parseInt(newGroup.maxMembers, 10) || 10,
    };

    setStudyGroups([...studyGroups, groupData]);
    setShowCreateForm(false);
    setNewGroup({
      subject: "",
      course: "",
      title: "",
      description: "",
      location: "",
      time: "",
      maxMembers: "",
    });
  };

  const handleInputChange = (field, value) => {
    setNewGroup((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="social-hub">
      <div className="social-container">
        <div className="social-header">
          <h2>{t("studyGroups.title")}</h2>
          <p className="tagline">{t("studyGroups.subtitle")}</p>
        </div>

        <div className="study-groups-content">
          <div className="study-groups-controls">
            <div className="search-section">
              <div className="search-bar">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder={t("studyGroups.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-section">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="subject-filter"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="create-group-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <AddIcon /> {t("studyGroups.createGroup")}
            </button>
          </div>

          {showCreateForm && (
            <div className="create-group-modal">
              <div className="modal-content">
                <h3>{t("studyGroups.createNewGroup")}</h3>
                <form
                  onSubmit={handleCreateGroup}
                  className="create-group-form"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t("studyGroups.subject")}</label>
                      <select
                        value={newGroup.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        required
                      >
                        <option value="">
                          {t("studyGroups.selectSubject")}
                        </option>
                        {subjects.slice(1).map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t("studyGroups.course")}</label>
                      <input
                        type="text"
                        value={newGroup.course}
                        onChange={(e) =>
                          handleInputChange("course", e.target.value)
                        }
                        placeholder="e.g., MATH 151"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t("studyGroups.groupTitle")}</label>
                    <input
                      type="text"
                      value={newGroup.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder={t("studyGroups.titlePlaceholder")}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t("studyGroups.description")}</label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder={t("studyGroups.descriptionPlaceholder")}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t("studyGroups.location")}</label>
                      <input
                        type="text"
                        value={newGroup.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder={t("studyGroups.locationPlaceholder")}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{t("studyGroups.time")}</label>
                      <input
                        type="text"
                        value={newGroup.time}
                        onChange={(e) =>
                          handleInputChange("time", e.target.value)
                        }
                        placeholder={t("studyGroups.timePlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t("studyGroups.maxMembers")}</label>
                    <input
                      type="number"
                      value={newGroup.maxMembers}
                      onChange={(e) =>
                        handleInputChange("maxMembers", e.target.value)
                      }
                      placeholder="10"
                      min="2"
                      max="50"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="cancel-btn"
                    >
                      {t("common.cancel")}
                    </button>
                    <button type="submit" className="submit-btn">
                      {t("studyGroups.createGroup")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="study-groups-list">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.id} className="study-group-card">
                  <div className="group-header">
                    <div className="group-subject">
                      <SchoolIcon className="subject-icon" />
                      <span className="course-code">{group.course}</span>
                    </div>
                    <div className="group-members">
                      <GroupIcon className="members-icon" />
                      <span>
                        {group.members}/{group.maxMembers}
                      </span>
                    </div>
                  </div>

                  <h3 className="group-title">{group.title}</h3>
                  <p className="group-description">{group.description}</p>

                  <div className="group-details">
                    <div className="detail-item">
                      <LocationOnIcon className="detail-icon" />
                      <span>{group.location}</span>
                    </div>
                    <div className="detail-item">
                      <AccessTimeIcon className="detail-icon" />
                      <span>{group.time}</span>
                    </div>
                  </div>

                  <div className="group-actions">
                    <button
                      className="join-btn"
                      disabled={group.members >= group.maxMembers}
                    >
                      {group.members >= group.maxMembers
                        ? t("studyGroups.full")
                        : t("studyGroups.joinGroup")}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-groups">
                <SchoolIcon className="no-groups-icon" />
                <h3>{t("studyGroups.noGroups")}</h3>
                <p>{t("studyGroups.noGroupsDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
