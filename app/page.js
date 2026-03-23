"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, firebaseReady, storage } from "../lib/firebase";

const defaultCategories = [
  "Resorts",
  "Restaurants",
  "Cafes & Bakeries",
  "Hotels & Lodging",
  "Tours & Travel",
  "Transportation",
  "Retail & Trade",
  "Wellness & Beauty",
  "Education",
  "Construction",
  "Agriculture",
  "Tech & Services",
];

const normalizeCategory = (value) => value.trim().replace(/\s+/g, " ");
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!firebaseReady || !db) {
      setErrorMessage(
        "Firebase is not configured. Add your Firebase config values to .env.local."
      );
      setLoading(false);
      return undefined;
    }

    const directoryQuery = query(
      collection(db, "businesses"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      directoryQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setErrorMessage("Unable to load businesses right now. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(defaultCategories);
    businesses.forEach((business) => {
      if (business.category) set.add(business.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [businesses]);

  const stats = useMemo(
    () => [
      { label: "Listings", value: businesses.length },
      { label: "Categories", value: categories.length },
      { label: "Eagle Members", value: businesses.length },
    ],
    [businesses.length, categories.length]
  );

  const filteredBusinesses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return businesses.filter((business) => {
      const matchesTerm = term
        ? [
            business.name,
            business.category,
            business.location,
            business.owner,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;
      const matchesCategory =
        filterCategory === "all" || business.category === filterCategory;
      return matchesTerm && matchesCategory;
    });
  }, [businesses, filterCategory, searchTerm]);

  const grouped = useMemo(() => {
    return filteredBusinesses.reduce((acc, business) => {
      if (!acc[business.category]) acc[business.category] = [];
      acc[business.category].push(business);
      return acc;
    }, {});
  }, [filteredBusinesses]);

  const groupedCategories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  }, [grouped]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!firebaseReady || !db) {
      setErrorMessage(
        "Firebase is not configured. Add your Firebase config values to .env.local."
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const category = normalizeCategory(
      String(formData.get("customCategory") || formData.get("category") || "")
    );

    if (!category) return;

    const files = formData
      .getAll("photos")
      .filter(
        (file) =>
          file &&
          typeof file === "object" &&
          "size" in file &&
          "name" in file &&
          file.size > 0
      );

    if (files.length > MAX_PHOTOS) {
      setErrorMessage(`Please upload up to ${MAX_PHOTOS} photos only.`);
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_PHOTO_SIZE);
    if (oversizedFile) {
      setErrorMessage("Each photo must be 5MB or less.");
      return;
    }

    if (files.length > 0 && !storage) {
      setErrorMessage("Firebase Storage is not configured for photo uploads.");
      return;
    }

    const value = (key) => String(formData.get(key) || "").trim();

    setSubmitting(true);
    try {
      let photoUrls = [];
      if (files.length > 0 && storage) {
        const timestamp = Date.now();
        photoUrls = await Promise.all(
          files.map(async (file, index) => {
            const safeName = file.name.replace(/\s+/g, "-");
            const storageRef = ref(
              storage,
              `businesses/${timestamp}-${index}-${safeName}`
            );
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
          })
        );
      }

      const newBusiness = {
        name: value("name"),
        owner: value("owner"),
        category,
        location: value("location"),
        contact: value("contact"),
        phone: value("phone"),
        email: value("email"),
        website: value("website"),
        hours: value("hours"),
        photos: photoUrls,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "businesses"), newBusiness);
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to save the listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <div className="badge">KUYA Eagle Member Network</div>
          <h1>Business Directory</h1>
          <p>
            A community directory where KUYA (Eagle Member) entrepreneurs can
            register their businesses and be discovered by category, location,
            and service.
          </p>
          <div className="hero__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero__panel">
          <div className="panel__title">Quick Start</div>
          <ul className="panel__list">
            <li>Register your business below.</li>
            <li>Pick a category for easy discovery.</li>
            <li>Share contact details so members can reach you.</li>
          </ul>
        </div>
      </header>

      <main>
        <section className="card" id="register">
          <div className="card__header">
            <div>
              <h2>Register a Business</h2>
              <p>Only KUYA Eagle Members can register. Listings publish instantly.</p>
            </div>
            <span className="pill">Eagle Member</span>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form__row">
              <label>
                Business Name
                <input
                  name="name"
                  type="text"
                  placeholder="Maharlika Seaside Resort"
                  required
                />
              </label>
              <label>
                Owner (KUYA Member)
                <input name="owner" type="text" placeholder="Juan Dela Cruz" required />
              </label>
            </div>
            <div className="form__row">
              <label>
                Category
                <select name="category" required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                If other, specify
                <input name="customCategory" type="text" placeholder="Event Services" />
              </label>
            </div>
            <div className="form__row">
              <label>
                Location / Address
                <input name="location" type="text" placeholder="Panglao, Bohol" required />
              </label>
              <label>
                Contact Person
                <input name="contact" type="text" placeholder="Maria Santos" required />
              </label>
            </div>
            <div className="form__row">
              <label>
                Phone
                <input name="phone" type="tel" placeholder="+63 9xx xxx xxxx" />
              </label>
              <label>
                Email
                <input name="email" type="email" placeholder="hello@business.com" />
              </label>
            </div>
            <div className="form__row">
              <label>
                Website / Social Link
                <input name="website" type="url" placeholder="https://" />
              </label>
              <label>
                Operating Hours
                <input name="hours" type="text" placeholder="Daily 9:00 AM - 8:00 PM" />
              </label>
            </div>
            <label className="form__full">
              Business Photos
              <input
                name="photos"
                type="file"
                accept="image/*"
                multiple
                disabled={submitting}
              />
              <span className="helper">
                Upload up to {MAX_PHOTOS} photos (max 5MB each).
              </span>
            </label>
            <div className="form__actions">
              <button type="submit" className="btn primary" disabled={submitting}>
                {submitting ? "Saving..." : "Add to Directory"}
              </button>
              <button type="reset" className="btn ghost" disabled={submitting}>
                Clear Form
              </button>
            </div>
            {errorMessage ? <div className="empty">{errorMessage}</div> : null}
          </form>
        </section>

        <section className="directory">
          <div className="directory__controls">
            <div>
              <h2>Browse the Directory</h2>
              <p>Search by business name, location, or category.</p>
            </div>
            <div className="directory__search">
              <input
                type="search"
                placeholder="Search businesses"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <select
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="category-strip">
            <button
              type="button"
              className={`category-chip ${filterCategory === "all" ? "active" : ""}`}
              onClick={() => setFilterCategory("all")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-chip ${filterCategory === category ? "active" : ""}`}
                onClick={() => setFilterCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="directory__grid">
            {loading ? (
              <div className="empty">Loading directory...</div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="empty">
                No businesses found. Try another search or add a new listing.
              </div>
            ) : (
              groupedCategories.map((category) => (
                <Fragment key={category}>
                  {filterCategory === "all" ? (
                    <div className="group-title">{category}</div>
                  ) : null}
                  {grouped[category].map((business, index) => (
                    <div
                      key={business.id}
                      className="business-card"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div>
                        <h3>{business.name}</h3>
                        <div className="business-card__meta">
                          <span>{business.category}</span>
                          <span>{business.location}</span>
                        </div>
                      </div>
                      <div className="business-card__meta">
                        <span>Owner: {business.owner}</span>
                        <span>Contact: {business.contact}</span>
                        {business.phone ? <span>Phone: {business.phone}</span> : null}
                        {business.email ? <span>Email: {business.email}</span> : null}
                        {business.hours ? <span>Hours: {business.hours}</span> : null}
                      </div>
                      {business.photos?.length ? (
                        <div className="photo-grid">
                          {business.photos.slice(0, 6).map((photo, index) => {
                            const url =
                              typeof photo === "string" ? photo : photo?.url;
                            if (!url) return null;
                            return (
                              <img
                                key={`${business.id}-photo-${index}`}
                                src={url}
                                alt={`${business.name} photo ${index + 1}`}
                                loading="lazy"
                              />
                            );
                          })}
                        </div>
                      ) : null}
                      <div className="business-card__tags">
                        <span className="tag">Eagle Member</span>
                        {business.website ? (
                          <span className="tag">{business.website}</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </Fragment>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          Built for KUYA Eagle Members. Keep listings accurate and updated for
          community trust.
        </div>
        <button type="button" className="btn ghost" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </footer>
    </div>
  );
}
