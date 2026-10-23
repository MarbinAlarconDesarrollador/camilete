fetch("data.json")
  .then((r) => r.json())
  .then((d) => {
    const e = d.empresa || {},
      s = d.seo || {},
      file = location.pathname.split("/").pop() || "index.html",
      titles = {
        "index.html": s.tituloPrincipal || "Inicio",
        "menu.html": "Menú",
        "nosotros.html": "Nosotros",
        "ubicacion.html": "Ubicación",
        "contacto.html": "Contacto",
        "carrito.html": "Tu pedido",
        "politicas-privacidad.html": "Política de privacidad",
        "politicas-datos.html": "Tratamiento de datos personales",
        "terminos-condiciones.html": "Términos y condiciones",
        "devoluciones-reembolsos.html": "Devoluciones y reembolsos",
        "aviso-legal.html": "Aviso legal",
        "error.html": "Página no encontrada",
      },
      descriptions = {
        "index.html": s.descripcionPrincipal || e.descripcionCorta || "",
        "menu.html":
          "Consulta el menú de CAMILETE y pide tus favoritos en Piedecuesta.",
        "nosotros.html": "Conoce la historia y los valores de CAMILETE.",
        "ubicacion.html":
          "Dirección, horarios y cómo llegar a CAMILETE en Piedecuesta.",
        "contacto.html": "Comunícate con el equipo de CAMILETE.",
        "carrito.html": "Revisa tu pedido y envíalo a CAMILETE por WhatsApp.",
      };
    document.title =
      (titles[file] || titles["index.html"]) +
      (file === "index.html" ? "" : ` | ${e.nombre || "CAMILETE"}`);
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.content =
        descriptions[file] ||
        `${titles[file] || "CAMILETE"} · ${e.descripcionCorta || "Comida rápida en Piedecuesta"}`;
    const add = (property, content) => {
      let m = document.querySelector(`meta[property="${property}"]`);
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("property", property);
        document.head.append(m);
      }
      m.content = content;
    };
    add("og:title", document.title);
    add("og:description", desc?.content || "");
    add("og:type", "restaurant");
    add("og:locale", "es_CO");
    const schema = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: e.nombre || "CAMILETE",
      description: e.descripcionCorta || "Comida rápida en Piedecuesta",
      servesCuisine: "Comida rápida",
      telephone: e.telefono || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: e.direccion || undefined,
        addressLocality: "Piedecuesta",
        addressRegion: "Santander",
        addressCountry: "CO",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: e.latitud || undefined,
        longitude: e.longitud || undefined,
      },
      menu: "menu.html",
    };
    let x = document.createElement("script");
    x.type = "application/ld+json";
    x.textContent = JSON.stringify(schema);
    document.head.append(x);
  })
  .catch(() => {});
