"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [name, setName] = useState("");
  const [version, setVersion] = useState<"A" | "B">("A");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    setUser(name.trim(), version);
    router.push("/dashboard");
  };

  return (
    <div className="onboarding-screen">
      <div className="onboard-box">
        <div className="logo-line">
          {"// 6-Week Coding Journey"}
        </div>
        <h1 className="onboard-title">
          Think Like a<br />
          <span>Programmer</span>
        </h1>
        <p className="onboard-sub">
          A welcoming guide to six weeks of building, experimenting, and
          learning to code.
        </p>

        <div className="onboard-form">
          <div className="input-group">
            <label htmlFor="name-input">{"// Your name"}</label>
            <input
              type="text"
              id="name-input"
              placeholder="Enter your first name"
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              style={error ? { borderColor: "var(--coral)" } : undefined}
            />
          </div>
          <div className="input-group">
            <label htmlFor="version-select">
              {"// Choose your path"}
            </label>
            <select
              id="version-select"
              value={version}
              onChange={(e) => setVersion(e.target.value as "A" | "B")}
            >
              <option value="A">
                Version A — start with how computers work
              </option>
              <option value="B">
                {"Version B — jump straight into problem solving"}
              </option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleSubmit}>
            {"Let's go \u2192"}
          </button>
        </div>

        <div className="course-note">
          <strong>Built to support you</strong> — this course is designed to
          help you learn step by step and build confidence as you go.
        </div>
      </div>
    </div>
  );
}
