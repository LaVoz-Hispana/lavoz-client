import "./sponsorManager.scss";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const SponsorManager = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => makeRequest.get("/sponsors").then((res) => res.data),
  });

  const addSponsor = useMutation({
    mutationFn: async () => {
      if (!file || !name.trim() || !link.trim()) throw new Error("Name, link, and logo are required.");
      const formData = new FormData();
      formData.append("file", file);
      const upload = await makeRequest.post("/uploadSponsor", formData);
      return makeRequest.post("/sponsors", { name: name.trim(), link: link.trim(), logoUrl: upload.data });
    },
    onSuccess: () => {
      setName("");
      setLink("");
      setFile(null);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (requestError) => setError(requestError?.response?.data?.error || requestError.message || "Could not add sponsor."),
  });

  const removeSponsor = useMutation({
    mutationFn: (id) => makeRequest.delete(`/sponsors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors"] }),
  });

  const submit = (event) => {
    event.preventDefault();
    addSponsor.mutate();
  };

  return (
    <section className="sponsor-manager">
      <h2>Sponsors</h2>
      <p>Add a logo and the destination visitors should reach when they select it.</p>
      <form onSubmit={submit}>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="Sponsor name" required />
        <input value={link} onChange={(event) => setLink(event.target.value)} type="url" placeholder="https://sponsor.example" required />
        <input onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" accept="image/*" required />
        <button type="submit" disabled={addSponsor.isPending}>{addSponsor.isPending ? "Uploading..." : "Add sponsor"}</button>
      </form>
      {error && <span className="error-msg">{error}</span>}
      {isLoading && <span className="state">Loading sponsors...</span>}
      <div className="sponsor-manager-list">
        {sponsors?.map((sponsor) => (
          <article key={sponsor.id}>
            <img src={sponsor.logoUrl} alt="" />
            <div><strong>{sponsor.name}</strong><a href={sponsor.link} target="_blank" rel="noopener noreferrer">{sponsor.link}</a></div>
            <button type="button" onClick={() => removeSponsor.mutate(sponsor.id)} disabled={removeSponsor.isPending}>Remove</button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SponsorManager;
