// LeadPro landing — nav toggle, scroll reveal, contact form fallback

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initContactForm();
  initYear();
});

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

// LeadPro doesn't yet have a public "contact us about the product" API
// endpoint (only per-client landing pages post to /api/landing/{slug}/lead).
// Fall back to a prefilled mailto: link until that endpoint exists.
const LEADPRO_CONTACT_EMAIL = "jorgelopez@leadpro.mx";

const CONTACTO_LABELS = {
  telefono: "Teléfono",
  email: "Correo electrónico",
  cita: "Agendar cita",
  videollamada: "Videollamada",
};

// "Fecha y hora preferida" only makes sense when the visitor wants to book a
// slot (cita/videollamada) — hide it otherwise instead of asking for info
// that a plain phone/email request doesn't need.
function needsFechaHora(contacto) {
  return contacto === "cita" || contacto === "videollamada";
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const contactoSelect = document.getElementById("forma-contacto");
  const fechaHoraRow = document.getElementById("fecha-hora-row");
  const fechaHoraInput = document.getElementById("fecha-hora");
  if (!form) return;

  function syncFechaHoraVisibility() {
    if (!contactoSelect || !fechaHoraRow || !fechaHoraInput) return;
    const show = needsFechaHora(contactoSelect.value);
    fechaHoraRow.classList.toggle("is-hidden", !show);
    fechaHoraInput.required = show;
    if (!show) {
      fechaHoraInput.value = "";
    }
  }

  if (contactoSelect) {
    contactoSelect.addEventListener("change", syncFechaHoraVisibility);
    syncFechaHoraVisibility();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const negocio = form.negocio.value.trim();
    const contacto = form.contacto ? form.contacto.value : "";
    const fechaHora = form.fecha_hora ? form.fecha_hora.value : "";
    const mensaje = form.mensaje.value.trim();

    const subject = encodeURIComponent(`Interesado en LeadPro${negocio ? " — " + negocio : ""}`);
    const bodyLines = [
      `Nombre: ${nombre}`,
      `Correo: ${email}`,
      negocio ? `Negocio: ${negocio}` : null,
      contacto ? `Forma de contacto: ${CONTACTO_LABELS[contacto] || contacto}` : null,
      fechaHora ? `Fecha y hora preferida: ${new Date(fechaHora).toLocaleString("es-MX")}` : null,
      "",
      mensaje || "(sin mensaje adicional)",
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join("\n"));

    window.location.href = `mailto:${LEADPRO_CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    if (note) {
      note.textContent = "Se abrió tu app de correo con el mensaje listo para enviar.";
    }
  });
}

function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}
