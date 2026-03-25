"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ClientNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link className="site-nav__brand" href="/" onClick={() => setOpen(false)}>
          <Image
            src="/eagle-logo.png"
            alt="Philippine Eagles logo"
            width={56}
            height={56}
            className="site-nav__logo"
            priority
          />
          <div>
            <span className="site-nav__title">Aurora Maharlikan Eagles Club</span>
            <span className="site-nav__subtitle">Eastern Luzon Region 5</span>
          </div>
        </Link>
        <nav className={`site-nav__links ${open ? "is-open" : ""}`}>
          <Link href="/#about" onClick={() => setOpen(false)}>
            About Us
          </Link>
          <Link href="/#events" onClick={() => setOpen(false)}>
            Events
          </Link>
          <Link href="/directory" onClick={() => setOpen(false)}>
            Business Directory
          </Link>
          <Link href="/nest" onClick={() => setOpen(false)}>
            Eagles' Nest Online
          </Link>
          <Link href="/#contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
          <Link
            className="btn primary site-nav__cta site-nav__cta--inline"
            href="/#membership"
            onClick={() => setOpen(false)}
          >
            Become an Eagle
          </Link>
        </nav>
        <button
          className="site-nav__toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link className="btn primary site-nav__cta" href="/#membership">
          Become an Eagle
        </Link>
      </div>
    </header>
  );
}
