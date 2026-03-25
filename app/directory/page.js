"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db, firebaseReady } from "../../lib/firebase";

const defaultCategories = [
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
const categoryKey = (value) => normalizeCategory(String(value || "")).toLowerCase();
const canonicalCategory = (value) => {
  const key = categoryKey(value);
  if (key === "resorts") return "Hotels & Lodging";
  return normalizeCategory(value);
};
const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  useEffect(() => {
    if (!firebaseReady || !auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const email = currentUser?.email?.toLowerCase() || "";
      setIsAdmin(adminEmailList.includes(email));
    });

    return () => unsubscribe();
  }, []);

  const categoryOptions = useMemo(() => {
    const map = new Map();
    defaultCategories.forEach((category) => {
      const canonical = canonicalCategory(category);
      const key = categoryKey(canonical);
      if (!map.has(key)) map.set(key, canonical);
    });
    businesses.forEach((business) => {
      if (!business.category) return;
      const canonical = canonicalCategory(business.category);
      const key = categoryKey(canonical);
      if (!map.has(key)) map.set(key, canonical);
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [businesses]);

  const stats = useMemo(
    () => [
      { label: "Listings", value: businesses.length },
      { label: "Categories", value: categoryOptions.length },
      { label: "Eagle Members", value: businesses.length },
    ],
    [businesses.length, categoryOptions.length]
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
        filterCategory === "all" ||
        categoryKey(canonicalCategory(business.category)) === filterCategory;
      return matchesTerm && matchesCategory;
    });
  }, [businesses, filterCategory, searchTerm]);

  const grouped = useMemo(() => {
    return filteredBusinesses.reduce((acc, business) => {
      const key = categoryKey(canonicalCategory(business.category));
      if (!acc[key]) acc[key] = [];
      acc[key].push(business);
      return acc;
    }, {});
  }, [filteredBusinesses]);

  const groupedCategories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  }, [grouped]);

  const categoryLabelMap = useMemo(() => {
    const map = new Map(categoryOptions.map((option) => [option.key, option.label]));
    return map;
  }, [categoryOptions]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

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

      const value = (key) => String(formData.get(key) || "").trim();

    setSubmitting(true);
    try {
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
        createdAt: serverTimestamp(),
      };

      const savePromise = addDoc(collection(db, "businesses"), newBusiness);
      savePromise.catch((error) => {
        console.error(error);
        setErrorMessage("Unable to save the listing. Please try again.");
      });
      event.currentTarget.reset();
      setSuccessMessage("Your business has been registered.");
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

  const handleAdminSignIn = async () => {
    if (!auth) return;
    setErrorMessage("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to sign in. Please try again.");
    }
  };

  const handleEmailSignIn = async () => {
    if (!auth) return;
    setErrorMessage("");
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setAdminPassword("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to sign in. Please check your credentials.");
    }
  };

  const handleAdminSignOut = async () => {
    if (!auth) return;
    setErrorMessage("");
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to sign out. Please try again.");
    }
  };

  const handleDelete = async (business) => {
    if (!db || !isAdmin) return;
    if (!confirm(`Delete ${business.name}? This cannot be undone.`)) return;

    setDeletingId(business.id);
    setErrorMessage("");
    try {
      await deleteDoc(doc(db, "businesses", business.id));
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to delete the listing. Please try again.");
    } finally {
      setDeletingId("");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (!db || !editingBusiness || !isAdmin) return;

    const formData = new FormData(event.currentTarget);
    const category = normalizeCategory(
      String(formData.get("customCategory") || formData.get("category") || "")
    );

    if (!category) return;

    const value = (key) => String(formData.get(key) || "").trim();

    setSubmitting(true);
    try {
      await updateDoc(doc(db, "businesses", editingBusiness.id), {
        name: value("name"),
        owner: value("owner"),
        category,
        location: value("location"),
        contact: value("contact"),
        phone: value("phone"),
        email: value("email"),
        website: value("website"),
        hours: value("hours"),
        updatedAt: serverTimestamp(),
      });

      setEditingBusiness(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to update the listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <div className="hero__brand">
            <img
              className="hero__logo"
              src="/eagle-logo.png"
              alt="Philippine Eagles logo"
            />
            <div className="badge">Eagle Member Network</div>
          </div>
          <h1>Business Directory</h1>
          <p>
            A community directory where an Eagle Member entrepreneurs can
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
          <button
            type="button"
            className="btn primary"
            onClick={() => setShowRegister(true)}
          >
            Register a Business
          </button>
        </div>
      </header>

      <main>
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
                {categoryOptions.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn ghost" onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
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
                    <div className="group-title">
                      {categoryLabelMap.get(category) || "Other"}
                    </div>
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
                          <span>
                            {categoryLabelMap.get(categoryKey(canonicalCategory(business.category))) ||
                              canonicalCategory(business.category || "")}
                          </span>
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
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              className="btn ghost small"
                              onClick={() => setEditingBusiness(business)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn danger small"
                              onClick={() => handleDelete(business)}
                              disabled={deletingId === business.id}
                            >
                              {deletingId === business.id ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </Fragment>
              ))
            )}
          </div>
        </section>
        {showRegister ? (
          <div className="modal-overlay" onClick={() => setShowRegister(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal__header">
                <div>
                  <h2>Register a Business</h2>
                  <p>Only KUYA Eagle Members can register. Listings publish instantly.</p>
                </div>
                <div className="modal__actions">
                  <span className="pill">Eagle Member</span>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => setShowRegister(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="admin-bar">
                <div>
                  <strong>Admin:</strong>{" "}
              {user?.email ? <span>{user.email}</span> : <span>Not signed in</span>}
            </div>
            {user ? (
              <button type="button" className="btn ghost" onClick={handleAdminSignOut}>
                Sign out
              </button>
            ) : (
              <div className="admin-login">
                <input
                  type="email"
                  placeholder="Admin email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                />
                <button type="button" className="btn ghost" onClick={handleEmailSignIn}>
                  Admin sign in
                </button>
              </div>
            )}
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
                  {categoryOptions.map((category) => (
                    <option key={category.key} value={category.label}>
                      {category.label}
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
                Complete Address
                <input
                  name="location"
                  type="text"
                  placeholder="Brgy. Zabali, Baler, Aurora"
                  required
                />
              </label>
              <label>
                Contact Person
                <input name="contact" type="text" placeholder="Maria Santos" required />
              </label>
            </div>
            <div className="form__row">
              <label>
                Phone
                <input name="phone" type="tel" placeholder="+63 9xx xxx xxxx" required />
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
                <div className="form__actions">
                  <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? "Saving..." : "Add to Directory"}
                  </button>
                  <button type="reset" className="btn ghost" disabled={submitting}>
                    Clear Form
                  </button>
                </div>
                {errorMessage ? <div className="empty">{errorMessage}</div> : null}
                {successMessage ? (
                  <div className="success">{successMessage}</div>
                ) : null}
              </form>
            </div>
          </div>
        ) : null}
        {editingBusiness ? (
          <div className="modal-overlay" onClick={() => setEditingBusiness(null)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal__header">
                <div>
                  <h2>Update Business</h2>
                  <p>Edit details for this listing.</p>
                </div>
                <div className="modal__actions">
                  <span className="pill">Admin</span>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => setEditingBusiness(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
              <form className="form" onSubmit={handleUpdate}>
                <div className="form__row">
                  <label>
                    Business Name
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingBusiness.name || ""}
                      required
                    />
                  </label>
                  <label>
                    Owner (KUYA Member)
                    <input
                      name="owner"
                      type="text"
                      defaultValue={editingBusiness.owner || ""}
                      required
                    />
                  </label>
                </div>
                <div className="form__row">
                  <label>
                    Category
                    <select
                      name="category"
                      defaultValue={normalizeCategory(editingBusiness.category || "")}
                      required
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((category) => (
                        <option key={category.key} value={category.label}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    If other, specify
                    <input
                      name="customCategory"
                      type="text"
                      placeholder="Event Services"
                    />
                  </label>
                </div>
                <div className="form__row">
                  <label>
                    Complete Address
                    <input
                      name="location"
                      type="text"
                      defaultValue={editingBusiness.location || ""}
                      required
                    />
                  </label>
                  <label>
                    Contact Person
                    <input
                      name="contact"
                      type="text"
                      defaultValue={editingBusiness.contact || ""}
                      required
                    />
                  </label>
                </div>
                <div className="form__row">
                  <label>
                    Phone
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={editingBusiness.phone || ""}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingBusiness.email || ""}
                    />
                  </label>
                </div>
                <div className="form__row">
                  <label>
                    Website / Social Link
                    <input
                      name="website"
                      type="url"
                      defaultValue={editingBusiness.website || ""}
                    />
                  </label>
                  <label>
                    Operating Hours
                    <input
                      name="hours"
                      type="text"
                      defaultValue={editingBusiness.hours || ""}
                    />
                  </label>
                </div>
                <div className="form__actions">
                  <button type="submit" className="btn primary" disabled={submitting}>
                    {submitting ? "Saving..." : "Update Listing"}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setEditingBusiness(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
                {errorMessage ? <div className="empty">{errorMessage}</div> : null}
                {successMessage ? (
                  <div className="success">{successMessage}</div>
                ) : null}
              </form>
            </div>
          </div>
        ) : null}
      </main>

    </div>
  );
}
