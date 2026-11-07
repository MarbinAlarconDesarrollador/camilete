(() => {
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const money = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);
  const readStorage = (key, fallback = null) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  const saved = (() => {
    const value = readStorage("camilete-data");
    return value?.version === 2 ? value : null;
  })();
  const pageFile = location.pathname.split("/").pop() || "index.html";
  const appRoot = document.querySelector("#app");
  const tableParam = new URLSearchParams(location.search).get("mesa")?.trim();
  const tableId =
    tableParam && /^[1-9]\d{0,2}$/.test(tableParam) ? tableParam : "";
  const tableQuery = tableId ? `?mesa=${encodeURIComponent(tableId)}` : "";
  if (pageFile === "menu.html" && appRoot) {
    try {
      const preferredTheme = localStorage.getItem("camilete-theme");
      if (preferredTheme === "claro" || preferredTheme === "oscuro")
        document.documentElement.dataset.theme = preferredTheme;
    } catch {}
    const filterSkeleton = Array.from(
      { length: 10 },
      () => '<span class="skeleton-filter" aria-hidden="true"></span>',
    ).join("");
    const productSkeleton = Array.from(
      { length: 6 },
      () =>
        '<article class="skeleton-product" aria-hidden="true"><span class="skeleton-product-image"></span><div class="skeleton-product-content"><span class="skeleton-line skeleton-category"></span><span class="skeleton-line skeleton-title"></span><span class="skeleton-line"></span><span class="skeleton-line skeleton-description"></span><div class="skeleton-product-footer"><span class="skeleton-line skeleton-price"></span><span class="skeleton-line skeleton-button"></span></div></div></article>',
    ).join("");
    appRoot.innerHTML = `<main id="contenido" class="skeleton-menu" aria-busy="true"><p class="skeleton-announcement" role="status">Cargando el menú…</p><section class="page-intro" aria-hidden="true"><span class="skeleton-line skeleton-eyebrow"></span><span class="skeleton-line skeleton-heading"></span><span class="skeleton-line skeleton-heading-short"></span><span class="skeleton-line skeleton-intro"></span></section><section class="section menu-list" aria-hidden="true"><div class="skeleton-filters">${filterSkeleton}</div><div class="skeleton-products">${productSkeleton}</div></section></main>`;
  }
  fetch("data.json")
    .then((r) => {
      if (!r.ok) throw new Error("data");
      return r.json();
    })
    .catch(() => saved || window.CAMILETE_DEFAULT_DATA || {})
    .then((remote) => {
      const data = saved || remote,
        app = document.querySelector("#app");
      const file = location.pathname.split("/").pop() || "index.html",
        page = file.replace(".html", "");
      const nav = [
        ["Inicio", "index.html"],
        ["Menú", `menu.html${tableQuery}`],
        ["Nosotros", "nosotros.html"],
        ["Ubicación", "ubicacion.html"],
        ["Contacto", "contacto.html"],
      ];
      const legal = [
        ["Privacidad", "politicas-privacidad.html"],
        ["Datos personales", "politicas-datos.html"],
        ["Términos", "terminos-condiciones.html"],
        ["Devoluciones", "devoluciones-reembolsos.html"],
        ["Aviso legal", "aviso-legal.html"],
      ];
      const e = data.empresa || {};
      const socialNetworks = [
        [
          "facebook",
          "Facebook",
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8z"/></svg>',
        ],
        [
          "instagram",
          "Instagram",
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.8" r="1.2" fill="currentColor"/></svg>',
        ],
        [
          "tiktok",
          "TikTok",
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.6 8.2a7 7 0 0 1-4.2-1.4v8.1a6.1 6.1 0 1 1-5.3-6.1v3.3a2.8 2.8 0 1 0 2 2.7V2.5h3.3a4 4 0 0 0 4.2 3.7z"/></svg>',
        ],
        [
          "youtube",
          "YouTube",
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6z"/></svg>',
        ],
      ];
      const socialLinks = socialNetworks
        .map(([key, label, icon]) => {
          const profile = String(e.redesSociales?.[key] || "").trim();
          if (!profile) return "";
          let url;
          try {
            url = new URL(profile);
          } catch {
            return "";
          }
          if (!["http:", "https:"].includes(url.protocol)) return "";
          return `<a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer" aria-label="${label} de ${esc(e.nombre || "CAMILETE")}" title="${label}">${icon}</a>`;
        })
        .join("");
      const cfg = data.configuracion || {},
        categories = data.categorias || [],
        products = data.menu || [];
      const deliverySettings = cfg.domicilios || {},
        deliveryZones = deliverySettings.zonas || [
          { id: "norte", nombre: "NORTE", recargo: null },
          { id: "sur", nombre: "SUR", recargo: null },
          { id: "oriente", nombre: "ORIENTE", recargo: null },
          { id: "occidente", nombre: "OCCIDENTE", recargo: null },
        ];
      const savedFulfillment = readStorage("camilete-fulfillment", {
        method: "",
        zone: "",
        address: "",
      });
      const selectedFulfillment = {
        method: tableId
          ? "table"
          : ["delivery", "pickup"].includes(savedFulfillment?.method)
            ? savedFulfillment.method
            : "",
        zone: savedFulfillment?.zone || "",
        address: savedFulfillment?.address || "",
      };
      const fulfillmentOptions = tableId
        ? `<div class="table-order-notice" role="status" aria-live="polite"><span class="table-order-icon" aria-hidden="true">⌂</span><span><strong>Ordenando desde la Mesa ${esc(tableId)}</strong><small>El pedido se enviará directamente a esta mesa.</small></span><input type="radio" name="fulfillment" value="table" checked disabled aria-label="Pedido desde la Mesa ${esc(tableId)}"></div>`
        : `<fieldset class="fulfillment-options"><legend>¿Cómo quieres recibir tu pedido?</legend><label class="fulfillment-choice"><input type="radio" name="fulfillment" value="delivery" ${selectedFulfillment.method === "delivery" ? "checked" : ""}><span><strong>Domicilio</strong><small>Elige la zona para calcular el recargo tentativo.</small></span></label><label class="fulfillment-choice"><input type="radio" name="fulfillment" value="pickup" ${selectedFulfillment.method === "pickup" ? "checked" : ""}><span><strong>Pasar a recoger</strong><small>Recoge el pedido en nuestra sede.</small></span></label></fieldset>`;
      document.documentElement.style.setProperty(
        "--font-base",
        cfg.fuenteBase || "Arial,sans-serif",
      );
      function applyTheme(theme) {
        const colors =
          (cfg.colores || {})[
            theme === "oscuro" ? "modoOscuro" : "modoClaro"
          ] || {};
        document.documentElement.dataset.theme = theme;
        Object.entries(colors).forEach(([k, v]) => {
          document.documentElement.style.setProperty(
            "--" + k.replace(/[A-Z]/g, (x) => "-" + x.toLowerCase()),
            v,
          );
          document.documentElement.style.setProperty("--" + k, v);
        });
        try {
          localStorage.setItem("camilete-theme", theme);
        } catch {}
      }
      const theme =
        (() => {
          try {
            return localStorage.getItem("camilete-theme");
          } catch {
            return null;
          }
        })() ||
        cfg.temaPredeterminado ||
        "claro";
      applyTheme(theme);
      const wa = (e.whatsapp || "").replace(/\D/g, "");
      const waLink = wa
        ? `https://wa.me/${wa}`
        : "https://wa.me/?text=" +
          encodeURIComponent("Hola CAMILETE, quiero conocer el menú.");
      const cart = () => {
        const stored = readStorage("camilete-cart", []);
        return (Array.isArray(stored) ? stored : []).map((item, index) => ({
          ...item,
          lineId: item.lineId || `${item.id}-${index}`,
          id: Number(item.id),
          qty: Math.max(1, Number(item.qty) || 1),
          preferences: {
            sauces: item.preferences?.sauces !== false,
            onion: item.preferences?.onion !== false,
          },
          extras: Array.isArray(item.extras) ? item.extras.map(Number) : [],
          instructions: item.instructions || "",
          recipient: item.recipient || "",
          observations: item.observations || "",
        }));
      };
      const additions = products.filter((p) => p.categoriaId === 6);
      const allowsExtras = (product) =>
        product && [1, 2, 3, 4, 5].includes(Number(product.categoriaId));
      const addProduct = (id, button) => {
        const items = cart(),
          productId = Number(id),
          entry = items.find(
            (i) =>
              i.id === productId &&
              i.preferences.sauces &&
              i.preferences.onion &&
              !i.extras.length &&
              !i.instructions &&
              !i.recipient &&
              !i.observations,
          );
        if (entry) entry.qty++;
        else
          items.push({
            lineId: `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            id: productId,
            qty: 1,
            preferences: { sauces: true, onion: true },
            extras: [],
            instructions: "",
            recipient: "",
            observations: "",
          });
        writeStorage("camilete-cart", items);
        updateCartCount();
        const product = products.find((p) => p.id === productId);
        showCartToast(`${product?.nombre || "Producto"} se agregó al carrito.`);
        if (button) {
          button.textContent = "✓ Agregado al carrito";
          setTimeout(() => {
            if (button.isConnected)
              button.textContent = "＋ Agregar al carrito";
          }, 1500);
        }
      };
      const productCard = (p) => {
        const imagen = p.imagen && p.imagen.trim()
          ? `<img src="${esc(p.imagen.trim())}" alt="${esc(p.nombre)}" loading="lazy">`
          : "";
          return `
        <article class="product-card ${imagen ? "has-image" : "no-image"}"> ${imagen}
              <div class="product-info">
                <span class="eyebrow">${esc(categories.find((c) => c.id === p.categoriaId)?.nombre || "Favoritos")}</span>
                <h3>${esc(p.nombre)}</h3>
                <p>${esc(p.descripcion)}</p>
                <div class="product-bottom">
                  <strong>${money(p.precio)}</strong>
                  <button type="button" class="button small add-to-cart" data-add="${esc(p.id)}" ${p.disponible === false ? "disabled" : ""}>
                    ${p.disponible === false ? "Agotado" : "＋ Agregar al carrito"  }
                  </button>
                </div>
              </div>
            </article>
          `;
      };

      const header = `<a class="skip-link" href="#contenido">Saltar al contenido principal</a><header class="site-header"><div class="nav-wrap"><a class="brand" href="index.html"><img class="brand-mark" src="assets/icons/logogpt-2.png" alt="Logo de ${esc(e.nombre || "CAMILETE")}"><span>${esc(e.nombre || "CAMILETE")}<small>COMIDA CON ANTOJO</small></span></a><nav id="primary-navigation" aria-label="Navegación principal">${nav.map(([n, u]) => `<a href="${u}" ${file === u ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</nav><div class="header-actions"><button class="icon-button" id="theme-toggle" aria-label="${theme === "claro" ? "Activar modo oscuro" : "Activar modo claro"}"><img src="assets/icons/${theme === "claro" ? "theme-moon" : "theme-sun"}.png" alt="" aria-hidden="true"></button><a class="cart-link" href="carrito.html${tableQuery}" aria-label="Carrito, ${cart().reduce((a, i) => a + i.qty, 0)} artículos"><img src="assets/icons/cart.png" alt="" aria-hidden="true"><span id="cart-count">${cart().reduce((a, i) => a + i.qty, 0)}</span></a><a class="button header-cta" href="menu.html${tableQuery}">Pedir ahora <span>↗</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="primary-navigation" aria-label="Abrir menú"><span></span><span></span><span></span></button></div></div></header>`;
      const footer = `<footer class="site-footer"><div class="footer-main"><div><a class="brand footer-brand" href="index.html"><img class="brand-mark" src="assets/icons/logogpt-2.png" alt="Logo de ${esc(e.nombre || "CAMILETE")}"><span>${esc(e.nombre || "CAMILETE")}<small>SABOR PARA COMPARTIR</small></span></a><p>${esc(e.descripcionCorta || "Comida rápida deliciosa en Piedecuesta.")}</p></div><div><h3>Encuéntranos</h3><p>${esc(e.direccion || e.ciudad || "Piedecuesta, Santander")}</p><p>${esc(e.horarioAtencion || "Lunes a Domingo · 5:00 p. m. a 11:55 p. m.")}</p><a href="${esc(waLink)}" target="_blank" rel="noopener">WhatsApp ↗</a></div><div><h3>Explora</h3>${nav.map(([n, u]) => `<a href="${u}">${n}</a>`).join("")}</div><div><h3>Información legal</h3>${legal.map(([n, u]) => `<a href="${u}">${n}</a>`).join("")}</div></div><div class="footer-bottom"><span>${esc(data.piePagina?.textoDerechos || "© 2026 CAMILETE")}</span><span>${esc(e.razonSocial || e.nombre || "CAMILETE")} ${e.nit ? `· NIT ${esc(e.nit)}` : ""} · ${esc(e.direccion || "Piedecuesta, Colombia")}</span><a href="admin/">Administración</a></div><div class="developer-credit"><span class="developer-credit-label">Diseño y desarrollo</span><span class="developer-credit-name">Marbin Alarcón</span><a href="tel:+573205578471" aria-label="Llamar a Marbin Alarcón al 320 557 8471">320 557 8471 <span aria-hidden="true">↗</span></a></div></footer><a class="whatsapp-float" href="${esc(waLink)}" target="_blank" rel="noopener" aria-label="Pedir por WhatsApp"><img src="assets/icons/whatsapp.png" alt="" aria-hidden="true"></a><button id="access-toggle" class="access-toggle" aria-label="Abrir opciones de accesibilidad"><img src="assets/icons/accessibility.png" alt="" aria-hidden="true"></button><aside id="access-panel" class="access-panel" aria-label="Accesibilidad" hidden><h2>Accesibilidad</h2><button data-access="larger">Aumentar texto</button><button data-access="smaller">Reducir texto</button><button data-access="contrast">Alto contraste</button><button data-access="links">Resaltar enlaces</button><button data-access="read">Leer página</button><button data-access="reset">Restaurar ajustes</button></aside><div id="cart-toast" class="cart-toast" role="status" aria-live="polite" aria-atomic="true"></div>`;
      const productsSection = (items, filters = false) =>
        `${filters ? `<div class="filters" role="group" aria-label="Filtrar productos por categoría"><button type="button" class="filter-chip active" data-category="all" aria-pressed="true"><span class="filter-chip-image"><img src="assets/images/category-menu.svg" alt="" aria-hidden="true" loading="lazy"></span><span class="filter-chip-name">Todo el menú</span></button>${categories.map((c) => `<button type="button" class="filter-chip" data-category="${esc(c.id)}" aria-pressed="false"><span class="filter-chip-image"><img src="${esc(c.imagen || "assets/images/logo-cami.webp")}" alt="" aria-hidden="true" loading="lazy"></span><span class="filter-chip-name">${esc(c.nombre)}</span></button>`).join("")}</div>` : ""}<div class="product-grid">${items.map(productCard).join("") || '<p class="empty-state">Pronto tendremos novedades en el menú.</p>'}</div>`;
      const home = `<section class="section promos-section" aria-labelledby="promos-title"><div class="section-heading"><div><span class="eyebrow">OFERTAS ESPECIALES</span><h2 id="promos-title">Promos.</h2></div></div><a class="promos-card" href="menu.html${tableQuery}" aria-label="Ver promociones y pedir granizadas"><img src="assets/images/promo-granizadas.jpeg" alt="Promoción de granizadas de CAMILETE" width="1215" height="1600" loading="lazy"></a></section><section class="section featured-section"><div class="section-heading"><div><span class="eyebrow">HECHOS PARA DISFRUTAR</span><h2>Los que siempre <em>provocan.</em></h2></div><a class="text-link" href="menu.html">Ver todo el menú <span>↗</span></a></div>${productsSection(products.filter((p) => p.destacado).slice(0, 3))}</section><section class="menu-banner">
  <div class="banner-copy">
    <span class="eyebrow">TU PRÓXIMO FAVORITO TE ESPERA</span>
    <h2>¿Antojo? Nosotros<br><em>nos encargamos.</em></h2>
    <ul class="banner-perks">
      <li>Hecho al momento</li>
      <li>Domicilio en Piedecuesta</li>
      <li>Pide por WhatsApp</li>
    </ul>
    <a class="button button-light" href="menu.html">Explorar menú <span>↗</span></a>
  </div>
  <div class="banner-illustration">
    <img src="assets/images/fries.svg" alt="Papas crocantes CAMILETE" loading="lazy">
  </div>
  <span class="banner-scribble" aria-hidden="true">rico<br>rico<br>rico</span>
</section><section class="section about-strip"><span class="eyebrow">SOMOS CAMILETE</span><h2>Comida con sabor.<br><em>Momentos para recordar.</em></h2><p>${esc(e.descripcionLarga || e.descripcionCorta || "Sabor local, ingredientes frescos y muchas ganas de verte sonreír.")}</p><a class="text-link" href="nosotros.html">Conoce nuestra historia <span>↗</span></a></section>`;
      const pageViews = {
        menu: `<main id="contenido"><section class="page-intro"><span class="eyebrow">TODO LO BUENO, EN UN SOLO LUGAR</span><h1>El menú que tenías en mente.</em></h1><p>Elige tu antojo. Nosotros lo preparamos con todo el sabor.</p></section><section class="section menu-list">${productsSection(
          products.filter((p) => p.disponible !== false),
          true,
        )}</section></main>`,
        nosotros: `<main id="contenido" class="history-page"><section class="page-intro history-intro"><span class="eyebrow">UNA HISTORIA CON MUCHO SABOR</span><h1>Todo comenzó<br><em>con una ilusión.</em></h1><p>Desde 2006, CAMILETE ha crecido junto a Piedecuesta, preparando comida rápida con esfuerzo, cercanía y mucho cariño.</p></section><section class="section history-section"><div class="history-year" aria-label="Nuestra historia desde 2006"><span>DESDE</span><strong>2006</strong><div class="history-year-ring" aria-hidden="true"></div></div><article class="history-story"><span class="eyebrow">NUESTRA HISTORIA</span><h2>Un sueño hecho<br><em>con sabor.</em></h2><div class="history-lead"><span>“</span><p>Todo comenzó en 2006, con un sueño, muchas ganas de salir adelante y una gran pasión por la comida.</p></div><div class="history-copy"><p>CAMILETE nació como una propuesta gastronómica en el mundo de las comidas rápidas. Pero nuestra historia comenzó mucho antes de abrir las puertas de nuestro primer restaurante.</p><p>Nuestros primeros pasos estuvieron detrás de un servicio de mensajería, trabajando en restaurantes reconocidos como <strong>JIMMY</strong> y <strong>MANOLETE</strong>. Fue precisamente en MANOLETE donde recibimos ese impulso y motivación que nos animó a dar el gran paso: crear nuestro propio restaurante.</p><p>Así comenzó esta aventura. Con esfuerzo, dedicación y el deseo de ofrecer algo rico, hemos recorrido diferentes sectores de Piedecuesta, construyendo poco a poco nuestra historia y ganándonos un lugar en el corazón de nuestros clientes.</p><p>Hoy continuamos nuestra trayectoria en el <strong>barrio San Antonio de Piedecuesta</strong>, con la misma ilusión de aquellos primeros días y el compromiso de preparar comidas rápidas que provoquen volver.</p><p>Han pasado los años, hemos aprendido, crecido y evolucionado, pero hay algo que nunca ha cambiado: nuestras ganas de ofrecer comida deliciosa y atender a nuestros clientes con cercanía y cariño.</p></div></article></section><section class="section history-purpose"><article class="purpose-card purpose-mission"><div class="purpose-number">01</div><span class="eyebrow">NUESTRA MISIÓN</span><h2>Servir con sabor,<br><em>atender con cariño.</em></h2><p>${esc(e.mision || "En CAMILETE tenemos como misión ofrecer experiencias deliciosas a través de comidas rápidas preparadas con dedicación, calidad y buen sabor, brindando a nuestros clientes una atención cercana, amable y oportuna. Trabajamos cada día con pasión y compromiso para satisfacer los antojos de nuestros clientes, manteniendo nuestra esencia, mejorando continuamente y construyendo relaciones de confianza con las familias y la comunidad de Piedecuesta.")}</p></article><article class="purpose-card purpose-vision"><div class="purpose-number">02</div><span class="eyebrow">NUESTRA VISIÓN</span><h2>Crecer sin perder<br><em>nuestra esencia.</em></h2><p>${esc(e.vision || "Para el año 2030, CAMILETE busca consolidarse como uno de los restaurantes de comidas rápidas más reconocidos y queridos de Piedecuesta, siendo referente por el sabor de sus productos, la calidad de su servicio y la confianza de sus clientes. Queremos seguir creciendo, innovando en nuestro menú y mejorando nuestros procesos, sin perder la esencia que nos ha acompañado desde 2006: el trabajo honesto, la dedicación y el compromiso de ofrecer comida rica a quienes nos eligen.")}</p></article></section><section class="section history-motto"><div><span class="eyebrow">NUESTRO LEMA</span><blockquote>«No somos los mejores,<br><em>pero la comida es muy rica».</em></blockquote></div><p>Lo decimos con orgullo, porque en CAMILETE creemos que no hacen falta grandes palabras cuando el sabor habla por nosotros.</p></section><section class="section history-thanks"><div class="history-thanks-mark" aria-hidden="true">2006</div><div><span class="eyebrow">GRACIAS POR ESTAR AQUÍ</span><h2>Seguimos siendo parte<br><em>de tus momentos.</em></h2><p>Gracias por acompañarnos desde 2006 y por permitirnos seguir siendo parte de sus momentos, sus antojos y sus historias.</p><a class="button" href="menu.html${tableQuery}">Descubre nuestros sabores <span>↗</span></a></div></section></main>`,
        ubicacion: `<main id="contenido" class="location-page"><section class="page-intro location-intro"><span class="eyebrow">NOS VEMOS PRONTO</span><h1>Ven por tu antojo<br><em>favorito.</em></h1><p>Estamos en Piedecuesta, con el sabor que te provoca volver.</p></section><section class="section location-layout"><article class="location-card"><div class="location-card-head"><span class="eyebrow">ENCUÉNTRANOS</span><span class="location-status"><i aria-hidden="true"></i> Te esperamos</span></div><h2>${esc(e.nombre || "CAMILETE")}</h2><div class="location-details"><div class="location-detail"><span class="location-detail-label">Dirección</span><p>${esc(e.direccion || "Piedecuesta, Santander")}</p></div><div class="location-detail"><span class="location-detail-label">Horario</span><p>${esc(e.horarioAtencion || "Lunes a Domingo · 5:00 p. m. a 11:55 p. m.")}</p></div><div class="location-detail"><span class="location-detail-label">Contacto</span><p>${e.telefono ? esc(e.telefono) : "Escríbenos para consultar disponibilidad"}</p></div></div><div class="location-actions"><a class="button" href="${esc(e.enlaceMapa || "https://maps.google.com/?q=Piedecuesta,Colombia")}" target="_blank" rel="noopener noreferrer">Cómo llegar <span aria-hidden="true">↗</span></a><a class="location-whatsapp text-link" href="${esc(waLink)}" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp <span aria-hidden="true">↗</span></a></div></article><div class="location-map-wrap"><div class="location-map-label"><span>CAMILETE</span><strong>${esc(e.ciudad || "Piedecuesta")}</strong></div><iframe class="location-map" title="Ubicación de CAMILETE en ${esc(e.ciudad || "Piedecuesta")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="https://maps.google.com/maps?q=${encodeURIComponent(e.direccion || "Piedecuesta, Colombia")}&z=16&output=embed"></iframe></div></section><section class="section location-visit"><span class="eyebrow">TU ANTOJO NOS ESPERA</span><h2>Una comida rica.<br><em>Una visita cercana.</em></h2><a class="button" href="menu.html${tableQuery}">Ver el menú <span aria-hidden="true">↗</span></a></section></main>`,
        contacto: `<main id="contenido" class="contact-page"><section class="page-intro contact-intro"><span class="eyebrow">ESTAMOS PARA TI</span><h1>Hablemos de<br><em>antojos.</em></h1><p>¿Quieres hacer un pedido, resolver una duda o simplemente saludarnos? Elige el canal que prefieras.</p></section><section class="section contact-layout"><article class="contact-feature"><div class="contact-feature-mark" aria-hidden="true"><span>¡</span><strong>Hola!</strong></div><div class="contact-feature-copy"><span class="eyebrow">ATENCIÓN INMEDIATA</span><h2>Conversemos por<br><em>WhatsApp.</em></h2><p>Atención cercana, rápida y sin formularios. Cuéntanos lo que necesitas y te ayudamos.</p><a class="button" href="${esc(waLink)}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp <span aria-hidden="true">↗</span></a></div></article><div class="contact-grid"><a class="contact-card" href="tel:${esc(String(e.whatsapp || e.telefono || "").replace(/\D/g, ""))}" aria-label="Llamar a CAMILETE"><span class="contact-card-icon" aria-hidden="true">☎</span><div><span class="eyebrow">LLÁMANOS</span><h2>Teléfono</h2><p>${esc(e.telefono || "Consulta nuestros canales de atención")}</p></div><span class="contact-arrow" aria-hidden="true">↗</span></a><a class="contact-card" href="${esc(e.enlaceMapa || "https://maps.google.com/?q=Piedecuesta,Colombia")}" target="_blank" rel="noopener noreferrer" aria-label="Ver ubicación de CAMILETE"><span class="contact-card-icon" aria-hidden="true">⌖</span><div><span class="eyebrow">VISÍTANOS</span><h2>Ubicación</h2><p>${esc(e.direccion || "Piedecuesta, Santander")}</p></div><span class="contact-arrow" aria-hidden="true">↗</span></a>${e.correo ? `<a class="contact-card" href="mailto:${esc(e.correo)}" aria-label="Enviar correo a CAMILETE"><span class="contact-card-icon" aria-hidden="true">@</span><div><span class="eyebrow">ESCRÍBENOS</span><h2>Correo</h2><p>${esc(e.correo)}</p></div><span class="contact-arrow" aria-hidden="true">↗</span></a>` : ""}<div class="contact-card contact-card-static"><span class="contact-card-icon" aria-hidden="true">◷</span><div><span class="eyebrow">HORARIO</span><h2>Estamos atentos</h2><p>${esc(e.horarioAtencion || "Lunes a Domingo · 5:00 p. m. a 11:55 p. m.")}</p></div></div></div></section><section class="section contact-social"><div><span class="eyebrow">SÍGUENOS</span><h2>También estamos<br><em>en redes.</em></h2></div>${socialLinks ? `<div class="contact-social-links social-links" aria-label="Redes sociales de CAMILETE">${socialLinks}</div>` : `<p>Próximamente encontrarás aquí nuestras redes sociales.</p>`}</section></main>`,
        carrito: `<main id="contenido"><section class="page-intro"><span class="eyebrow">UN BUEN ANTOJO VA EN CAMINO</span><h1>Tu <em>pedido.</em></h1></section><section class="section cart-section"><div id="cart-items"></div>${fulfillmentOptions}<div id="delivery-fields" ${selectedFulfillment.method === "delivery" ? "" : "hidden"}><label class="field-label" for="delivery-zone">Zona de entrega</label><select id="delivery-zone" class="text-input"><option value="">Selecciona tu zona</option>${deliveryZones.map((zone) => `<option value="${esc(zone.id)}" ${selectedFulfillment.zone === zone.id ? "selected" : ""}>${esc(zone.nombre)}${zone.recargo != null ? ` · ${money(zone.recargo)} aprox.` : " · tarifa por confirmar"}</option>`).join("")}</select><label class="field-label" for="delivery-address">Dirección de entrega</label><input id="delivery-address" class="text-input" value="${esc(selectedFulfillment.address || "")}" placeholder="Escribe tu dirección"><p class="delivery-note">${esc(deliverySettings.nota || "El recargo es tentativo y se confirma al tomar el pedido.")}</p></div><div id="pickup-info" class="pickup-info" ${selectedFulfillment.method === "pickup" ? "" : "hidden"}><strong>Recoger en la sede</strong><span>${esc(e.direccion || "Consulta la dirección de la sede")}</span></div>${(e.mediosPago || []).length ? `<p class="payment-note"><strong>Medios de pago:</strong> ${e.mediosPago.map(esc).join(" · ")}</p>` : ""}<div class="cart-totals"><div><span>Subtotal</span><strong id="cart-subtotal">$0</strong></div><div id="delivery-fee-row" hidden><span>Recargo domicilio (tentativo)</span><strong id="delivery-fee">—</strong></div><div class="cart-total"><span>Total</span><strong id="cart-total">$0</strong></div><p id="total-note" class="delivery-note" hidden></p></div><button id="send-order" class="button">Continuar por WhatsApp ↗</button><a class="text-link" href="menu.html${tableQuery}">Seguir mirando el menú</a></section></main>`,
        error: `<main id="contenido" class="error-page"><section class="error-card"><div class="error-art" aria-hidden="true"><div class="error-sun"></div><img src="assets/images/fries.svg" alt=""><span class="error-number">404</span><span class="error-stamp">ANTOJO<br>PERDIDO</span></div><div class="error-copy"><span class="eyebrow">ERROR 404 · PÁGINA NO ENCONTRADA</span><h1>Este antojo<br><em>se perdió.</em></h1><p>No encontramos esta página. Pero todavía puedes encontrar algo rico en el menú.</p><div class="error-actions"><a class="button" href="menu.html">Ver el menú <span>↗</span></a><a class="text-link" href="index.html">Volver al inicio</a></div></div></section></main>`,
      };
      const legalInfo = {
        "politicas-privacidad": [
          "Política de privacidad",
          "El responsable del tratamiento es " +
            (e.razonSocial || e.nombre || "CAMILETE") +
            (e.nit ? ", NIT " + e.nit : "") +
            ". Tratamos los datos que nos compartes al realizar pedidos o contactarnos para gestionar tu solicitud, coordinar entregas y atender consultas. Utilizamos tecnologías de almacenamiento local y cookies técnicas estrictamente necesarias para el funcionamiento de la plataforma y la gestión administrativa. Puedes conocer, actualizar o rectificar tus datos, solicitar prueba de autorización, pedir información sobre su uso y presentar consultas o reclamos a través de " +
            (e.correo || "nuestros canales de atención") +
            ". Aplicamos medidas razonables de seguridad y conservamos la información durante el tiempo necesario para atender la finalidad y las obligaciones legales. El tratamiento se rige por la Ley 1581 de 2012 y el Decreto 1074 de 2015. Completa y verifica estos datos de acuerdo con las operaciones reales del negocio antes de publicar.",
        ],
        "politicas-datos": [
          "Política de tratamiento de datos personales",
          "CAMILETE, " +
            (e.direccion || "Piedecuesta, Colombia") +
            ", es responsable del tratamiento de datos personales. Conforme a la Ley 1581 de 2012 y el Decreto 1074 de 2015, puedes conocer, actualizar y rectificar tus datos; solicitar prueba de autorización; ser informado sobre su uso; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización o solicitar supresión cuando proceda; y acceder gratuitamente a tus datos. Envía consultas o reclamos a " +
            (e.correo || "nuestro canal de contacto") +
            ". Los reclamos deben identificar al titular, describir los hechos y señalar un canal de respuesta. Las consultas se atenderán en un término máximo de diez (10) días hábiles y los reclamos en un plazo de quince (15) días hábiles. No compartimos información salvo autorización o deber legal.",
        ],
        "terminos-condiciones": [
          "Términos y condiciones",
          "Este sitio presenta información de CAMILETE y permite consultar productos y preparar solicitudes de pedido. La disponibilidad, precios, ingredientes y tiempos se confirman al aceptar el pedido por WhatsApp; las fotografías son ilustrativas y los productos pueden variar. El usuario se compromete a proporcionar información correcta y usar el sitio lícitamente. Los pagos y entregas de los pedidos se coordinan y aceptan directamente a través de nuestros canales oficiales (WhatsApp). Los contenidos y signos distintivos pertenecen a sus titulares. La relación de consumo se rige por la legislación colombiana, incluida la Ley 1480 de 2011; el comercio electrónico, cuando aplique, por la Ley 1341 de 2009 y normas vigentes. Para consultas contacta a " +
            (e.correo || "CAMILETE") +
            ".",
        ],
        "devoluciones-reembolsos": [
          "Devoluciones y reembolsos",
          "Si recibes un pedido equivocado, incompleto o con un problema de calidad, comunícate cuanto antes por WhatsApp o al canal de atención " +
            (e.correo || "de CAMILETE") +
            ", e indica el número de pedido y el inconveniente. Revisaremos el caso y ofreceremos una solución conforme a la Ley 1480 de 2011. Por la naturaleza de alimentos preparados, no se aceptan devoluciones por cambio de opinión una vez preparados o entregados, sin perjuicio de los derechos irrenunciables del consumidor y de las garantías legales aplicables. Los reembolsos aprobados se tramitarán por un medio acordado con el cliente.",
        ],
        "aviso-legal": [
          "Aviso legal",
          (e.razonSocial || e.nombre || "CAMILETE") +
            (e.nit ? ", NIT " + e.nit : "") +
            ". Domicilio: " +
            (e.direccion || "Piedecuesta, Santander, Colombia") +
            ". Contacto: " +
            (e.telefono || "") +
            " " +
            (e.correo || "") +
            ". Los datos de este sitio son informativos y la oferta queda sujeta a disponibilidad y confirmación del establecimiento. Los derechos del consumidor se rigen por la Ley 1480 de 2011 y las demás normas colombianas aplicables.",
        ],
      };
      Object.entries(legalInfo).forEach(([slug, [title, body]]) => {
        if (page === slug)
          pageViews[slug] =
            `<main id="contenido"><section class="page-intro"><span class="eyebrow">INFORMACIÓN PARA CLIENTES</span><h1>${esc(title)}</h1></section><article class="legal-copy"><p>${esc(data.paginasLegales?.[{ "politicas-privacidad": "politicasPrivacidad", "politicas-datos": "politicasDatosPersonales", "terminos-condiciones": "terminosCondiciones", "devoluciones-reembolsos": "politicasDevoluciones", "aviso-legal": "avisoLegal" }[slug]] || body)}</p><p>Última actualización: octubre de 2026.</p></article></main>`;
      });
      if (page === "index") {
        app.insertAdjacentHTML("afterbegin", header);
        app.querySelector("#contenido").insertAdjacentHTML("beforeend", home);
        app.insertAdjacentHTML("beforeend", footer);
      } else {
        app.innerHTML = header + (pageViews[page] || pageViews.error) + footer;
      }
      if (socialLinks) {
        app
          .querySelector(".footer-brand")
          ?.parentElement.insertAdjacentHTML(
            "beforeend",
            `<h3 class="social-heading">Síguenos</h3><div class="social-links">${socialLinks}</div>`,
          );
      }
      if (page === "menu")
        app.insertAdjacentHTML(
          "beforeend",
          `<a class="cart-float" href="carrito.html${tableQuery}"><img src="assets/icons/cart.png" alt="" aria-hidden="true"><span id="cart-float-count">${cart().reduce((a, i) => a + i.qty, 0)}</span> · Ver mi pedido <span>↗</span></a>`,
        );
      const updateCartCount = () => {
        const count = cart().reduce((a, i) => a + i.qty, 0);
        const badge = document.querySelector("#cart-count");
        if (badge) badge.textContent = count;
        const floating = document.querySelector("#cart-float-count");
        if (floating) floating.textContent = count;
        const link = document.querySelector(".cart-link");
        if (link)
          link.setAttribute(
            "aria-label",
            `Carrito, ${count} ${count === 1 ? "producto" : "productos"}`,
          );
      };
      window.addEventListener("storage", (event) => {
        if (event.key === "camilete-cart") updateCartCount();
      });
      let toastTimer;
      function showCartToast(message) {
        const toast = document.querySelector("#cart-toast");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(
          () => toast.classList.remove("is-visible"),
          3000,
        );
      }
      document.querySelector("#theme-toggle").addEventListener("click", () => {
        const next =
          document.documentElement.dataset.theme === "claro"
            ? "oscuro"
            : "claro";
        applyTheme(next);
        const button = document.querySelector("#theme-toggle");
        button.querySelector("img").src =
          `assets/icons/${next === "claro" ? "theme-moon" : "theme-sun"}.png`;
        button.setAttribute(
          "aria-label",
          next === "claro" ? "Activar modo oscuro" : "Activar modo claro",
        );
      });
      const mt = document.querySelector(".menu-toggle");
      const primaryNav = document.querySelector("#primary-navigation");
      mt.innerHTML =
        '<span class="burger-icon" aria-hidden="true"><i class="burger-layer burger-bun-top"></i><i class="burger-layer burger-lettuce"></i><i class="burger-layer burger-cheese"></i><i class="burger-layer burger-patty"></i><i class="burger-layer burger-bun-bottom"></i></span>';
      const navOverlay = document.createElement("button");
      navOverlay.className = "mobile-nav-overlay";
      navOverlay.type = "button";
      navOverlay.tabIndex = -1;
      navOverlay.setAttribute("aria-label", "Cerrar menú");
      navOverlay.setAttribute("aria-hidden", "true");
      document.querySelector(".site-header").after(navOverlay);
      const mobileMenu = window.matchMedia("(max-width: 650px)");
      let menuOpen = false;
      let menuScrollY = 0;
      const previousBodyStyle = {};
      const setMenuOpen = (open, restoreFocus = true) => {
        if (open === menuOpen || (open && !mobileMenu.matches)) return;
        menuOpen = open;
        mt.setAttribute("aria-expanded", String(open));
        mt.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        primaryNav.classList.toggle("nav-open", open);
        navOverlay.classList.toggle("is-visible", open);
        navOverlay.setAttribute("aria-hidden", String(!open));
        document.documentElement.classList.toggle("menu-open", open);
        if (open) {
          menuScrollY = window.scrollY;
          for (const property of ["position", "top", "left", "right", "width"])
            previousBodyStyle[property] = document.body.style[property];
          Object.assign(document.body.style, {
            position: "fixed",
            top: `-${menuScrollY}px`,
            left: "0",
            right: "0",
            width: "100%",
          });
          primaryNav.inert = false;
          primaryNav.setAttribute("aria-hidden", "false");
          requestAnimationFrame(() =>
            primaryNav.querySelector("a")?.focus({ preventScroll: true }),
          );
        } else {
          for (const property of ["position", "top", "left", "right", "width"])
            document.body.style[property] = previousBodyStyle[property] || "";
          window.scrollTo(0, menuScrollY);
          if (restoreFocus && mobileMenu.matches)
            mt.focus({ preventScroll: true });
        }
      };
      primaryNav.inert = mobileMenu.matches;
      primaryNav.setAttribute("aria-hidden", String(mobileMenu.matches));
      mt.addEventListener("click", () => {
        setMenuOpen(mt.getAttribute("aria-expanded") !== "true");
      });
      navOverlay.addEventListener("click", () => setMenuOpen(false));
      primaryNav
        .querySelectorAll("a")
        .forEach((link) =>
          link.addEventListener("click", () => setMenuOpen(false)),
        );
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuOpen) setMenuOpen(false);
      });
      document.addEventListener("click", (event) => {
        if (menuOpen && !event.target.closest(".site-header"))
          setMenuOpen(false);
      });
      mobileMenu.addEventListener("change", (event) => {
        if (!event.matches) setMenuOpen(false, false);
        primaryNav.inert = event.matches;
        primaryNav.setAttribute("aria-hidden", String(event.matches));
      });
      document
        .querySelectorAll("[data-add]")
        .forEach((b) =>
          b.addEventListener("click", () => addProduct(b.dataset.add, b)),
        );
      document.querySelectorAll("[data-category]").forEach((b) =>
        b.addEventListener("click", () => {
          document.querySelectorAll("[data-category]").forEach((x) => {
            const selected = x === b;
            x.classList.toggle("active", selected);
            x.setAttribute("aria-pressed", String(selected));
          });
          b.classList.add("active");
          const cat = b.dataset.category;
          document.querySelector(".product-grid").innerHTML = products
            .filter(
              (p) =>
                p.disponible !== false &&
                (cat === "all" || String(p.categoriaId) === cat),
            )
            .map(productCard)
            .join("");
          document
            .querySelectorAll("[data-add]")
            .forEach((x) =>
              x.addEventListener("click", () => addProduct(x.dataset.add, x)),
            );
        }),
      );
      if (page === "carrito") {
        const container = document.querySelector("#cart-items");
        const getLineTotal = (item) => {
          const product = products.find((p) => p.id === item.id);
          if (!product) return 0;
          const extraCost = allowsExtras(product)
            ? item.extras.reduce(
                (sum, id) =>
                  sum + (additions.find((x) => x.id === id)?.precio || 0),
                0,
              )
            : 0;
          return (Number(product.precio) + extraCost) * item.qty;
        };
        const lineSelector = (lineId) =>
          `[data-cart-row="${CSS.escape(String(lineId))}"]`;
        const orderSubtotal = () =>
          cart()
            .filter((item) => products.some((p) => p.id === item.id))
            .reduce((sum, item) => sum + getLineTotal(item), 0);
        const selectedZone = () =>
          deliveryZones.find((zone) => zone.id === selectedFulfillment.zone);
        const selectedFee = () => {
          const zone = selectedZone();
          return selectedFulfillment.method === "delivery" &&
            zone &&
            zone.recargo !== null &&
            zone.recargo !== "" &&
            Number.isFinite(Number(zone.recargo))
            ? Number(zone.recargo)
            : null;
        };
        const updateOrderTotals = () => {
          const subtotal = orderSubtotal(),
            method = selectedFulfillment.method,
            fee = selectedFee(),
            feeRow = document.querySelector("#delivery-fee-row"),
            feeLabel = document.querySelector("#delivery-fee"),
            total = document.querySelector("#cart-total"),
            note = document.querySelector("#total-note");
          document.querySelector("#cart-subtotal").textContent =
            money(subtotal);
          feeRow.hidden = method !== "delivery";
          feeLabel.textContent =
            method !== "delivery"
              ? "—"
              : !selectedZone()
                ? "Selecciona una zona"
                : fee === null
                  ? "Por confirmar"
                  : money(fee);
          if (method === "delivery" && (!selectedZone() || fee === null)) {
            total.textContent = "Por confirmar";
            note.hidden = false;
            note.textContent = !selectedZone()
              ? "Selecciona la zona para calcular el domicilio."
              : "La tarifa de esta zona aún no está configurada; el valor final se confirma por WhatsApp.";
          } else {
            total.textContent = money(
              subtotal + (method === "delivery" ? fee || 0 : 0),
            );
            note.hidden = true;
            note.textContent = "";
          }
        };
        const syncFulfillment = () => {
          const method = selectedFulfillment.method;
          document.querySelector("#delivery-fields").hidden =
            method !== "delivery";
          document.querySelector("#pickup-info").hidden = method !== "pickup";
          document.querySelector("#delivery-zone").disabled =
            method !== "delivery";
          document.querySelector("#delivery-address").disabled =
            method !== "delivery";
          updateOrderTotals();
        };
        function paintCart() {
          const items = cart().filter((item) =>
            products.some((p) => p.id === item.id),
          );
          container.innerHTML = items.length
            ? items
                .map((item) => {
                  const product = products.find((p) => p.id === item.id);
                  const extrasPicker = allowsExtras(product)
                    ? `<details class="extras-picker"><summary>Agregar adicionales de la carta</summary><div class="extras-grid">${additions.map((extra) => `<label class="extra-option"><input type="checkbox" data-extra="${extra.id}" data-line="${esc(item.lineId)}" ${item.extras.includes(extra.id) ? "checked" : ""}><span>${esc(extra.nombre)}</span><strong>+ ${money(extra.precio)}</strong></label>`).join("")}</div><small>El adicional seleccionado se cobra por cada unidad de este producto.</small></details>`
                    : "";
                  const tableFields = tableId
                    ? `<label class="instructions-label">¿Para quién es este producto?<input class="text-input" type="text" data-recipient="true" data-line="${esc(item.lineId)}" value="${esc(item.recipient)}" placeholder="Ej.: Ana, María, Juan"></label><label class="instructions-label">Observaciones del producto<input class="text-input" type="text" data-observations="true" data-line="${esc(item.lineId)}" value="${esc(item.observations)}" placeholder="Ej.: sin cebolla, término medio"></label>`
                    : "";
                  return `<article class="cart-row" data-cart-row="${esc(item.lineId)}"><img class="cart-product-image" src="${esc(product.imagen || "assets/images/logo-cami.webp")}" alt="${esc(product.nombre)}"><div class="cart-item-main"><div class="cart-item-heading"><div><h2>${esc(product.nombre)}</h2><span>${money(product.precio)} por unidad</span></div><button type="button" class="remove-item" data-remove="${esc(item.lineId)}" aria-label="Eliminar ${esc(product.nombre)} del carrito">×</button></div><div class="cart-options"><span class="options-title">Personaliza tu producto</span><label class="choice-chip"><input type="checkbox" data-pref="sauces" data-line="${esc(item.lineId)}" ${item.preferences.sauces ? "checked" : ""}> Lleva salsas</label><label class="choice-chip"><input type="checkbox" data-pref="onion" data-line="${esc(item.lineId)}" ${item.preferences.onion ? "checked" : ""}> Lleva cebolla</label><label class="instructions-label">Otros cambios (por ejemplo: sin tomate)<input class="text-input" type="text" data-instructions="true" data-line="${esc(item.lineId)}" value="${esc(item.instructions)}" placeholder="Escribe aquí tus indicaciones"></label>${extrasPicker}${tableFields}</div><div class="cart-item-bottom"><div class="qty-control"><button type="button" data-qty="${esc(item.lineId)}" data-change="-1" aria-label="Reducir cantidad de ${esc(product.nombre)}">−</button><span>${item.qty}</span><button type="button" data-qty="${esc(item.lineId)}" data-change="1" aria-label="Aumentar cantidad de ${esc(product.nombre)}">+</button></div><strong class="line-total">${money(getLineTotal(item))}</strong></div></div></article>`;
                })
                .join("")
            : `<p class="empty-state">Tu carrito está esperando algo rico. <a href="menu.html${tableQuery}">Explora el menú.</a></p>`;
          updateOrderTotals();
          container.querySelectorAll("[data-qty]").forEach(
            (button) =>
              (button.onclick = () => {
                const items = cart(),
                  item = items.find(
                    (x) => String(x.lineId) === button.dataset.qty,
                  );
                if (!item) return;
                item.qty += Number(button.dataset.change);
                if (item.qty < 1) {
                  writeStorage(
                    "camilete-cart",
                    items.filter((x) => x !== item),
                  );
                } else writeStorage("camilete-cart", items);
                paintCart();
                updateCartCount();
              }),
          );
          container.querySelectorAll("[data-remove]").forEach(
            (button) =>
              (button.onclick = () => {
                writeStorage(
                  "camilete-cart",
                  cart().filter(
                    (x) => String(x.lineId) !== button.dataset.remove,
                  ),
                );
                paintCart();
                updateCartCount();
              }),
          );
        }
        container.addEventListener("change", (event) => {
          const target = event.target,
            lineId = target.dataset.line;
          if (!lineId) return;
          const items = cart(),
            item = items.find((x) => String(x.lineId) === lineId);
          if (!item) return;
          if (target.dataset.pref)
            item.preferences[target.dataset.pref] = target.checked;
          if (target.dataset.extra) {
            const extraId = Number(target.dataset.extra);
            item.extras = target.checked
              ? [...new Set([...item.extras, extraId])]
              : item.extras.filter((id) => id !== extraId);
          }
          if (target.dataset.instructions !== undefined)
            item.instructions = target.value;
          if (target.dataset.recipient !== undefined)
            item.recipient = target.value;
          if (target.dataset.observations !== undefined)
            item.observations = target.value;
          writeStorage("camilete-cart", items);
          paintCart();
          const selector = target.dataset.pref
            ? `[data-pref="${target.dataset.pref}"]`
            : target.dataset.extra
              ? `[data-extra="${target.dataset.extra}"]`
              : target.dataset.recipient !== undefined
                ? "[data-recipient]"
                : target.dataset.observations !== undefined
                  ? "[data-observations]"
                  : "[data-instructions]";
          container
            .querySelector(`${lineSelector(lineId)} ${selector}`)
            ?.focus({ preventScroll: true });
        });
        paintCart();
        document
          .querySelectorAll('input[name="fulfillment"]')
          .forEach((input) =>
            input.addEventListener("change", () => {
              selectedFulfillment.method = input.value;
              writeStorage("camilete-fulfillment", selectedFulfillment);
              syncFulfillment();
            }),
          );
        document
          .querySelector("#delivery-zone")
          .addEventListener("change", (event) => {
            selectedFulfillment.zone = event.target.value;
            writeStorage("camilete-fulfillment", selectedFulfillment);
            updateOrderTotals();
          });
        document
          .querySelector("#delivery-address")
          .addEventListener("change", (event) => {
            selectedFulfillment.address = event.target.value;
            writeStorage("camilete-fulfillment", selectedFulfillment);
          });
        syncFulfillment();
        document.querySelector("#send-order").onclick = () => {
          const items = cart().filter((item) =>
            products.some((p) => p.id === item.id),
          );
          if (!items.length) {
            showCartToast(
              "Agrega al menos un producto antes de enviar el pedido.",
            );
            return;
          }
          if (!selectedFulfillment.method) {
            showCartToast("Elige domicilio o pasar a recoger.");
            return;
          }
          if (selectedFulfillment.method === "delivery" && !selectedZone()) {
            showCartToast("Selecciona la zona de entrega.");
            document.querySelector("#delivery-zone").focus();
            return;
          }
          const deliveryAddress = document
            .querySelector("#delivery-address")
            .value.trim();
          if (selectedFulfillment.method === "delivery" && !deliveryAddress) {
            showCartToast("Escribe la dirección para el domicilio.");
            document.querySelector("#delivery-address").focus();
            return;
          }
          const lines = items
            .map((item) => {
              const product = products.find((p) => p.id === item.id),
                changes = [
                  item.preferences.sauces ? "con salsas" : "sin salsas",
                  item.preferences.onion ? "con cebolla" : "sin cebolla",
                  item.instructions ? `indicaciones: ${item.instructions}` : "",
                  tableId && item.recipient
                    ? `para: ${item.recipient}`
                    : "",
                  tableId && item.observations
                    ? `observaciones: ${item.observations}`
                    : "",
                  allowsExtras(product) && item.extras.length
                    ? `adicionales: ${item.extras
                        .map((id) => {
                          const extra = additions.find((x) => x.id === id);
                          return extra
                            ? `${extra.nombre} (+${money(extra.precio)})`
                            : "";
                        })
                        .filter(Boolean)
                        .join(", ")}`
                    : "",
                ]
                  .filter(Boolean)
                  .join("; ");
              return `${item.qty} x ${product.nombre} (${changes}) — ${money(getLineTotal(item))}`;
            })
            .join("\n");
          const subtotal = items.reduce(
              (sum, item) => sum + getLineTotal(item),
              0,
            ),
            fee = selectedFee(),
            total =
              selectedFulfillment.method === "delivery" && fee === null
                ? `${money(subtotal)} + domicilio por confirmar`
                : money(
                    subtotal +
                      (selectedFulfillment.method === "delivery"
                        ? fee || 0
                        : 0),
                  ),
            method =
              selectedFulfillment.method === "pickup"
                ? "Pasar a recoger en la sede"
                : "Domicilio",
            zone =
              selectedFulfillment.method === "delivery"
                ? selectedZone().nombre
                : "No aplica",
            address =
              selectedFulfillment.method === "pickup"
                ? `Recoger en ${e.direccion || "la sede CAMILETE"}`
                : deliveryAddress,
            feeText =
              selectedFulfillment.method === "pickup"
                ? "No aplica (recoge en sede)"
                : fee === null
                  ? "Por confirmar"
                  : money(fee);
          const message = tableId
            ? `¡Nuevo Pedido desde la Mesa ${tableId}!\n\n${lines}\n\nTotal: ${money(subtotal)}`
            : (
                cfg.mensajePedidoBase ||
                "¡Hola CAMILETE! Quiero este pedido:\n{items}\nMétodo: {metodo}\nZona: {zona}\nDirección: {direccion}\nDomicilio: {domicilio}\nTotal: {total}"
              )
                .replace("{items}", lines)
                .replace("{metodo}", method)
                .replace("{zona}", zone)
                .replace("{direccion}", address)
                .replace("{domicilio}", feeText)
                .replace("{total}", total);
          window.open(
            `https://wa.me/${wa}?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener",
          );
        };
      }
      const access = readStorage("camilete-access", {
        scale: 1,
        contrast: false,
        links: false,
      });
      function saveAccess() {
        writeStorage("camilete-access", access);
        document.documentElement.style.setProperty(
          "--access-scale",
          access.scale,
        );
        document.documentElement.classList.toggle(
          "high-contrast",
          access.contrast,
        );
        document.documentElement.classList.toggle(
          "highlight-links",
          access.links,
        );
      }
      saveAccess();
      document.querySelector("#access-toggle").onclick = () => {
        const p = document.querySelector("#access-panel");
        p.hidden = !p.hidden;
      };
      document.querySelectorAll("[data-access]").forEach(
        (b) =>
          (b.onclick = () => {
            switch (b.dataset.access) {
              case "larger":
                access.scale = Math.min(1.5, access.scale * 1.2);
                break;
              case "smaller":
                access.scale = Math.max(0.7, access.scale / 1.2);
                break;
              case "contrast":
                access.contrast = !access.contrast;
                break;
              case "links":
                access.links = !access.links;
                break;
              case "read":
                if (speechSynthesis.speaking) speechSynthesis.cancel();
                else
                  speechSynthesis.speak(
                    new SpeechSynthesisUtterance(
                      document.querySelector("#contenido").innerText,
                    ),
                  );
                break;
              case "reset":
                access.scale = 1;
                access.contrast = false;
                access.links = false;
                speechSynthesis.cancel();
            }
            saveAccess();
          }),
      );
    });
})();
