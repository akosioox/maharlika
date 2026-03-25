import Link from "next/link";
import { notFound } from "next/navigation";
import { getNestModule, nestModules } from "../modules";

export function generateStaticParams() {
  return nestModules.map((module) => ({ slug: module.slug }));
}

export default function NestModulePage({ params }) {
  const module = getNestModule(params.slug);
  if (!module) return notFound();

  return (
    <div className="page nest-page">
      <header className="nest-module">
        <Link className="nest-module__back" href="/nest">
          Back to Eagles' Nest
        </Link>
        <div className="nest-module__header">
          <div>
            <span className="nest-hero__eyebrow">Eagles' Nest Online</span>
            <h1>{module.title}</h1>
            <p>{module.description}</p>
          </div>
          <div className="nest-badge">{module.access}</div>
        </div>
      </header>

      <section className="nest-section nest-section--split">
        <div>
          <span className="club-eyebrow">What You Can Do</span>
          <h2>Key Capabilities</h2>
          <p>
            This module supports Eagle members with tools, resources, and quick access
            to the information that matters most.
          </p>
        </div>
        <div className="nest-panel">
          <h3>Highlights</h3>
          <ul>
            {module.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className="btn ghost" href="mailto:auroraeaglesclub@gmail.com">
            Contact Support
          </a>
        </div>
      </section>

      <section className="nest-section">
        <div className="nest-section__header">
          <div>
            <span className="club-eyebrow">Explore More</span>
            <h2>Other Nest Modules</h2>
            <p>Jump to another service inside Eagles' Nest Online.</p>
          </div>
        </div>
        <div className="nest-grid">
          {nestModules
            .filter((item) => item.slug !== module.slug)
            .map((item) => (
              <Link key={item.slug} className="nest-card" href={`/nest/${item.slug}`}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span>{item.access}</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
