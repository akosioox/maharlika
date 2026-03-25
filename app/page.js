"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const heroVideoRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const handleChange = () => {
      setIsMobile(media.matches);
      if (videoRef.current) videoRef.current.muted = true;
      if (heroVideoRef.current) heroVideoRef.current.muted = true;
      setSoundEnabled(false);
    };
    handleChange();
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const handleToggleSound = () => {
    const nextEnabled = !soundEnabled;
    const target = isMobile ? heroVideoRef.current : videoRef.current;
    if (!target) return;
    target.muted = !nextEnabled;
    if (nextEnabled) {
      target.volume = 1;
      target.play().catch(() => undefined);
    }
    setSoundEnabled(nextEnabled);
  };

  return (
    <div className="page club-page">
      <header className="club-hero">
        <div className="club-hero__content">
          <div>
            <span className="club-eyebrow">Service Through Strong Brotherhood</span>
            <h1>Building Aurora Through Service, Leadership, and Unity</h1>
            <p>
              The Aurora Maharlikan Eagles Club is a fraternal socio-civic organization
              advancing community projects, mentoring leaders, and empowering
              Maharlikan entrepreneurs across Eastern Luzon Region 5.
            </p>
            <div className="club-hero__actions" id="join">
              <a className="btn primary" href="#membership">
                Become an Eagle
              </a>
              <a className="btn ghost" href="/directory">
                Explore the Directory
              </a>
            </div>
          </div>
          <div className="club-hero__panel">
            <div className="club-hero__panel-title">Upcoming Highlight</div>
            <div className="club-hero__panel-body">
              <strong>2026 Aurora Eagles Regional Assembly</strong>
              <span>Baler, Aurora - Date to be announced</span>
              <p>
                A gathering of leaders and members to align community impact initiatives,
                recognize outstanding members, and strengthen regional partnerships.
              </p>
              <a className="btn ghost" href="#events">
                View all events
              </a>
            </div>
          </div>
          <div className="club-hero__panel club-hero__panel--mobile">
            <div className="club-hero__panel-title">Featured Video</div>
            <div className="club-hero__panel-body">
              <video
                className="club-hero__video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/eagle-logo.png"
                ref={heroVideoRef}
              >
                <source src="/club-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="club-hero__video-controls">
                <button className="btn primary club-hero__sound-toggle" type="button" onClick={handleToggleSound}>
                  {soundEnabled ? "Mute Video" : "Enable Sound"}
                </button>
                <span>Sound requires a tap to comply with browser autoplay rules.</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="club-section club-video-section">
        <div className="club-video">
          <video
            className="club-video__player"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/eagle-logo.png"
            ref={videoRef}
          >
            <source src="/club-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="club-video__controls">
            <button className="btn ghost" type="button" onClick={handleToggleSound}>
              {soundEnabled ? "Mute Video" : "Enable Sound"}
            </button>
            <span className="club-video__note">
              Sound requires a tap to comply with browser autoplay rules.
            </span>
          </div>
        </div>
      </section>

      <section className="club-section" id="about">
        <div className="club-section__header">
          <span className="club-eyebrow">Who We Are</span>
          <h2>Brotherhood With Purpose</h2>
          <p>
            The Fraternal Order of Eagles traces its roots to a historic gathering in May
            1979 at Aberdeen Court on Quezon Avenue, Quezon City. What began as a small
            circle of civic-minded leaders grew into an indigenous service organization
            founded on strong brotherhood, committed to humanitarian service and unity.
          </p>
        </div>
        <div className="club-pillars">
          <div className="club-card">
            <h3>Historic Roots</h3>
            <p>Born from the 1979 rendezvous that inspired a new civic path.</p>
          </div>
          <div className="club-card">
            <h3>The Philippine Eagle</h3>
            <p>Named after a majestic bird symbolizing courage and foresight.</p>
          </div>
          <div className="club-card">
            <h3>Guiding Principle</h3>
            <p>Service through strong brotherhood in every mission.</p>
          </div>
          <div className="club-card">
            <h3>Constitution & By-Laws</h3>
            <p>Governed by the Eagles Constitution and SEC-registered by-laws.</p>
          </div>
        </div>
      </section>

      <section className="club-section" id="membership">
        <div className="club-cta">
          <div>
            <span className="club-eyebrow">Join Us</span>
            <h2>Become Part of the Brotherhood</h2>
            <p>
              Engage in service, grow your leadership, and build lifelong connections.
              Let's make Aurora stronger together.
            </p>
          </div>
          <div className="club-cta__actions">
            <a className="btn primary" href="mailto:auroraeaglesclub@gmail.com">
              Contact Membership
            </a>
            <a className="btn ghost" href="/directory">
              Visit Business Directory
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
