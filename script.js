const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();

const navToggle = document.querySelector(".navbar-toggle");
const navbarLinks = document.querySelector(".navbar-links");
if (navToggle && navbarLinks) {
  navToggle.addEventListener("click", () => {
    const open = navbarLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

const slides = [...document.querySelectorAll(".carousel .item")];
const indicators = [...document.querySelectorAll(".carousel-indicators button")];
let activeSlide = 0;

function showSlide(index) {
  if (!slides.length) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === activeSlide));
  indicators.forEach((indicator, slideIndex) => indicator.classList.toggle("active", slideIndex === activeSlide));
}

document.querySelector(".left.carousel-control")?.addEventListener("click", () => showSlide(activeSlide - 1));
document.querySelector(".right.carousel-control")?.addEventListener("click", () => showSlide(activeSlide + 1));
indicators.forEach((indicator) => indicator.addEventListener("click", () => showSlide(Number(indicator.dataset.slideTo))));
showSlide(0);

const publicationList = document.querySelector("#publication-list");
const publicationSearch = document.querySelector("#publication-search");
const publicationCount = document.querySelector("#publication-count");
let publications = [];

function shortVenueLabel(venue = "") {
  const text = String(venue).trim();
  const rules = [
    ["International Conference on Machine Learning", "ICML"],
    ["Forty-Third International Conference on Machine Learning", "ICML"],
    ["International Conference on Learning Representations", "ICLR"],
    ["Conference on Learning Representations", "ICLR"],
    ["Advances in Neural Information Processing Systems", "NeurIPS"],
    ["Conference on Neural Information Processing Systems", "NeurIPS"],
    ["Neural Information Processing Systems", "NeurIPS"],
    ["Artificial Intelligence and Statistics", "AISTATS"],
    ["Conference on Artificial Intelligence", "AAAI"],
    ["Research in Computational Molecular Biology", "RECOMB"],
    ["Computer Vision and Pattern Recognition", "CVPR"],
    ["Transactions on Machine Learning Research", "TMLR"],
    ["Trans. Mach. Learn. Res.", "TMLR"],
    ["Empirical Methods in Natural Language Processing", "EMNLP"],
    ["International Conference on Acoustics", "ICASSP"],
    ["Interspeech", "INTERSPEECH"],
    ["CoRR", "arXiv"],
    ["arXiv preprint", "arXiv"],
    ["bioRxiv", "bioRxiv"],
  ];
  const direct = ["ICML", "ICLR", "NeurIPS", "AISTATS", "AAAI", "RECOMB", "CVPR", "TMLR", "EUSIPCO", "UAI", "ECAI", "ICASSP", "ICASSPW", "INTERSPEECH", "EMNLP", "FG", "WSCG", "NAR", "TASLP", "PNAS", "arXiv", "bioRxiv", "Preprint"];
  if (direct.includes(text)) return text;
  for (const [needle, label] of rules) {
    if (text.includes(needle)) return label;
  }
  const parenthetical = text.match(/\(([A-Z][A-Z0-9-]{2,})\)/);
  if (parenthetical) return parenthetical[1];
  return text.split(",")[0].replace(/\s+\d{4}.*/, "").trim();
}

function publicationMarkup(publication) {
  const title = publication.url
    ? `<a class="publication-title" href="${publication.url}" target="_blank" rel="noreferrer">${publication.title}</a>`
    : `<span class="publication-title">${publication.title}</span>`;
  const venue = shortVenueLabel(publication.venue || "Publication");
  return `
    <article class="publication">
      ${title}
      <p>${publication.authors.join(", ")}</p>
      <p><span class="venue venue-badge">${venue}</span></p>
    </article>`;
}

function renderPublications(query = "") {
  if (!publicationList || !publicationCount) return;
  const needle = query.trim().toLowerCase();
  const visible = publications.filter((publication) =>
    [publication.title, publication.venue, publication.year, ...publication.authors].join(" ").toLowerCase().includes(needle)
  );
  publicationCount.textContent = visible.length;
  const groups = visible.reduce((years, publication) => {
    const year = publication.year || "Other";
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(publication);
    return years;
  }, new Map());
  publicationList.innerHTML = visible.length
    ? [...groups.entries()].map(([year, entries]) => `
        <section class="year-group">
          <h3>${year}</h3>
          <div class="year-publications">${entries.map(publicationMarkup).join("")}</div>
        </section>`).join("")
    : '<p class="empty-state">No matching publications found.</p>';
}

if (publicationList) {
  fetch(`data/publications.json?v=20260608-short-venues-${Date.now()}`, { cache: "no-store" })
    .then((response) => response.json())
    .then((data) => {
      publications = data;
      renderPublications();
    })
    .catch(() => {
      publicationCount.textContent = "0";
      publicationList.innerHTML = '<p class="empty-state">The publication list could not be loaded.</p>';
    });
  publicationSearch.addEventListener("input", (event) => renderPublications(event.target.value));
}

const studentBars = [...document.querySelectorAll(".student-bar")];
function searchUrl(site, name) {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:${site} "${name}"`)}`;
}
function studentInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
function studentAvatarMarkup(student) {
  if (student.photo) {
    return `<img class="student-avatar student-avatar-photo" src="${student.photo}" alt="Portrait of ${student.name}" />`;
  }
  return `<span class="student-avatar" aria-hidden="true">${studentInitials(student.name)}</span>`;
}
function studentMarkup(student) {
  return `
    <article class="student-card">
      <div class="student-card-heading">
        ${studentAvatarMarkup(student)}
        <div>
          <h3>${student.name}</h3>
          ${student.status ? `<p>${student.status}</p>` : ""}
          ${student.note ? `<p>${student.note}</p>` : ""}
        </div>
      </div>
      <div class="student-links">
        <a href="${student.linkedin || searchUrl("linkedin.com/in", student.name)}" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </article>`;
}
if (studentBars.length) {
  fetch(`data/students.json?v=20260608-research-team-${Date.now()}`, { cache: "no-store" })
    .then((response) => response.json())
    .then((groups) => {
      studentBars.forEach((bar) => {
        bar.innerHTML = (groups[bar.dataset.students] || []).map(studentMarkup).join("");
      });
    });
}
