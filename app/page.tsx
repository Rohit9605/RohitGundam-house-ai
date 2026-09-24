"use client";

import { ChangeEvent, useState } from "react";
import { Building2, ImagePlus, Link2, Sparkles, Upload, Footprints, Orbit, Layers3 } from "lucide-react";
import FloorPlan from "@/components/FloorPlan";
import HouseScene from "@/components/HouseScene";
import type { HouseDesign } from "@/lib/types";

type View = "plan" | "3d";

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [squareFeet, setSquareFeet] = useState(2800);
  const [bedrooms, setBedrooms] = useState(4);
  const [floors, setFloors] = useState(2);
  const [design, setDesign] = useState<HouseDesign | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [view, setView] = useState<View>("plan");
  const [walkthrough, setWalkthrough] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");

  function chooseFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Please use an image smaller than 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageUrl("");
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!image && !imageUrl.trim()) {
      setError("Upload a house image or paste a direct image URL first.");
      return;
    }
    setLoading(true);
    setError("");
    setDesign(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, imageUrl: imageUrl.trim(), squareFeet, bedrooms, floors }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setDesign(data.design);
      setDemo(Boolean(data.demo));
      setSelectedFloor(0);
      setView("plan");
      setWalkthrough(false);
    } catch (e: any) {
      setError(e?.message || "Unable to generate a house.");
    } finally {
      setLoading(false);
    }
  }

  const preview = image || imageUrl;

  return (
    <main>
      <header className="topbar">
        <div className="brand"><Building2 size={22} /> House AI</div>
        <span className="badge">Concept prototype</span>
      </header>

      <section className="hero">
        <p className="eyebrow">REFERENCE → FLOOR PLAN → 3D</p>
        <h1>Upload a house you love.<br />Walk through a new one inspired by it.</h1>
        <p className="subhead">
          House AI studies the architectural language of your reference and creates an original conceptual layout you can explore.
        </p>
      </section>

      {!design && (
        <section className="builder-grid">
          <div className="panel">
            <div className="panel-title"><ImagePlus size={19} /> 1. Add inspiration</div>
            <label className="upload-box">
              {preview ? (
                <img src={preview} alt="House inspiration preview" onError={() => setError("That image URL could not be displayed. Try uploading the image instead.")} />
              ) : (
                <div className="upload-empty">
                  <Upload size={30} />
                  <strong>Upload a house photo</strong>
                  <span>JPG, PNG or WebP · up to 8 MB</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={chooseFile} />
            </label>
            <div className="or"><span>or</span></div>
            <label className="url-field">
              <Link2 size={18} />
              <input
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); if (e.target.value) setImage(""); }}
                placeholder="Paste a direct image URL"
              />
            </label>
          </div>

          <div className="panel">
            <div className="panel-title"><Layers3 size={19} /> 2. Set a few constraints</div>
            <div className="field-row">
              <label>
                Approx. square feet
                <input type="number" min={800} max={10000} step={100} value={squareFeet} onChange={(e) => setSquareFeet(Number(e.target.value))} />
              </label>
              <label>
                Bedrooms
                <input type="number" min={1} max={10} value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
              </label>
              <label>
                Floors
                <select value={floors} onChange={(e) => setFloors(Number(e.target.value))}>
                  <option value={1}>1 floor</option>
                  <option value={2}>2 floors</option>
                  <option value={3}>3 floors</option>
                </select>
              </label>
            </div>
            <button className="primary" onClick={generate} disabled={loading}>
              <Sparkles size={19} />
              {loading ? "Designing your house…" : "Generate house concept"}
            </button>
            <p className="fineprint">Conceptual visualization only — not construction or permit documents.</p>
            {error && <div className="error">{error}</div>}
          </div>
        </section>
      )}

      {loading && (
        <section className="generating">
          <div className="pulse"><Sparkles size={28} /></div>
          <h2>Reading the architecture…</h2>
          <p>Extracting massing, roof language, materials and proportions, then building an original layout.</p>
        </section>
      )}

      {design && !loading && (
        <section className="result">
          <div className="result-head">
            <div>
              <p className="eyebrow">{demo ? "DEMO MODE" : "AI CONCEPT"}</p>
              <h2>{design.title}</h2>
              <p>{design.concept}</p>
            </div>
            <button className="secondary" onClick={() => setDesign(null)}>Start another</button>
          </div>

          {demo && <div className="demo-note">Add OPENAI_API_KEY in .env.local to analyze your uploaded reference. The 2D/3D experience below is using the built-in sample design.</div>}

          <div className="analysis-strip">
            <div><span>Style</span><strong>{design.analysis.style}</strong></div>
            <div><span>Roof</span><strong>{design.analysis.roof}</strong></div>
            <div><span>Massing</span><strong>{design.analysis.massing}</strong></div>
          </div>

          <div className="workspace">
            <div className="toolbar">
              <div className="segmented">
                <button className={view === "plan" ? "active" : ""} onClick={() => { setView("plan"); setWalkthrough(false); }}>Floor plan</button>
                <button className={view === "3d" ? "active" : ""} onClick={() => setView("3d")}>3D house</button>
              </div>
              {view === "plan" && design.floors > 1 && (
                <div className="segmented small">
                  {Array.from({ length: design.floors }).map((_, i) => (
                    <button key={i} className={selectedFloor === i ? "active" : ""} onClick={() => setSelectedFloor(i)}>Floor {i + 1}</button>
                  ))}
                </div>
              )}
              {view === "3d" && (
                <button className={`walk-button ${walkthrough ? "active" : ""}`} onClick={() => setWalkthrough(!walkthrough)}>
                  {walkthrough ? <Orbit size={17} /> : <Footprints size={17} />}
                  {walkthrough ? "Exit walkthrough" : "Enter house"}
                </button>
              )}
            </div>

            {view === "plan" ? <FloorPlan design={design} floor={selectedFloor} /> : <HouseScene design={design} walkthrough={walkthrough} />}
          </div>

          <div className="details-grid">
            <div className="panel compact">
              <h3>Reference DNA</h3>
              <p>{design.analysis.windows}</p>
              <div className="chips">{design.analysis.materials.map((x) => <span key={x}>{x}</span>)}</div>
            </div>
            <div className="panel compact">
              <h3>Signature features</h3>
              <ul>{design.analysis.signatureFeatures.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
