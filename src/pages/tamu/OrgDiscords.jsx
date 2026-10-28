import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupIcon from "@mui/icons-material/Group";
import ChatIcon from "@mui/icons-material/Chat";
import PublicIcon from "@mui/icons-material/Public";
import SchoolIcon from "@mui/icons-material/School";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PaletteIcon from "@mui/icons-material/Palette";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import "./socialHub.scss";

const OrgDiscords = ({ onBack }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [discordServers] = useState([
    {
      id: 1,
      name: "TAMU Computer Science Club",
      organization: "Computer Science Club",
      description:
        "Official Discord for CS students. Programming help, project collaboration, internship discussions, and tech talks.",
      category: "Academic",
      subCategory: "Computer Science",
      members: 1247,
      isOfficial: true,
      tags: ["Programming", "Internships", "Projects", "Study Help"],
      inviteCode: "CSClubTAMU",
    },
    {
      id: 2,
      name: "Aggie Gaming Community",
      organization: "Gaming Club",
      description:
        "Connect with fellow Aggie gamers! Organize tournaments, find teammates, and discuss the latest games.",
      category: "Gaming",
      subCategory: "Video Games",
      members: 892,
      isOfficial: true,
      tags: ["Gaming", "Tournaments", "LFG", "Esports"],
      inviteCode: "AggieGamers",
    },
    {
      id: 3,
      name: "TAMU Engineering Society",
      organization: "Engineering Society",
      description:
        "For all engineering majors! Share resources, discuss projects, career advice, and networking opportunities.",
      category: "Academic",
      subCategory: "Engineering",
      members: 1563,
      isOfficial: true,
      tags: ["Engineering", "Career", "Networking", "Projects"],
      inviteCode: "TAMUEngineers",
    },
    {
      id: 4,
      name: "Aggie Art Collective",
      organization: "Art Club",
      description:
        "Creative space for artists at TAMU. Share artwork, get feedback, find collaboration partners, and art events.",
      category: "Arts",
      subCategory: "Visual Arts",
      members: 445,
      isOfficial: true,
      tags: ["Art", "Creative", "Portfolio", "Collaboration"],
      inviteCode: "AggieArt",
    },
    {
      id: 5,
      name: "Business Students Network",
      organization: "Business Student Council",
      description:
        "Mays Business School students! Networking, career opportunities, study groups, and business case competitions.",
      category: "Academic",
      subCategory: "Business",
      members: 967,
      isOfficial: true,
      tags: ["Business", "Networking", "Careers", "Case Competitions"],
      inviteCode: "MaysStudents",
    },
    {
      id: 6,
      name: "TAMU Volunteer Corps",
      organization: "Student Volunteer Services",
      description:
        "Find volunteer opportunities around Bryan-College Station. Make a difference in the community!",
      category: "Service",
      subCategory: "Community Service",
      members: 634,
      isOfficial: true,
      tags: ["Volunteering", "Community", "Service", "Impact"],
      inviteCode: "AggieVolunteers",
    },
    {
      id: 7,
      name: "Aggie Music Society",
      organization: "Music Club",
      description:
        "For musicians and music lovers! Share performances, find bandmates, discuss music theory, and jam sessions.",
      category: "Arts",
      subCategory: "Music",
      members: 378,
      isOfficial: true,
      tags: ["Music", "Performance", "Bands", "Theory"],
      inviteCode: "AggieMusic",
    },
    {
      id: 8,
      name: "TAMU Fitness & Wellness",
      organization: "Recreation Sports",
      description:
        "Fitness enthusiasts unite! Workout partners, nutrition tips, fitness challenges, and wellness discussions.",
      category: "Health",
      subCategory: "Fitness",
      members: 756,
      isOfficial: true,
      tags: ["Fitness", "Nutrition", "Wellness", "Workout Partners"],
      inviteCode: "AggieFitness",
    },
    {
      id: 9,
      name: "International Students TAMU",
      organization: "International Student Services",
      description:
        "Supporting international students at TAMU. Cultural exchange, visa help, events, and making friends!",
      category: "Cultural",
      subCategory: "International",
      members: 1124,
      isOfficial: true,
      tags: ["International", "Cultural", "Support", "Events"],
      inviteCode: "TAMUInternational",
    },
    {
      id: 10,
      name: "Pre-Med Aggies",
      organization: "Pre-Medical Society",
      description:
        "Pre-medical students support network. MCAT prep, application help, volunteering opportunities, and mentorship.",
      category: "Academic",
      subCategory: "Pre-Professional",
      members: 823,
      isOfficial: true,
      tags: ["Pre-Med", "MCAT", "Applications", "Mentorship"],
      inviteCode: "PreMedAggies",
    },
  ]);

  const categories = [
    { name: "All", icon: PublicIcon },
    { name: "Academic", icon: SchoolIcon },
    { name: "Gaming", icon: SportsEsportsIcon },
    { name: "Arts", icon: PaletteIcon },
    { name: "Service", icon: VolunteerActivismIcon },
    { name: "Health", icon: FitnessCenterIcon },
    { name: "Cultural", icon: GroupIcon },
  ];

  const filteredServers = discordServers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      selectedCategory === "" ||
      selectedCategory === "All" ||
      server.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    const categoryData = categories.find((cat) => cat.name === category);
    return categoryData ? categoryData.icon : GroupIcon;
  };

  const handleJoinServer = (inviteCode) => {
    navigator.clipboard.writeText(`https://discord.gg/${inviteCode}`);
    alert("Discord invite link copied to clipboard!");
  };

  return (
    <div className="social-hub">
      <div className="social-container">
        <div className="social-header">
          <h2>{t("orgDiscords.title")}</h2>
          <p className="tagline">{t("orgDiscords.subtitle")}</p>
        </div>

        <div className="org-discords-content">
          <div className="discord-controls">
            <div className="search-section">
              <div className="search-bar">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder={t("orgDiscords.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <button
                className={`filter-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterListIcon /> {t("orgDiscords.filters")}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="category-filters">
              <h4>{t("orgDiscords.categories")}</h4>
              <div className="category-grid">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.name}
                      className={`category-btn ${selectedCategory === category.name ? "active" : ""}`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <IconComponent className="category-icon" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="discord-servers-list">
            {filteredServers.length > 0 ? (
              filteredServers.map((server) => {
                const CategoryIcon = getCategoryIcon(server.category);
                return (
                  <div key={server.id} className="discord-server-card">
                    <div className="server-header">
                      <div className="server-info">
                        <div className="server-category">
                          <CategoryIcon className="category-icon" />
                          <span className="category-name">
                            {server.category}
                          </span>
                          {server.isOfficial && (
                            <span className="official-badge">
                              {t("orgDiscords.official")}
                            </span>
                          )}
                        </div>
                        <div className="server-members">
                          <GroupIcon className="members-icon" />
                          <span>
                            {server.members.toLocaleString()}{" "}
                            {t("orgDiscords.members")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="server-name">{server.name}</h3>
                    <p className="server-organization">{server.organization}</p>
                    <p className="server-description">{server.description}</p>

                    <div className="server-tags">
                      {server.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="server-actions">
                      <button
                        className="join-btn"
                        onClick={() => handleJoinServer(server.inviteCode)}
                      >
                        <ChatIcon /> {t("orgDiscords.joinServer")}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-servers">
                <ChatIcon className="no-servers-icon" />
                <h3>{t("orgDiscords.noServers")}</h3>
                <p>{t("orgDiscords.noServersDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDiscords;
