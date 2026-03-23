const STORAGE_KEY = "kuya_business_directory_v1";

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

const seedBusinesses = [
  {
    id: crypto.randomUUID(),
    name: "Maharlika Seaside Resort",
    owner: "Juan Dela Cruz",
    category: "Resorts",
    location: "Panglao, Bohol",
    contact: "Maria Santos",
    phone: "+63 917 555 0123",
    email: "hello@maharlikaresort.ph",
    website: "https://maharlikaresort.ph",
    hours: "Daily 8:00 AM - 9:00 PM",
    description: "Family-friendly resort with island tours and beachfront dining.",
  },
  {
    id: crypto.randomUUID(),
    name: "Eagle Crest Grill",
    owner: "Ramon Bautista",
    category: "Restaurants",
    location: "Davao City",
    contact: "Ramon Bautista",
    phone: "+63 905 321 7788",
    email: "dine@eaglecrest.ph",
    website: "https://eaglecrest.ph",
    hours: "Daily 10:00 AM - 10:00 PM",
    description: "Signature grilled seafood and local favorites.",
  },
  {
    id: crypto.randomUUID(),
    name: "Lakbay Travel Desk",
    owner: "Sofia Reyes",
    category: "Tours & Travel",
    location: "Cebu City",
    contact: "Aileen Cruz",
    phone: "+63 918 222 9044",
    email: "bookings@lakbaydesk.com",
    website: "https://lakbaydesk.com",
    hours: "Mon-Sat 8:00 AM - 6:00 PM",
    description: "Custom tour packages for groups and corporate trips.",
  },
  {
    id: crypto.randomUUID(),
    name: "Harbor Lane Cafe",
    owner: "Leo Garcia",
    category: "Cafes & Bakeries",
    location: "Iloilo City",
    contact: "May Garcia",
    phone: "+63 907 100 3311",
    email: "hello@harborlane.ph",
    website: "https://harborlane.ph",
    hours: "Daily 7:00 AM - 7:00 PM",
    description: "Artisan coffee, pastries, and co-working tables.",
  },
];

let businesses = [];
let filterCategory = "all";
let searchTerm = "";

const statsEl = document.getElementById("stats");
const categorySelect = document.getElementById("categorySelect");
const filterSelect = document.getElementById("filterSelect");
const categoryStrip = document.getElementById("categoryStrip");
const directoryGrid = document.getElementById("directoryGrid");
const searchInput = document.getElementById("searchInput");
const form = document.getElementById("businessForm");
const resetButton = document.getElementById("resetData");

const normalizeCategory = (value) => value.trim().replace(/\s+/g, " ");

const loadBusinesses = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      businesses = JSON.parse(stored);
      return;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  businesses = [...seedBusinesses];
  persistBusinesses();
};

const persistBusinesses = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
};

const getCategories = () => {
  const categories = new Set(defaultCategories);
  businesses.forEach((business) => categories.add(business.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
};

const renderStats = () => {
  const categories = getCategories();
  statsEl.innerHTML = "";
  const statData = [
    { label: "Listings", value: businesses.length },
    { label: "Categories", value: categories.length },
    { label: "Eagle Members", value: businesses.length },
  ];

  statData.forEach((item) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<strong>${item.value}</strong><span>${item.label}</span>`;
    statsEl.appendChild(stat);
  });
};

const renderCategoryOptions = () => {
  const categories = getCategories();
  categorySelect.innerHTML = `<option value="">Select a category</option>`;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  filterSelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filterSelect.appendChild(option);
  });
};

const renderCategoryChips = () => {
  const categories = getCategories();
  categoryStrip.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.type = "button";
  allChip.className = `category-chip ${filterCategory === "all" ? "active" : ""}`;
  allChip.textContent = "All";
  allChip.addEventListener("click", () => {
    filterCategory = "all";
    filterSelect.value = "all";
    renderDirectory();
  });
  categoryStrip.appendChild(allChip);

  categories.forEach((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `category-chip ${filterCategory === category ? "active" : ""}`;
    chip.textContent = category;
    chip.addEventListener("click", () => {
      filterCategory = category;
      filterSelect.value = category;
      renderDirectory();
    });
    categoryStrip.appendChild(chip);
  });
};

const matchesFilter = (business) => {
  const term = searchTerm.trim().toLowerCase();
  const matchesTerm = term
    ? [
        business.name,
        business.category,
        business.location,
        business.owner,
        business.description,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    : true;
  const matchesCategory = filterCategory === "all" || business.category === filterCategory;
  return matchesTerm && matchesCategory;
};

const renderDirectory = () => {
  const filtered = businesses.filter(matchesFilter);
  directoryGrid.innerHTML = "";

  renderCategoryChips();
  renderStats();

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No businesses found. Try another search or add a new listing.";
    directoryGrid.appendChild(empty);
    return;
  }

  const grouped = filtered.reduce((acc, business) => {
    if (!acc[business.category]) acc[business.category] = [];
    acc[business.category].push(business);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  categories.forEach((category) => {
    if (filterCategory === "all") {
      const title = document.createElement("div");
      title.className = "group-title";
      title.textContent = category;
      directoryGrid.appendChild(title);
    }

    grouped[category].forEach((business, index) => {
      const card = document.createElement("div");
      card.className = "business-card";
      card.style.animationDelay = `${index * 0.05}s`;
      card.innerHTML = `
        <div>
          <h3>${business.name}</h3>
          <div class="business-card__meta">
            <span>${business.category}</span>
            <span>${business.location}</span>
          </div>
        </div>
        <div class="business-card__meta">
          <span>Owner: ${business.owner}</span>
          <span>Contact: ${business.contact}</span>
          ${business.phone ? `<span>Phone: ${business.phone}</span>` : ""}
          ${business.email ? `<span>Email: ${business.email}</span>` : ""}
          ${business.hours ? `<span>Hours: ${business.hours}</span>` : ""}
        </div>
        ${business.description ? `<p>${business.description}</p>` : ""}
        <div class="business-card__tags">
          <span class="tag">Eagle Member</span>
          ${business.website ? `<span class="tag">${business.website}</span>` : ""}
        </div>
      `;
      directoryGrid.appendChild(card);
    });
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const category = normalizeCategory(
    formData.get("customCategory") || formData.get("category") || ""
  );

  if (!category) {
    categorySelect.focus();
    return;
  }

  const newBusiness = {
    id: crypto.randomUUID(),
    name: formData.get("name").trim(),
    owner: formData.get("owner").trim(),
    category,
    location: formData.get("location").trim(),
    contact: formData.get("contact").trim(),
    phone: formData.get("phone").trim(),
    email: formData.get("email").trim(),
    website: formData.get("website").trim(),
    hours: formData.get("hours").trim(),
    description: formData.get("description").trim(),
  };

  businesses.unshift(newBusiness);
  persistBusinesses();
  renderCategoryOptions();
  renderDirectory();
  form.reset();
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderDirectory();
});

filterSelect.addEventListener("change", (event) => {
  filterCategory = event.target.value;
  renderDirectory();
});

resetButton.addEventListener("click", () => {
  businesses = [...seedBusinesses];
  persistBusinesses();
  renderCategoryOptions();
  renderDirectory();
});

loadBusinesses();
renderCategoryOptions();
renderDirectory();
