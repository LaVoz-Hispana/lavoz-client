import "./sponsorManager.scss";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Snackbar } from "@mui/material";
import { makeRequest } from "../../axios";

const SponsorManager = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [sponsorType, setSponsorType] = useState("regular");
  const [file, setFile] = useState(null);
  const [editingSponsorId, setEditingSponsorId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    link: "",
    sponsorType: "regular",
    logoUrl: "",
    file: null,
  });
  const [error, setError] = useState(null);
  const [contentEn, setContentEn] = useState("");
  const [contentEs, setContentEs] = useState("");
  const [sectionSaveNotice, setSectionSaveNotice] = useState({ open: false, message: "", severity: "success" });
  const [sectionLastSavedAt, setSectionLastSavedAt] = useState(null);

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => makeRequest.get("/sponsors").then((res) => res.data),
  });

  const { data: sponsorSection, isLoading: sponsorSectionLoading } = useQuery({
    queryKey: ["sponsor-section"],
    queryFn: () => makeRequest.get("/sponsors/section").then((res) => res.data),
  });

  useEffect(() => {
    if (!sponsorSection) return;
    setContentEn(sponsorSection.contentEn || "");
    setContentEs(sponsorSection.contentEs || "");
    setSectionLastSavedAt(sponsorSection.updatedAt ? new Date(sponsorSection.updatedAt) : null);
  }, [sponsorSection]);

  const addSponsor = useMutation({
    mutationFn: async () => {
      if (!file || !name.trim() || !link.trim()) throw new Error("Name, link, and logo are required.");
      const formData = new FormData();
      formData.append("file", file);
      const upload = await makeRequest.post("/uploadSponsor", formData);
      return makeRequest.post("/sponsors", {
        name: name.trim(),
        link: link.trim(),
        logoUrl: upload.data,
        sponsorType,
      });
    },
    onSuccess: () => {
      setName("");
      setLink("");
      setSponsorType("regular");
      setFile(null);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (requestError) => setError(requestError?.response?.data?.error || requestError.message || "Could not add sponsor."),
  });

  const startEditingSponsor = (sponsor) => {
    setEditingSponsorId(sponsor.id);
    setEditForm({
      name: sponsor.name || "",
      link: sponsor.link || "",
      sponsorType: sponsor.sponsorType || "regular",
      logoUrl: sponsor.logoUrl || "",
      file: null,
    });
    setError(null);
  };

  const cancelEditingSponsor = () => {
    setEditingSponsorId(null);
    setEditForm({
      name: "",
      link: "",
      sponsorType: "regular",
      logoUrl: "",
      file: null,
    });
  };

  const updateSponsor = useMutation({
    mutationFn: async ({ id, name: nextName, link: nextLink, sponsorType: nextSponsorType, logoUrl: nextLogoUrl, file: nextFile }) => {
      let resolvedLogoUrl = nextLogoUrl;
      if (nextFile) {
        const formData = new FormData();
        formData.append("file", nextFile);
        const upload = await makeRequest.post("/uploadSponsor", formData);
        resolvedLogoUrl = upload.data;
      }

      return makeRequest.put(`/sponsors/${id}`, {
        name: nextName.trim(),
        link: nextLink.trim(),
        sponsorType: nextSponsorType,
        logoUrl: resolvedLogoUrl,
      });
    },
    onSuccess: () => {
      setError(null);
      cancelEditingSponsor();
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (requestError) => setError(requestError?.response?.data?.error || requestError.message || "Could not update sponsor."),
  });

  const updateSponsorSection = useMutation({
    mutationFn: () =>
      makeRequest.put("/sponsors/section", {
        contentEn: contentEn.trim(),
        contentEs: contentEs.trim(),
      }),
    onSuccess: () => {
      setError(null);
      const savedAt = new Date();
      setSectionLastSavedAt(savedAt);
      setSectionSaveNotice({
        open: true,
        severity: "success",
        message: `Homepage sponsor copy saved at ${savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["sponsor-section"] });
    },
    onError: (requestError) => setError(requestError?.response?.data?.error || requestError.message || "Could not update sponsor section."),
  });

  const removeSponsor = useMutation({
    mutationFn: (id) => makeRequest.delete(`/sponsors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });

  const submit = (event) => {
    event.preventDefault();
    addSponsor.mutate();
  };

  const submitEdit = (event, sponsorId) => {
    event.preventDefault();
    updateSponsor.mutate({ id: sponsorId, ...editForm });
  };

  const closeSectionNotice = (_, reason) => {
    if (reason === "clickaway") return;
    setSectionSaveNotice((current) => ({ ...current, open: false }));
  };

  return (
    <section className="sponsor-manager">
      <h2>Sponsors</h2>
      <p>Add a logo and the destination visitors should reach when they select it.</p>
      <div className="sponsor-section-editor">
        <h3>Homepage sponsor copy</h3>
        <p>Manage the text shown above the sponsor carousel on the home page.</p>
        {sponsorSectionLoading && <span className="state">Loading homepage copy...</span>}
        <div className="editor-grid">
          <label>
            <span>English</span>
            <textarea
              value={contentEn}
              onChange={(event) => {
                setContentEn(event.target.value);
              }}
              rows={4}
              placeholder="English sponsor message"
            />
          </label>
          <label>
            <span>Spanish</span>
            <textarea
              value={contentEs}
              onChange={(event) => {
                setContentEs(event.target.value);
              }}
              rows={4}
              placeholder="Mensaje de patrocinadores en español"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => updateSponsorSection.mutate()}
          disabled={updateSponsorSection.isPending || sponsorSectionLoading}
        >
          {updateSponsorSection.isPending ? "Saving..." : "Save homepage copy"}
        </button>
        {sectionLastSavedAt && (
          <span className="state section-meta">
            Last saved {sectionLastSavedAt.toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <form onSubmit={submit}>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="Sponsor name" required />
        <input value={link} onChange={(event) => setLink(event.target.value)} type="url" placeholder="https://sponsor.example" required />
        <label className="sponsor-type-field">
          <span>Sponsor Type</span>
          <select value={sponsorType} onChange={(event) => setSponsorType(event.target.value)}>
            <option value="regular">Regular</option>
            <option value="principle">Principle</option>
          </select>
        </label>
        <input onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" accept="image/*" required />
        <button type="submit" disabled={addSponsor.isPending}>{addSponsor.isPending ? "Uploading..." : "Add sponsor"}</button>
      </form>
      {error && <span className="error-msg">{error}</span>}
      {isLoading && <span className="state">Loading sponsors...</span>}
      <div className="sponsor-manager-list">
        {sponsors?.map((sponsor) => (
          <article key={sponsor.id}>
            <div className="sponsor-row-main">
              <img src={sponsor.logoUrl} alt="" />
              {editingSponsorId === sponsor.id ? (
                <form className="sponsor-edit-form" onSubmit={(event) => submitEdit(event, sponsor.id)}>
                  <input value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} placeholder="Sponsor name" required />
                  <input value={editForm.link} onChange={(event) => setEditForm((current) => ({ ...current, link: event.target.value }))} type="url" placeholder="https://sponsor.example" required />
                  <label className="sponsor-type-field">
                    <span>Sponsor Type</span>
                    <select value={editForm.sponsorType} onChange={(event) => setEditForm((current) => ({ ...current, sponsorType: event.target.value }))}>
                      <option value="regular">Regular</option>
                      <option value="principle">Principle</option>
                    </select>
                  </label>
                  <label className="sponsor-type-field">
                    <span>Logo file</span>
                    <input type="file" accept="image/*" onChange={(event) => setEditForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} />
                  </label>
                  <div className="sponsor-edit-actions">
                    <button type="submit" disabled={updateSponsor.isPending}>{updateSponsor.isPending ? "Saving..." : "Save"}</button>
                    <button type="button" className="secondary" onClick={cancelEditingSponsor}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="sponsor-row-content">
                  <strong>{sponsor.name}</strong>
                  <span className={`sponsor-type-badge ${sponsor.sponsorType || "regular"}`}>{(sponsor.sponsorType || "regular").charAt(0).toUpperCase() + (sponsor.sponsorType || "regular").slice(1)}</span>
                  <a href={sponsor.link} target="_blank" rel="noopener noreferrer">{sponsor.link}</a>
                </div>
              )}
            </div>
            {!editingSponsorId && (
              <div className="sponsor-row-actions">
                <button type="button" className="secondary" onClick={() => startEditingSponsor(sponsor)} disabled={removeSponsor.isPending}>Edit</button>
                <button type="button" onClick={() => removeSponsor.mutate(sponsor.id)} disabled={removeSponsor.isPending}>Remove</button>
              </div>
            )}
          </article>
        ))}
      </div>
      <Snackbar
        open={sectionSaveNotice.open}
        autoHideDuration={4500}
        onClose={closeSectionNotice}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSectionNotice} severity={sectionSaveNotice.severity} variant="filled" sx={{ width: "100%" }}>
          {sectionSaveNotice.message}
        </Alert>
      </Snackbar>
    </section>
  );
};

export default SponsorManager;
