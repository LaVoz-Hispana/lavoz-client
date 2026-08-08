import "./adminDashboard.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import { STATUS_COLORS } from "../../utils/escrowStatus";
import EscrowLock from "../../components/admin/EscrowLock";
import Post from "../../components/post/Post";
import SponsorManager from "../../components/admin/SponsorManager";
import moment from "moment";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [adminSection, setAdminSection] = useState("escrow-lock");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { isLoading: usersLoading, data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => makeRequest.get("/users/").then((res) => res.data),
  });

  const { isLoading: escrowsLoading, data: escrows } = useQuery({
    queryKey: ["adminEscrows"],
    queryFn: () => makeRequest.get("/escrows").then((res) => res.data),
  });

  const { isLoading: adminPostsLoading, data: adminPosts } = useQuery({
    queryKey: ["adminPosts"],
    queryFn: () => makeRequest.get("/posts/admin").then((res) => res.data),
    enabled: adminSection === "admin-posts",
  });

  const filteredUsers = users?.filter((u) =>
    typeFilter === "all" ? true : u.account_type === typeFilter
  ) ?? [];

  const filteredEscrows = escrows?.filter((e) =>
    statusFilter === "all" ? true : e.status === statusFilter
  ) ?? [];

  const USER_TYPES = ["all", "student", "local", "admin"];
  const STATUSES   = ["all", "pending", "active", "submitted", "completed", "cancelled"];

  return (
    <div className="admin-dashboard">
      <div className="header">
        <h1>{t("admin.dashboard")}</h1>
      </div>

      <div className="content">
        <div className="tabs admin-section-tabs">
          <button
            className={adminSection === "escrow-lock" ? "tab selected" : "tab"}
            onClick={() => setAdminSection("escrow-lock")}
          >
            Escrow Lock
          </button>
          <button
            className={adminSection === "admin-posts" ? "tab selected" : "tab"}
            onClick={() => setAdminSection("admin-posts")}
          >
            Admin Posts
          </button>
          <button
            className={adminSection === "sponsors" ? "tab selected" : "tab"}
            onClick={() => setAdminSection("sponsors")}
          >
            Sponsors
          </button>
        </div>

        {adminSection === "admin-posts" && (
          <section className="admin-posts">
            {adminPostsLoading && <span className="state">Loading...</span>}
            {!adminPostsLoading && adminPosts?.length === 0 && (
              <span className="state">No admin posts yet.</span>
            )}
            {adminPosts?.map((post) => <Post key={post.id} post={post} />)}
          </section>
        )}

        {adminSection === "sponsors" && <SponsorManager />}

        {adminSection === "escrow-lock" && <>
          <EscrowLock />

        <div className="tabs">
          <button
            className={tab === "users" ? "tab selected" : "tab"}
            onClick={() => setTab("users")}
          >
            {t("admin.users")}
          </button>
          <button
            className={tab === "escrows" ? "tab selected" : "tab"}
            onClick={() => setTab("escrows")}
          >
            {t("admin.escrows")}
          </button>
        </div>

        {/* ── Users Tab ── */}
        {tab === "users" && (
          <>
            <div className="filter-row">
              {USER_TYPES.map((type) => (
                <button
                  key={type}
                  className={typeFilter === type ? "filter-btn active" : "filter-btn"}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === "all" ? t("admin.allTypes") : type}
                </button>
              ))}
            </div>

            {usersLoading && <span className="state">Loading...</span>}
            {!usersLoading && filteredUsers.length === 0 && (
              <span className="state">{t("admin.noUsers")}</span>
            )}

            {!usersLoading && filteredUsers.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("admin.name")}</th>
                      <th>{t("admin.email")}</th>
                      <th>{t("admin.type")}</th>
                      <th>{t("admin.joined")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => navigate(`/profile/${u.id}`)}
                        className="clickable"
                      >
                        <td>
                          <div className="user-cell">
                            <img src={u.profilePic} alt="" />
                            <span>{u.username}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`type-badge ${u.account_type}`}>
                            {u.account_type}
                          </span>
                        </td>
                        <td>{u.createdAt ? moment(u.createdAt).format("MMM D, YYYY") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Escrows Tab ── */}
        {tab === "escrows" && (
          <>
            <div className="filter-row">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={statusFilter === s ? "filter-btn active" : "filter-btn"}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all" ? t("admin.allStatuses") : t(`escrow.${s}`)}
                </button>
              ))}
            </div>

            {escrowsLoading && <span className="state">Loading...</span>}
            {!escrowsLoading && filteredEscrows.length === 0 && (
              <span className="state">{t("admin.noEscrows")}</span>
            )}

            {!escrowsLoading && filteredEscrows.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("admin.project")}</th>
                      <th>{t("admin.student")}</th>
                      <th>{t("admin.local")}</th>
                      <th>{t("admin.status")}</th>
                      <th>{t("admin.lastUpdated")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEscrows.map((e) => (
                      <tr
                        key={e.id}
                        onClick={() => navigate(`/escrows/${e.id}`)}
                        className="clickable"
                      >
                        <td>{e.projectTitle}</td>
                        <td>{e.studentUsername}</td>
                        <td>{e.localUsername}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: STATUS_COLORS[e.status] || "#888" }}
                          >
                            {t(`escrow.${e.status}`)}
                          </span>
                        </td>
                        <td>{moment(e.updatedAt).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        </>}
      </div>
    </div>
  );
};

export default AdminDashboard;
