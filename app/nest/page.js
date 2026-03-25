import Image from "next/image";
import Link from "next/link";
import { nestModules } from "./modules";

export default function EaglesNestPage() {
  return (
    <div className="page nest-page">
      <header className="nest-hero">
        <div className="nest-hero__brand">
          <Image
            src="/eagle-logo.png"
            alt="Philippine Eagles logo"
            width={64}
            height={64}
            className="nest-hero__logo"
            priority
          />
          <div>
            <span className="nest-hero__eyebrow">Eagles' Nest Online</span>
            <h1>Your Digital Eagle Hub</h1>
          </div>
        </div>
        <p>
          Access member services, directories, and business exchanges all in one secure
          portal built for the KUYA Eagle community. The Nest keeps Eagles connected,
          informed, and ready for action across Eastern Luzon.
        </p>
        <div className="nest-hero__actions">
          <a className="btn primary" href="mailto:auroraeaglesclub@gmail.com">
            Request Access
          </a>
          <a className="btn ghost" href="/directory">
            Visit Business Directory
          </a>
        </div>
      </header>

      <section className="nest-section">
        <div className="nest-section__header">
          <div>
            <span className="club-eyebrow">Portal Modules</span>
            <h2>Everything Eagles Need, Centralized</h2>
            <p>
              Each module is designed to keep Eagle members aligned, accountable, and
              supported in every mission.
            </p>
          </div>
          <div className="nest-badge">Secure Access</div>
        </div>
        <div className="nest-grid">
          {nestModules.map((module) => (
            <Link key={module.slug} className="nest-card" href={`/nest/${module.slug}`}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <span>{module.access}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="nest-section nest-section--split">
        <div>
          <span className="club-eyebrow">Member Support</span>
          <h2>Need Help Logging In?</h2>
          <p>
            The Nest is available to verified Eagles only. If you do not yet have access,
            contact the membership committee or club secretary to activate your account.
          </p>
        </div>
        <div className="nest-panel">
          <h3>Access Checklist</h3>
          <ul>
            <li>Active Eagle membership and good standing.</li>
            <li>Verified email registered with the club.</li>
            <li>Approval from the Membership Committee.</li>
          </ul>
          <a className="btn ghost" href="mailto:auroraeaglesclub@gmail.com">
            Email the Committee
          </a>
        </div>
      </section>
    </div>
  );
}
