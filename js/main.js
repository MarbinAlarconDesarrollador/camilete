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
        ["Menú", "menu.html"],
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
      const e = data.empresa || {},
        cfg = data.configuracion || {},
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
        method: ["delivery", "pickup"].includes(savedFulfillment?.method)
          ? savedFulfillment.method
          : "",
        zone: savedFulfillment?.zone || "",
        address: savedFulfillment?.address || "",
      };
      document.documentElement.style.setProperty(
        "--font-base",
        cfg.fuenteBase || "Arial,sans-serif",
      );
      function applyTheme(theme) {
        const colors = (cfg.colores || {})[theme] || {};
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
        }));
      };
      const additions = products.filter((p) => p.categoriaId === 5);
      const addProduct = (id, button) => {
        const items = cart(),
          productId = Number(id),
          entry = items.find(
            (i) =>
              i.id === productId &&
              i.preferences.sauces &&
              i.preferences.onion &&
              !i.extras.length &&
              !i.instructions,
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
      const productCard = (p) =>
        `<article class="product-card"><img src="${esc(p.imagen || "assets/images/burger.svg")}" alt="${esc(p.nombre)}" loading="lazy"><div class="product-info"><span class="eyebrow">${esc(categories.find((c) => c.id === p.categoriaId)?.nombre || "Favoritos")}</span><h3>${esc(p.nombre)}</h3><p>${esc(p.descripcion)}</p><div class="product-bottom"><strong>${money(p.precio)}</strong><button type="button" class="button small add-to-cart" data-add="${esc(p.id)}" ${p.disponible === false ? "disabled" : ""}>${p.disponible === false ? "Agotado" : "＋ Agregar al carrito"}</button></div></div></article>`;
      const header = `<a class="skip-link" href="#contenido">Saltar al contenido principal</a><header class="site-header"><div class="nav-wrap"><a class="brand" href="index.html"><span class="brand-mark">C</span><span>${esc(e.nombre || "CAMILETE")}<small>COMIDA CON ANTOJO</small></span></a><nav id="primary-navigation" aria-label="Navegación principal">${nav.map(([n, u]) => `<a href="${u}" ${file === u ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</nav><div class="header-actions"><button class="icon-button" id="theme-toggle" aria-label="Cambiar tema">${theme === "claro" ? "☾" : "☀"}</button><a class="cart-link" href="carrito.html" aria-label="Carrito, ${cart().reduce((a, i) => a + i.qty, 0)} artículos">🛒 <span id="cart-count">${cart().reduce((a, i) => a + i.qty, 0)}</span></a><a class="button header-cta" href="menu.html">Pedir ahora <span>↗</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="primary-navigation" aria-label="Abrir menú"><span></span><span></span><span></span></button></div></div></header>`;
      const footer = `<footer class="site-footer"><div class="footer-main"><div><a class="brand footer-brand" href="index.html"><span class="brand-mark">C</span><span>${esc(e.nombre || "CAMILETE")}<small>SABOR PARA COMPARTIR</small></span></a><p>${esc(e.descripcionCorta || "Comida rápida deliciosa en Piedecuesta.")}</p></div><div><h3>Encuéntranos</h3><p>${esc(e.direccion || e.ciudad || "Piedecuesta, Santander")}</p><p>${esc(e.horarioAtencion || "Consulta nuestros horarios")}</p><a href="${esc(waLink)}" target="_blank" rel="noopener">WhatsApp ↗</a></div><div><h3>Explora</h3>${nav.map(([n, u]) => `<a href="${u}">${n}</a>`).join("")}</div><div><h3>Información legal</h3>${legal.map(([n, u]) => `<a href="${u}">${n}</a>`).join("")}</div></div><div class="footer-bottom"><span>${esc(data.piePagina?.textoDerechos || "© 2026 CAMILETE")}</span><span>${esc(e.razonSocial || e.nombre || "CAMILETE")} ${e.nit ? `· NIT ${esc(e.nit)}` : ""} · ${esc(e.direccion || "Piedecuesta, Colombia")}</span><a href="admin/">Administración</a></div><div class="developer-credit"><span class="developer-credit-label">Diseño y desarrollo</span><span class="developer-credit-name">Marbin Alarcón</span><a href="tel:+573205578471" aria-label="Llamar a Marbin Alarcón al 320 557 8471">320 557 8471 <span aria-hidden="true">↗</span></a></div></footer><a class="whatsapp-float" href="${esc(waLink)}" target="_blank" rel="noopener" aria-label="Pedir por WhatsApp">☏</a><button id="access-toggle" class="access-toggle" aria-label="Abrir opciones de accesibilidad">♿</button><aside id="access-panel" class="access-panel" aria-label="Accesibilidad" hidden><h2>Accesibilidad</h2><button data-access="larger">Aumentar texto</button><button data-access="smaller">Reducir texto</button><button data-access="contrast">Alto contraste</button><button data-access="links">Resaltar enlaces</button><button data-access="read">Leer página</button><button data-access="reset">Restaurar ajustes</button></aside><div id="cart-toast" class="cart-toast" role="status" aria-live="polite" aria-atomic="true"></div>`;
      const productsSection = (items, filters = false) =>
        `${filters ? `<div class="filters"><button class="filter-chip active" data-category="all">Todo el menú</button>${categories.map((c) => `<button class="filter-chip" data-category="${c.id}">${esc(c.nombre)}</button>`).join("")}</div>` : ""}<div class="product-grid">${items.map(productCard).join("") || '<p class="empty-state">Pronto tendremos novedades en el menú.</p>'}</div>`;
      const home = `<main id="contenido"><section class="hero"><div class="hero-copy"><span class="eyebrow hero-eyebrow">Piedecuesta · HECHO CON ANTOJO</span><h1>El antojo tiene<br>un <em>nuevo favorito.</em></h1><p>${esc(e.eslogan || "Sabores que te encantan, al alcance de tu mano")}</p><div class="hero-actions"><a class="button" href="menu.html">Ver el menú <span>↗</span></a><a class="text-link" href="${esc(waLink)}" target="_blank" rel="noopener">Pide por WhatsApp <span>↗</span></a></div><div class="hero-note"><span class="stars">★★★★★</span><span>Sabor que siempre provoca</span></div></div><div class="hero-art"><div class="sun-shape"></div><img src="assets/images/burger.svg" alt="Hamburguesa CAMILETE recién preparada"><div class="art-sticker">PREPARADO<br>CON AMOR <span>♥</span></div><div class="art-caption">EL BUEN<br>ANTOJO.</div></div><div class="hero-index">01 <i></i> 03</div></section><section class="section featured-section"><div class="section-heading"><div><span class="eyebrow">HECHOS PARA DISFRUTAR</span><h2>Los que siempre <em>provocan.</em></h2></div><a class="text-link" href="menu.html">Ver todo el menú <span>↗</span></a></div>${productsSection(products.filter((p) => p.destacado).slice(0, 3))}</section><section class="menu-banner"><div><span class="eyebrow">TU PRÓXIMO FAVORITO TE ESPERA</span><h2>¿Antojo? Nosotros<br>nos encargamos.</h2><a class="button button-light" href="menu.html">Explorar menú <span>↗</span></a></div><div class="banner-illustration"><img src="assets/images/fries.svg" alt="Papas crocantes CAMILETE"></div><span class="banner-scribble">rico<br>rico<br>rico</span></section><section class="section about-strip"><span class="eyebrow">SOMOS CAMILETE</span><h2>Comida con sabor.<br><em>Momentos para recordar.</em></h2><p>${esc(e.descripcionLarga || e.descripcionCorta || "Sabor local, ingredientes frescos y muchas ganas de verte sonreír.")}</p><a class="text-link" href="nosotros.html">Conoce nuestra historia <span>↗</span></a></section></main>`;
      const pageViews = {
        menu: `<main id="contenido"><section class="page-intro"><span class="eyebrow">TODO LO BUENO, EN UN SOLO LUGAR</span><h1>El menú que<br><em>tenías en mente.</em></h1><p>Elige tu antojo. Nosotros lo preparamos con todo el sabor.</p></section><section class="section menu-list">${productsSection(
          products.filter((p) => p.disponible !== false),
          true,
        )}</section></main>`,
        nosotros: `<main id="contenido"><section class="page-intro"><span class="eyebrow">UNA HISTORIA CON MUCHO SABOR</span><h1>Hola, somos<br><em>${esc(e.nombre || "CAMILETE")}.</em></h1><p>${esc(e.descripcionLarga || e.descripcionCorta || "Comida deliciosa, preparada con cariño en Piedecuesta.")}</p></section><section class="section story"><div class="story-art"><img src="assets/images/hotdog.svg" alt="Una de las preparaciones favoritas de CAMILETE"></div><div><span class="eyebrow">NUESTRA HISTORIA</span><h2>Hecho para disfrutar <em>juntos.</em></h2><p>${esc(e.historia || e.descripcionLarga)}</p><h3>Nuestra misión</h3><p>${esc(e.mision || "Preparar comida deliciosa con atención cercana.")}</p><h3>Nuestra visión</h3><p>${esc(e.vision || "Ser un lugar favorito para compartir.")}</p><h3>Lo que nos mueve</h3><div class="value-list">${(e.valores || []).map((v) => `<span>${esc(v)}</span>`).join("")}</div></div></section></main>`,
        ubicacion: `<main id="contenido"><section class="page-intro"><span class="eyebrow">NOS VEMOS PRONTO</span><h1>Ven por tu antojo<br><em>favorito.</em></h1><p>Estamos en Piedecuesta, listos para recibirte.</p></section><section class="section location-layout"><div class="location-card"><span class="eyebrow">ENCUÉNTRANOS</span><h2>${esc(e.direccion || "Piedecuesta, Santander")}</h2><p>${esc(e.horarioAtencion || "Consulta nuestros horarios por WhatsApp")}</p><p>${e.telefono ? esc(e.telefono) : "Escríbenos para consultar disponibilidad"}</p><a class="button" href="${esc(e.enlaceMapa || "https://maps.google.com/?q=Piedecuesta,Colombia")}" target="_blank" rel="noopener">Cómo llegar ↗</a><a class="text-link" href="${esc(waLink)}" target="_blank" rel="noopener">Contactar por WhatsApp ↗</a></div><iframe title="Mapa de Piedecuesta" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(e.direccion || "Piedecuesta, Colombia")}&output=embed"></iframe></section></main>`,
        contacto: `<main id="contenido"><section class="page-intro"><span class="eyebrow">ESTAMOS PARA TI</span><h1>Hablemos de<br><em>antojos.</em></h1><p>¿Tienes una pregunta? Escríbenos y te ayudamos.</p><a class="button" href="${esc(waLink)}" target="_blank" rel="noopener">Escribir por WhatsApp ↗</a><p>${esc(e.telefono || "")} ${e.correo ? `· ${esc(e.correo)}` : ""}</p></section></main>`,
        carrito: `<main id="contenido"><section class="page-intro"><span class="eyebrow">UN BUEN ANTOJO VA EN CAMINO</span><h1>Tu <em>pedido.</em></h1></section><section class="section cart-section"><div id="cart-items"></div><fieldset class="fulfillment-options"><legend>¿Cómo quieres recibir tu pedido?</legend><label class="fulfillment-choice"><input type="radio" name="fulfillment" value="delivery" ${selectedFulfillment.method === "delivery" ? "checked" : ""}><span><strong>Domicilio</strong><small>Elige la zona para calcular el recargo tentativo.</small></span></label><label class="fulfillment-choice"><input type="radio" name="fulfillment" value="pickup" ${selectedFulfillment.method === "pickup" ? "checked" : ""}><span><strong>Pasar a recoger</strong><small>Recoge el pedido en nuestra sede.</small></span></label></fieldset><div id="delivery-fields" ${selectedFulfillment.method === "delivery" ? "" : "hidden"}><label class="field-label" for="delivery-zone">Zona de entrega</label><select id="delivery-zone" class="text-input"><option value="">Selecciona tu zona</option>${deliveryZones.map((zone) => `<option value="${esc(zone.id)}" ${selectedFulfillment.zone === zone.id ? "selected" : ""}>${esc(zone.nombre)}${zone.recargo != null ? ` · ${money(zone.recargo)} aprox.` : " · tarifa por confirmar"}</option>`).join("")}</select><label class="field-label" for="delivery-address">Dirección de entrega</label><input id="delivery-address" class="text-input" value="${esc(selectedFulfillment.address || "")}" placeholder="Escribe tu dirección"><p class="delivery-note">${esc(deliverySettings.nota || "El recargo es tentativo y se confirma al tomar el pedido.")}</p></div><div id="pickup-info" class="pickup-info" ${selectedFulfillment.method === "pickup" ? "" : "hidden"}><strong>Recoger en la sede</strong><span>${esc(e.direccion || "Consulta la dirección de la sede")}</span></div>${(e.mediosPago || []).length ? `<p class="payment-note"><strong>Medios de pago:</strong> ${e.mediosPago.map(esc).join(" · ")}</p>` : ""}<div class="cart-totals"><div><span>Subtotal</span><strong id="cart-subtotal">$0</strong></div><div id="delivery-fee-row" hidden><span>Recargo domicilio (tentativo)</span><strong id="delivery-fee">—</strong></div><div class="cart-total"><span>Total</span><strong id="cart-total">$0</strong></div><p id="total-note" class="delivery-note" hidden></p></div><button id="send-order" class="button">Continuar por WhatsApp ↗</button><a class="text-link" href="menu.html">Seguir mirando el menú</a></section></main>`,
        error: `<main id="contenido" class="error-page"><section class="error-card"><div class="error-art" aria-hidden="true"><div class="error-sun"></div><img src="assets/images/fries.svg" alt=""><span class="error-number">404</span><span class="error-stamp">ANTOJO<br>PERDIDO</span></div><div class="error-copy"><span class="eyebrow">ERROR 404 · PÁGINA NO ENCONTRADA</span><h1>Este antojo<br><em>se perdió.</em></h1><p>No encontramos esta página. Pero todavía puedes encontrar algo rico en el menú.</p><div class="error-actions"><a class="button" href="menu.html">Ver el menú <span>↗</span></a><a class="text-link" href="index.html">Volver al inicio</a></div></div></section></main>`,
      };
      const legalInfo = {
        "politicas-privacidad": [
          "Política de privacidad",
          "El responsable del tratamiento es " +
            (e.razonSocial || e.nombre || "CAMILETE") +
            (e.nit ? ", NIT " + e.nit : "") +
            ". Tratamos los datos que nos compartes al realizar pedidos o contactarnos para gestionar tu solicitud, coordinar entregas y atender consultas. Puedes conocer, actualizar o rectificar tus datos, solicitar prueba de autorización, pedir información sobre su uso y presentar consultas o reclamos a través de " +
            (e.correo || "nuestros canales de atención") +
            ". Aplicamos medidas razonables de seguridad y conservamos la información durante el tiempo necesario para atender la finalidad y las obligaciones legales. El tratamiento se rige por la Ley 1581 de 2012 y el Decreto 1074 de 2015. Completa y verifica estos datos de acuerdo con las operaciones reales del negocio antes de publicar.",
        ],
        "politicas-datos": [
          "Política de tratamiento de datos personales",
          "CAMILETE, " +
            (e.direccion || "Piedecuesta, Colombia") +
            ", es responsable del tratamiento de datos personales. Conforme a la Ley 1581 de 2012 y el Decreto 1074 de 2015, puedes conocer, actualizar y rectificar tus datos; solicitar prueba de autorización; ser informado sobre su uso; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización o solicitar supresión cuando proceda; y acceder gratuitamente a tus datos. Envía consultas o reclamos a " +
            (e.correo || "nuestro canal de contacto") +
            ". Los reclamos deben identificar al titular, describir los hechos y señalar un canal de respuesta. Se responderán dentro de los términos legales. No compartimos información salvo autorización o deber legal.",
        ],
        "terminos-condiciones": [
          "Términos y condiciones",
          "Este sitio presenta información de CAMILETE y permite consultar productos y preparar solicitudes de pedido. La disponibilidad, precios, ingredientes y tiempos se confirman al aceptar el pedido por WhatsApp; las fotografías son ilustrativas y los productos pueden variar. El usuario se compromete a proporcionar información correcta y usar el sitio lícitamente. Los contenidos y signos distintivos pertenecen a sus titulares. La relación de consumo se rige por la legislación colombiana, incluida la Ley 1480 de 2011; el comercio electrónico, cuando aplique, por la Ley 1341 de 2009 y normas vigentes. Para consultas contacta a " +
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
      app.innerHTML =
        header +
        (page === "index" ? home : pageViews[page] || pageViews.error) +
        footer;
      if (page === "menu")
        app.insertAdjacentHTML(
          "beforeend",
          `<a class="cart-float" href="carrito.html">🛒 <span id="cart-float-count">${cart().reduce((a, i) => a + i.qty, 0)}</span> · Ver mi pedido <span>↗</span></a>`,
        );
      const updateCartCount = () => {
        const count = cart().reduce((a, i) => a + i.qty, 0);
        const badge = document.querySelector("#cart-count");
        if (badge) badge.textContent = count;
        const floating = document.querySelector("#cart-float-count");
        if (floating) floating.textContent = count;
        const link = document.querySelector(".cart-link");
        if (link)
          link.setAttribute("aria-label", `Carrito, ${count} artículos`);
      };
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
        button.textContent = next === "claro" ? "☾" : "☀";
        button.setAttribute(
          "aria-label",
          next === "claro" ? "Activar modo oscuro" : "Activar modo claro",
        );
      });
      const mt = document.querySelector(".menu-toggle");
      const primaryNav = document.querySelector("#primary-navigation");
      const setMenuOpen = (open) => {
        mt.setAttribute("aria-expanded", String(open));
        mt.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        primaryNav.classList.toggle("nav-open", open);
      };
      mt.addEventListener("click", () => {
        setMenuOpen(mt.getAttribute("aria-expanded") !== "true");
      });
      primaryNav.querySelectorAll("a").forEach((link) =>
        link.addEventListener("click", () => setMenuOpen(false)),
      );
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenuOpen(false);
      });
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".nav-wrap")) setMenuOpen(false);
      });
      window.matchMedia("(min-width: 651px)").addEventListener("change", (event) => {
        if (event.matches) setMenuOpen(false);
      });
      document
        .querySelectorAll("[data-add]")
        .forEach((b) =>
          b.addEventListener("click", () => addProduct(b.dataset.add, b)),
        );
      document.querySelectorAll("[data-category]").forEach((b) =>
        b.addEventListener("click", () => {
          document
            .querySelectorAll("[data-category]")
            .forEach((x) => x.classList.remove("active"));
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
          const extraCost = item.extras.reduce(
            (sum, id) =>
              sum + (additions.find((x) => x.id === id)?.precio || 0),
            0,
          );
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
                  return `<article class="cart-row" data-cart-row="${esc(item.lineId)}"><img class="cart-product-image" src="${esc(product.imagen || "assets/images/burger.svg")}" alt="${esc(product.nombre)}"><div class="cart-item-main"><div class="cart-item-heading"><div><h2>${esc(product.nombre)}</h2><span>${money(product.precio)} por unidad</span></div><button type="button" class="remove-item" data-remove="${esc(item.lineId)}" aria-label="Eliminar ${esc(product.nombre)} del carrito">×</button></div><div class="cart-options"><span class="options-title">Personaliza tu producto</span><label class="choice-chip"><input type="checkbox" data-pref="sauces" data-line="${esc(item.lineId)}" ${item.preferences.sauces ? "checked" : ""}> Lleva salsas</label><label class="choice-chip"><input type="checkbox" data-pref="onion" data-line="${esc(item.lineId)}" ${item.preferences.onion ? "checked" : ""}> Lleva cebolla</label><label class="instructions-label">Otros cambios (por ejemplo: sin tomate)<input class="text-input" type="text" data-instructions="true" data-line="${esc(item.lineId)}" value="${esc(item.instructions)}" placeholder="Escribe aquí tus indicaciones"></label><details class="extras-picker"><summary>Agregar adicionales de la carta</summary><div class="extras-grid">${additions.map((extra) => `<label class="extra-option"><input type="checkbox" data-extra="${extra.id}" data-line="${esc(item.lineId)}" ${item.extras.includes(extra.id) ? "checked" : ""}><span>${esc(extra.nombre)}</span><strong>+ ${money(extra.precio)}</strong></label>`).join("")}</div><small>El adicional seleccionado se cobra por cada unidad de este producto.</small></details></div><div class="cart-item-bottom"><div class="qty-control"><button type="button" data-qty="${esc(item.lineId)}" data-change="-1" aria-label="Reducir cantidad de ${esc(product.nombre)}">−</button><span>${item.qty}</span><button type="button" data-qty="${esc(item.lineId)}" data-change="1" aria-label="Aumentar cantidad de ${esc(product.nombre)}">+</button></div><strong class="line-total">${money(getLineTotal(item))}</strong></div></div></article>`;
                })
                .join("")
            : '<p class="empty-state">Tu carrito está esperando algo rico. <a href="menu.html">Explora el menú.</a></p>';
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
          writeStorage("camilete-cart", items);
          paintCart();
          const selector = target.dataset.pref
            ? `[data-pref="${target.dataset.pref}"]`
            : target.dataset.extra
              ? `[data-extra="${target.dataset.extra}"]`
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
                  item.extras.length
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
          const message = (
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
