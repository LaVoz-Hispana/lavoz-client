import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import SportsIcon from "@mui/icons-material/Sports";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import "./socialHub.scss";

const RecTeams = ({ onBack }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");
  const [newTeam, setNewTeam] = useState({
    sport: "",
    teamName: "",
    description: "",
    skillLevel: "",
    location: "",
    schedule: "",
    maxMembers: "",
    isCompetitive: false,
  });

  const [recTeams, setRecTeams] = useState([
    {
      id: 1,
      sport: "Basketball",
      teamName: "Aggie Hoopers",
      description:
        "Looking for players who love fast-paced basketball. We play pickup games and participate in intramural leagues.",
      skillLevel: "Intermediate",
      location: "Rec Center Courts 1-2",
      schedule: "Tuesdays & Thursdays 7:00 PM",
      members: 8,
      maxMembers: 12,
      isCompetitive: true,
    },
    {
      id: 2,
      sport: "Soccer",
      teamName: "Maroon Soccer Club",
      description:
        "Casual soccer team for all skill levels. We focus on having fun while improving our skills together.",
      skillLevel: "Beginner",
      location: "Penberthy Rec Complex Field 3",
      schedule: "Sundays 2:00 PM",
      members: 15,
      maxMembers: 20,
      isCompetitive: false,
    },
    {
      id: 3,
      sport: "Volleyball",
      teamName: "Net Crushers",
      description:
        "Competitive volleyball team looking for experienced players. We train hard and play in tournaments.",
      skillLevel: "Advanced",
      location: "Rec Center Volleyball Courts",
      schedule: "Mondays & Wednesdays 6:30 PM",
      members: 10,
      maxMembers: 14,
      isCompetitive: true,
    },
    {
      id: 4,
      sport: "Tennis",
      teamName: "Aggie Rackets",
      description:
        "Tennis enthusiasts of all levels welcome! We organize matches, practice sessions, and social events.",
      skillLevel: "All Levels",
      location: "Omar Smith Tennis Center",
      schedule: "Saturdays 10:00 AM",
      members: 12,
      maxMembers: 16,
      isCompetitive: false,
    },
    {
      id: 5,
      sport: "Flag Football",
      teamName: "12th Man Flag Football",
      description:
        "Non-contact flag football team. Great for former high school players or anyone wanting to learn the game.",
      skillLevel: "Intermediate",
      location: "Penberthy Rec Complex Field 1",
      schedule: "Fridays 5:00 PM",
      members: 14,
      maxMembers: 18,
      isCompetitive: true,
    },
    {
      id: 6,
      sport: "Swimming",
      teamName: "Aggie Swimmers",
      description:
        "Recreational swimming group for fitness and fun. We do laps, water aerobics, and pool games.",
      skillLevel: "All Levels",
      location: "Rec Center Pool",
      schedule: "Wednesdays & Fridays 8:00 AM",
      members: 8,
      maxMembers: 15,
      isCompetitive: false,
    },
  ]);

  const sports = [
    "All",
    "Basketball",
    "Soccer",
    "Volleyball",
    "Tennis",
    "Flag Football",
    "Swimming",
    "Baseball",
    "Softball",
    "Golf",
  ];
  const skillLevels = [
    "All",
    "Beginner",
    "Intermediate",
    "Advanced",
    "All Levels",
  ];

  const filteredTeams = recTeams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport =
      selectedSport === "" ||
      selectedSport === "All" ||
      team.sport === selectedSport;
    const matchesSkillLevel =
      selectedSkillLevel === "" ||
      selectedSkillLevel === "All" ||
      team.skillLevel === selectedSkillLevel;
    return matchesSearch && matchesSport && matchesSkillLevel;
  });

  const handleCreateTeam = (e) => {
    e.preventDefault();
    const teamData = {
      id: Date.now(),
      sport: newTeam.sport,
      teamName: newTeam.teamName,
      description: newTeam.description,
      skillLevel: newTeam.skillLevel,
      location: newTeam.location,
      schedule: newTeam.schedule,
      members: 1,
      maxMembers: parseInt(newTeam.maxMembers, 10) || 15,
      isCompetitive: newTeam.isCompetitive,
    };

    setRecTeams([...recTeams, teamData]);
    setShowCreateForm(false);
    setNewTeam({
      sport: "",
      teamName: "",
      description: "",
      skillLevel: "",
      location: "",
      schedule: "",
      maxMembers: "",
      isCompetitive: false,
    });
  };

  const handleInputChange = (field, value) => {
    setNewTeam((prev) => ({ ...prev, [field]: value }));
  };

  const getSkillLevelIcon = (skillLevel) => {
    switch (skillLevel) {
      case "Beginner":
        return "⭐";
      case "Intermediate":
        return "⭐⭐";
      case "Advanced":
        return "⭐⭐⭐";
      default:
        return "⭐";
    }
  };

  return (
    <div className="social-hub">
      <div className="social-container">
        <div className="social-header">
          <h2>{t("recTeams.title")}</h2>
          <p className="tagline">{t("recTeams.subtitle")}</p>
        </div>

        <div className="rec-teams-content">
          <div className="rec-teams-controls">
            <div className="search-section">
              <div className="search-bar">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder={t("recTeams.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-section">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="sport-filter"
                >
                  {sports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="skill-filter"
                >
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="create-team-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <AddIcon /> {t("recTeams.createTeam")}
            </button>
          </div>

          {showCreateForm && (
            <div className="create-team-modal">
              <div className="modal-content">
                <h3>{t("recTeams.createNewTeam")}</h3>
                <form onSubmit={handleCreateTeam} className="create-team-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t("recTeams.sport")}</label>
                      <select
                        value={newTeam.sport}
                        onChange={(e) =>
                          handleInputChange("sport", e.target.value)
                        }
                        required
                      >
                        <option value="">{t("recTeams.selectSport")}</option>
                        {sports.slice(1).map((sport) => (
                          <option key={sport} value={sport}>
                            {sport}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t("recTeams.skillLevel")}</label>
                      <select
                        value={newTeam.skillLevel}
                        onChange={(e) =>
                          handleInputChange("skillLevel", e.target.value)
                        }
                        required
                      >
                        <option value="">
                          {t("recTeams.selectSkillLevel")}
                        </option>
                        {skillLevels.slice(1).map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t("recTeams.teamName")}</label>
                    <input
                      type="text"
                      value={newTeam.teamName}
                      onChange={(e) =>
                        handleInputChange("teamName", e.target.value)
                      }
                      placeholder={t("recTeams.teamNamePlaceholder")}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t("recTeams.description")}</label>
                    <textarea
                      value={newTeam.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder={t("recTeams.descriptionPlaceholder")}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t("recTeams.location")}</label>
                      <input
                        type="text"
                        value={newTeam.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder={t("recTeams.locationPlaceholder")}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{t("recTeams.schedule")}</label>
                      <input
                        type="text"
                        value={newTeam.schedule}
                        onChange={(e) =>
                          handleInputChange("schedule", e.target.value)
                        }
                        placeholder={t("recTeams.schedulePlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t("recTeams.maxMembers")}</label>
                      <input
                        type="number"
                        value={newTeam.maxMembers}
                        onChange={(e) =>
                          handleInputChange("maxMembers", e.target.value)
                        }
                        placeholder="15"
                        min="5"
                        max="50"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newTeam.isCompetitive}
                          onChange={(e) =>
                            handleInputChange("isCompetitive", e.target.checked)
                          }
                        />
                        {t("recTeams.competitive")}
                      </label>
                    </div>
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
                      {t("recTeams.createTeam")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="rec-teams-list">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <div key={team.id} className="rec-team-card">
                  <div className="team-header">
                    <div className="team-sport">
                      <SportsIcon className="sport-icon" />
                      <span className="sport-name">{team.sport}</span>
                      {team.isCompetitive && (
                        <EmojiEventsIcon
                          className="competitive-icon"
                          title="Competitive Team"
                        />
                      )}
                    </div>
                    <div className="team-members">
                      <GroupIcon className="members-icon" />
                      <span>
                        {team.members}/{team.maxMembers}
                      </span>
                    </div>
                  </div>

                  <h3 className="team-name">{team.teamName}</h3>

                  <div className="skill-level">
                    <StarIcon className="skill-icon" />
                    <span>
                      {team.skillLevel} {getSkillLevelIcon(team.skillLevel)}
                    </span>
                  </div>

                  <p className="team-description">{team.description}</p>

                  <div className="team-details">
                    <div className="detail-item">
                      <LocationOnIcon className="detail-icon" />
                      <span>{team.location}</span>
                    </div>
                    <div className="detail-item">
                      <AccessTimeIcon className="detail-icon" />
                      <span>{team.schedule}</span>
                    </div>
                  </div>

                  <div className="team-actions">
                    <button
                      className="join-btn"
                      disabled={team.members >= team.maxMembers}
                    >
                      {team.members >= team.maxMembers
                        ? t("recTeams.full")
                        : t("recTeams.joinTeam")}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-teams">
                <SportsIcon className="no-teams-icon" />
                <h3>{t("recTeams.noTeams")}</h3>
                <p>{t("recTeams.noTeamsDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecTeams;
