"""All site copy. English and Puerto Rico Spanish, written from the same intent.

Rules: no em-dashes, sentence case, every capability carries a status,
no invented numbers, desk fee never shown, never WhatsApp-only.
"""
from lib import ruled, status_table, tiles, checklist, p, tag

SITE = "https://post.supply"
EMAIL = "team@post.supply"

# ---------------------------------------------------------------- UI strings
UI = {
    "en": {
        "nav": [("how", "How it works"), ("materials", "Materials"), ("suppliers", "For suppliers"), ("contact", "Contact")],
        "menu": "Menu", "dark": "Dark", "light": "Light", "skip": "Skip to content",
        "cta": "Get prices", "lang_name": "English",
        "form_title": "Get prices",
        "phone": "Mobile number", "phone_hint": "We reply by text or WhatsApp.",
        "name": "First name", "company": "Company", "cats": "What do you buy?",
        "next": "Continue", "finish": "Send",
        "consent": "By sending your number you agree that post.supply may contact you by text message, WhatsApp or phone about your request. Message and data rates may apply. Reply STOP to stop texts. See our <a href=\"/privacy/\">privacy notice</a>.",
        "step2": "Thanks. Who should we ask for?", "step3": "Last one. What do you buy most?",
        "done": "Got it. We will reach out on that number about your request.",
        "done_more": "Have a list, photo or PDF? Email it to <a href=\"mailto:team@post.supply\">team@post.supply</a>.",
        "error": "We could not send that right now. Email your number and list to",
        "phone_bad": "Enter a mobile number with area code.",
        "or_email": "Or email your list to",
        "free_note": "Quoting is free. You pay only for material delivered.",
        "cat_opts": ["Plywood", "Panels", "Decking, flooring and trim", "Wood poles", "Other"],
        "crumb_home": "Home",
        "footer_tag": "Turns a message into a delivered order.",
        "footer_rights": "All rights reserved.",
        "privacy": "Privacy",
        "status_head": ("Capability", "Status"),
        "updated": "Last updated",
    },
    "es": {
        "nav": [("how", "Cómo funciona"), ("materials", "Materiales"), ("suppliers", "Para suplidores"), ("contact", "Contacto")],
        "menu": "Menú", "dark": "Oscuro", "light": "Claro", "skip": "Ir al contenido",
        "cta": "Recibir precios", "lang_name": "Español",
        "form_title": "Recibir precios",
        "phone": "Número de celular", "phone_hint": "Te contestamos por texto o WhatsApp.",
        "name": "Nombre", "company": "Empresa", "cats": "¿Qué compras?",
        "next": "Continuar", "finish": "Enviar",
        "consent": "Al enviar tu número, aceptas que post.supply te contacte por mensaje de texto, WhatsApp o llamada sobre tu solicitud. Pueden aplicar cargos de mensajes y datos. Responde STOP para dejar de recibir textos. Lee nuestro <a href=\"/es/privacidad/\">aviso de privacidad</a>.",
        "step2": "Gracias. ¿Por quién preguntamos?", "step3": "Una más. ¿Qué es lo que más compras?",
        "done": "Recibido. Te contactamos a ese número sobre tu solicitud.",
        "done_more": "¿Tienes una lista, foto o PDF? Envíala a <a href=\"mailto:team@post.supply\">team@post.supply</a>.",
        "error": "No pudimos enviarlo ahora. Envía tu número y tu lista a",
        "phone_bad": "Escribe un número de celular con código de área.",
        "or_email": "O envía tu lista a",
        "free_note": "Cotizar es gratis. Solo pagas por el material entregado.",
        "cat_opts": ["Plywood", "Paneles", "Decking, pisos y molduras", "Postes de madera", "Otro"],
        "crumb_home": "Inicio",
        "footer_tag": "Convierte un mensaje en un pedido entregado.",
        "footer_rights": "Todos los derechos reservados.",
        "privacy": "Privacidad",
        "status_head": ("Capacidad", "Estado"),
        "updated": "Última actualización",
    },
}

# ------------------------------------------------------------ shared blocks

def channels(lang):
    if lang == "en":
        rows = [
            ("Text message", "manual", None),
            ("WhatsApp", "manual", None),
            ("Email", "manual", None),
            ("Photos, PDFs, spreadsheets and voice notes", "manual", "Send the list the way you have it."),
            ("Text-to-quote (BuildFlow)", "prototype", "Reads a plain-language request and drafts the specification for a person to confirm."),
            ("A phone line that turns a spoken request into a quote", "roadmap", None),
        ]
        return status_table(lang, rows, UI[lang]["status_head"]) + p(
            "<strong>Manual</strong> means a person on our desk handles it today. <strong>Prototype</strong> means it works in testing and a person checks every result. <strong>Roadmap</strong> means it is planned and not available yet.")
    rows = [
        ("Mensaje de texto", "manual", None),
        ("WhatsApp", "manual", None),
        ("Email", "manual", None),
        ("Fotos, PDF, hojas de cálculo y notas de voz", "manual", "Envía la lista como la tengas."),
        ("Texto a cotización (BuildFlow)", "prototype", "Lee una solicitud escrita en palabras comunes y prepara la especificación para que una persona la confirme."),
        ("Una línea telefónica que convierte una solicitud hablada en cotización", "roadmap", None),
    ]
    return status_table(lang, rows, UI[lang]["status_head"]) + p(
        "<strong>Manual</strong> significa que hoy lo atiende una persona de nuestro equipo. <strong>Prototipo</strong> significa que funciona en pruebas y una persona revisa cada resultado. <strong>Hoja de ruta</strong> significa que está planificado y todavía no está disponible.")


def material_links(lang):
    if lang == "en":
        return ruled([
            ("Plywood", "Commercial plywood, film-faced plywood for concrete formwork, and door skin.", "/materials/plywood/"),
            ("Panels", "MDF, particle board, melamine-faced board, OSB, slatwall and paulownia.", "/materials/panels/"),
            ("Decking, flooring and trim", "WPC decking, PVC wall panels and trim, wood flooring and moulding.", "/materials/decking-flooring-trim/"),
            ("Wood poles", "Postes Naturales with a natural taper, and Perfectos Redondos rounded to a constant diameter.", "/materials/wood-poles/"),
        ])
    return ruled([
        ("Plywood", "Plywood comercial, plywood con película para encofrado y door skin.", "/es/materiales/plywood/"),
        ("Paneles", "MDF, aglomerado, melamina, OSB, slatwall y paulownia.", "/es/materiales/paneles/"),
        ("Decking, pisos y molduras", "Decking WPC, paneles y molduras de PVC, pisos de madera y molduras.", "/es/materiales/decking-pisos-molduras/"),
        ("Postes de madera", "Postes Naturales con su conicidad natural y Perfectos Redondos con diámetro constante.", "/es/materiales/postes-de-madera/"),
    ])


def closing(lang, role="buyer"):
    if lang == "en":
        if role == "supplier":
            return {"h2": "Bring the orders you already have.", "p": "Start a measured trial. You keep your customers, your brand and your prices.", "cta": "Request a trial"}
        return {"h2": "Send your list.", "p": "One request. Comparable supply. One delivered price.", "cta": "Get prices"}
    if role == "supplier":
        return {"h2": "Trae los pedidos que ya tienes.", "p": "Empieza una prueba medida. Tus clientes, tu marca y tus precios siguen siendo tuyos.", "cta": "Solicitar una prueba"}
    return {"h2": "Envía tu lista.", "p": "Una solicitud. Ofertas comparables. Un solo precio entregado.", "cta": "Recibir precios"}


FAQ_CORE = {
    "en": [
        ("What is post.supply?",
         "post.supply is a trade desk for building materials. You send a request in any format, by text message, WhatsApp or email, and we return comparable offers with one delivered price. We coordinate the order through delivery and reconcile the final cost against the quote you approved. It is not a marketplace: suppliers are not listed publicly and prices are not published for comparison."),
        ("How much does it cost to get a quote?",
         "Nothing. Quoting, sourcing, coordination and documents are free. You pay only for material that is delivered, at the single price you approved. There are no line-item service fees added on top of that price."),
        ("What does the delivered price include?",
         "The delivered price is one number for the material at the destination you give us. It covers the material, freight and the handling needed to get it to you. Each quote states in writing the destination, how long the price holds and anything it excludes, so you can compare it with your current landed cost."),
        ("Do I need to format my list?",
         "No. A photo of a handwritten list, a PDF takeoff, a spreadsheet or a voice note all work. If something is unclear, we ask before we quote, and we only ask what we need."),
        ("Where do you deliver?",
         "We are starting in Puerto Rico. If your destination is somewhere else, ask anyway. We will tell you plainly whether we can quote it well."),
    ],
    "es": [
        ("¿Qué es post.supply?",
         "post.supply coordina la compra de materiales de construcción. Envías una solicitud en cualquier formato, por mensaje de texto, WhatsApp o email, y te devolvemos ofertas comparables con un solo precio entregado. Coordinamos el pedido hasta la entrega y cuadramos el costo final contra la cotización que aprobaste. No es un marketplace: los suplidores no se publican y los precios no se exhiben para comparar."),
        ("¿Cuánto cuesta pedir una cotización?",
         "Nada. Cotizar, buscar suplidores, coordinar y preparar documentos es gratis. Solo pagas por el material que se entrega, al precio único que aprobaste. No se añaden cargos de servicio por partida encima de ese precio."),
        ("¿Qué incluye el precio entregado?",
         "El precio entregado es un solo número por el material puesto en el destino que nos indiques. Cubre el material, el flete y el manejo necesario para que llegue a ti. Cada cotización indica por escrito el destino, cuánto tiempo se sostiene el precio y lo que no incluye, para que la compares con tu costo puesto actual."),
        ("¿Tengo que organizar mi lista?",
         "No. Una foto de una lista escrita a mano, un PDF de cantidades, una hoja de cálculo o una nota de voz funcionan. Si algo no está claro, preguntamos antes de cotizar, y solo preguntamos lo necesario."),
        ("¿A dónde entregan?",
         "Estamos empezando en Puerto Rico. Si tu destino es otro, pregunta de todos modos. Te diremos claramente si podemos cotizarlo bien."),
    ],
}

# ------------------------------------------------------------------- pages
PAGES = []

# HOME -----------------------------------------------------------------------
PAGES.append({
    "id": "home", "parent": None, "og": True,
    "en": {
        "path": "/",
        "title": "Building materials at one delivered price | post.supply",
        "description": "Send one request for plywood, panels, decking or wood poles by text, WhatsApp or email. post.supply returns comparable offers and one delivered price.",
        "crumb": "Home",
        "eyebrow": "post.supply · Building materials, delivered",
        "h1": "One request. Comparable supply. One delivered price.",
        "lead": "Send your materials list the way you already work: a text, a WhatsApp message, an email, a photo of a handwritten list. post.supply returns comparable offers and one price, delivered to your site or warehouse.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Who", "h2": "Built for the people who buy materials for a living.",
             "body": p("Importers, distributors and hardware stores lose hours to the same loop: ask three suppliers, wait, chase, compare quotes that do not match, then find out freight was never included. post.supply runs that loop for you.") + ruled([
                 ("Importers", "Full-container and mixed-load orders, priced to your port or warehouse."),
                 ("Distributors", "Repeat items at a consistent delivered price, with documents that reconcile."),
                 ("Hardware stores", "Restock plywood, panels and trim without managing a dozen supplier conversations."),
             ])},
            {"label": "02 · How", "band": True, "h2": "From a message to a delivered order.",
             "body": ruled([
                 ("Send", "Your list in any format: text, WhatsApp, email, a photo, a PDF or a spreadsheet. You never have to reformat it for us."),
                 ("Structure", "We turn it into a clear specification: product, grade, size, quantity, destination and date. We ask only what we need."),
                 ("Compare", "You get comparable offers, matched like for like, each with what we have verified about the supplier and what we have not."),
                 ("Deliver", "Approve one delivered price. We coordinate production, freight and documents, and keep you posted on the channel you used to ask."),
             ]) + '<p class="more"><a href="/how-it-works/">See the full process</a></p>'},
            {"label": "03 · Price", "h2": "You pay for material delivered. Nothing else.",
             "body": p("Quoting, sourcing, coordination and documents cost you nothing. Every quote is one number: the price of the material at your door. No line-item fees, no surprise freight, no charge for asking.",
                       "After delivery, we reconcile the final landed cost against the quote you approved, line by line.")},
            {"label": "04 · Materials", "band": True, "h2": "Materials you can request.",
             "body": material_links("en") + p("Need something else, like lumber? Send it anyway. If we cannot quote it well, we will tell you.")},
            {"label": "05 · Channels", "h2": "Ask on the channel you already use.", "body": channels("en")},
            {"label": "06 · Start", "band": True, "h2": "Start with one repeat item.",
             "body": ruled([
                 ("Pick one item", "Something you buy often, so the comparison is real."),
                 ("Send your last invoice or purchase order", "For that item, with the price you paid and where it was delivered."),
                 ("Get the same spec, quoted delivered", "One price, in writing, with its validity window."),
                 ("Reconcile", "If you order, we compare the final landed cost with the approved quote, line by line."),
             ]) + p("No commitment beyond that order, and no promised savings. You decide on evidence.")},
        ],
        "faq_label": "07 · Questions", "faq_h2": "Questions buyers ask.",
        "faqs": FAQ_CORE["en"],
        "closing": closing("en"),
        "service": True,
    },
    "es": {
        "path": "/es/",
        "title": "Materiales de construcción a un solo precio entregado | post.supply",
        "description": "Envía una solicitud de plywood, paneles, decking o postes por texto, WhatsApp o email. post.supply te devuelve ofertas comparables y un precio entregado.",
        "crumb": "Inicio",
        "eyebrow": "post.supply · Materiales de construcción, entregados",
        "h1": "Una solicitud. Ofertas comparables. Un solo precio entregado.",
        "lead": "Envía tu lista de materiales como ya trabajas: un texto, un mensaje de WhatsApp, un email o una foto de la lista escrita a mano. post.supply te devuelve ofertas comparables y un solo precio, entregado en tu obra o almacén.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Para quién", "h2": "Hecho para quien compra materiales todos los días.",
             "body": p("Importadores, distribuidores y ferreterías pierden horas en el mismo ciclo: pedirle precio a tres suplidores, esperar, darles seguimiento, comparar cotizaciones que no cuadran y descubrir al final que el flete nunca estaba incluido. post.supply corre ese ciclo por ti.") + ruled([
                 ("Importadores", "Pedidos de contenedor completo o carga mixta, con precio puesto en tu puerto o almacén."),
                 ("Distribuidores", "Productos de reorden a un precio entregado consistente, con documentos que cuadran."),
                 ("Ferreterías", "Repón plywood, paneles y molduras sin manejar una docena de conversaciones con suplidores."),
             ])},
            {"label": "02 · Cómo", "band": True, "h2": "De un mensaje a un pedido entregado.",
             "body": ruled([
                 ("Envías", "Tu lista en cualquier formato: texto, WhatsApp, email, foto, PDF u hoja de cálculo. Nunca tienes que reorganizarla para nosotros."),
                 ("Estructuramos", "La convertimos en una especificación clara: producto, grado, medida, cantidad, destino y fecha. Solo preguntamos lo necesario."),
                 ("Comparas", "Recibes ofertas comparables, punto por punto, cada una con lo que hemos verificado del suplidor y lo que no."),
                 ("Entregamos", "Apruebas un solo precio entregado. Coordinamos la producción, el flete y los documentos, y te mantenemos al tanto por el mismo canal donde preguntaste."),
             ]) + '<p class="more"><a href="/es/como-funciona/">Mira el proceso completo</a></p>'},
            {"label": "03 · Precio", "h2": "Pagas por el material entregado. Nada más.",
             "body": p("Cotizar, buscar suplidores, coordinar y preparar documentos no te cuesta nada. Cada cotización es un solo número: el precio del material puesto en tu puerta. Sin cargos por partida, sin flete sorpresa, sin costo por preguntar.",
                       "Después de la entrega, cuadramos el costo final puesto en destino contra la cotización que aprobaste, línea por línea.")},
            {"label": "04 · Materiales", "band": True, "h2": "Materiales que puedes solicitar.",
             "body": material_links("es") + p("¿Necesitas otra cosa, como madera aserrada? Envíala de todos modos. Si no podemos cotizarla bien, te lo decimos.")},
            {"label": "05 · Canales", "h2": "Pregunta por el canal que ya usas.", "body": channels("es")},
            {"label": "06 · Empieza", "band": True, "h2": "Empieza con un producto que compras a menudo.",
             "body": ruled([
                 ("Escoge un producto", "Uno que compres con frecuencia, para que la comparación sea real."),
                 ("Envía tu última factura u orden de compra", "De ese producto, con el precio que pagaste y dónde se entregó."),
                 ("Recibe la misma especificación, cotizada entregada", "Un solo precio, por escrito, con su vigencia."),
                 ("Cuadramos", "Si ordenas, comparamos el costo final puesto en destino con la cotización aprobada, línea por línea."),
             ]) + p("Sin compromiso más allá de ese pedido y sin ahorros prometidos. Decides con evidencia.")},
        ],
        "faq_label": "07 · Preguntas", "faq_h2": "Lo que preguntan los compradores.",
        "faqs": FAQ_CORE["es"],
        "closing": closing("es"),
        "service": True,
    },
})

# HOW IT WORKS ----------------------------------------------------------------
PAGES.append({
    "id": "how", "parent": "home",
    "en": {
        "path": "/how-it-works/",
        "title": "How it works: from message to delivered order | post.supply",
        "description": "How post.supply turns a building materials request sent by text, WhatsApp or email into comparable offers, one delivered price and a reconciled order.",
        "crumb": "How it works",
        "eyebrow": "post.supply · How it works",
        "h1": "From a message to a delivered order.",
        "lead": "Seven steps, the same every time. You see each one, and nothing is ordered until you approve a price.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Steps", "h2": "Seven steps, in order.",
             "body": tiles(["Request", "Specification", "Sourcing", "Comparison", "Approval", "Delivery", "Reconciliation"]) + ruled([
                 ("Request", "You send what you need in any format, on the channel you already use. A photo of a list is enough to start."),
                 ("Specification", "We turn the request into a written spec: product, grade, dimensions, quantity, destination and need-by date. If something is missing, we ask once, clearly."),
                 ("Sourcing", "We take the spec to manufacturers and stockists that can produce or hold it."),
                 ("Comparison", "Offers come back in different formats. We normalize them so they compare like for like, and note what we have verified about each supplier and what we have not."),
                 ("Approval", "You receive one delivered price per option, in writing, with its validity window. Nothing is ordered until you approve."),
                 ("Delivery", "We coordinate production, inspection where agreed, freight and documents. Updates arrive on the channel you used to ask."),
                 ("Reconciliation", "After delivery, we compare the final landed cost with the quote you approved, line by line, and show you the result."),
             ])},
            {"label": "02 · Status", "band": True, "h2": "What runs today, and what is planned.",
             "body": p("Every capability carries a status, so you know what to expect.") + channels("en") + status_table("en", [
                 ("Delivered-price quotes", "manual", "Prepared and checked by a person."),
                 ("Order and delivery updates on your channel", "manual", None),
                 ("Final landed cost reconciliation", "manual", None),
                 ("A short morning procurement briefing with buy, wait and watch signals", "roadmap", None),
             ], UI["en"]["status_head"])},
            {"label": "03 · Limits", "h2": "What we will not do.",
             "body": ruled([
                 ("Publish your request", "Your request is not listed anywhere public."),
                 ("Add fees to your approved price", "The price you approve is the price you pay for the material delivered."),
                 ("Promise savings we cannot show", "We compare against your own invoices and let the numbers speak."),
                 ("Present a plan as a feature", "If it is not live, it carries a status that says so."),
             ], numbered=False)},
        ],
        "faq_label": "04 · Questions", "faq_h2": "Questions about the process.",
        "faqs": [
            ("How long does a quote take?",
             "It depends on the material, the quantity and how complete the request is. When we confirm your specification, we tell you when to expect the quote, and we update you if that changes."),
            ("Who are the suppliers?",
             "Manufacturers and stockists that can meet the specification. Each offer states what we have verified about the supplier and what we have not, so you can weigh it yourself."),
            ("What is BuildFlow?",
             "BuildFlow is the post.supply text-to-quote feature. It reads a request written in plain language and drafts a structured specification for our desk to confirm. It is a prototype today, and a person checks every quote before you see it."),
            ("Can I change the order after I approve?",
             "Tell us as soon as possible. Whether a change is possible, and what it costs, depends on how far production and freight have gone. We confirm any change in writing before acting on it."),
        ],
        "closing": closing("en"),
        "service": True,
    },
    "es": {
        "path": "/es/como-funciona/",
        "title": "Cómo funciona: de un mensaje a un pedido entregado | post.supply",
        "description": "Cómo post.supply convierte una solicitud de materiales enviada por texto, WhatsApp o email en ofertas comparables, un precio entregado y un pedido cuadrado.",
        "crumb": "Cómo funciona",
        "eyebrow": "post.supply · Cómo funciona",
        "h1": "De un mensaje a un pedido entregado.",
        "lead": "Siete pasos, siempre los mismos. Ves cada uno, y no se ordena nada hasta que apruebas un precio.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Pasos", "h2": "Siete pasos, en orden.",
             "body": tiles(["Solicitud", "Especificación", "Búsqueda", "Comparación", "Aprobación", "Entrega", "Cuadre"]) + ruled([
                 ("Solicitud", "Envías lo que necesitas en cualquier formato, por el canal que ya usas. Una foto de una lista basta para empezar."),
                 ("Especificación", "Convertimos la solicitud en una especificación escrita: producto, grado, medidas, cantidad, destino y fecha límite. Si falta algo, preguntamos una vez y claro."),
                 ("Búsqueda", "Llevamos la especificación a fabricantes y almacenistas que pueden producirla o tenerla en inventario."),
                 ("Comparación", "Las ofertas llegan en formatos distintos. Las normalizamos para que se comparen punto por punto, y anotamos lo que hemos verificado de cada suplidor y lo que no."),
                 ("Aprobación", "Recibes un solo precio entregado por opción, por escrito, con su vigencia. No se ordena nada hasta que apruebas."),
                 ("Entrega", "Coordinamos la producción, la inspección cuando se acuerde, el flete y los documentos. Las actualizaciones llegan por el canal donde preguntaste."),
                 ("Cuadre", "Después de la entrega, comparamos el costo final puesto en destino con la cotización que aprobaste, línea por línea, y te mostramos el resultado."),
             ])},
            {"label": "02 · Estado", "band": True, "h2": "Lo que funciona hoy y lo que está planificado.",
             "body": p("Cada capacidad lleva un estado, para que sepas qué esperar.") + channels("es") + status_table("es", [
                 ("Cotizaciones con precio entregado", "manual", "Las prepara y revisa una persona."),
                 ("Actualizaciones del pedido y la entrega por tu canal", "manual", None),
                 ("Cuadre del costo final puesto en destino", "manual", None),
                 ("Un resumen corto de compras cada mañana con señales de comprar, esperar y vigilar", "roadmap", None),
             ], UI["es"]["status_head"])},
            {"label": "03 · Límites", "h2": "Lo que no hacemos.",
             "body": ruled([
                 ("Publicar tu solicitud", "Tu solicitud no aparece en ningún lugar público."),
                 ("Añadir cargos a tu precio aprobado", "El precio que apruebas es el precio que pagas por el material entregado."),
                 ("Prometer ahorros que no podemos demostrar", "Comparamos contra tus propias facturas y dejamos que hablen los números."),
                 ("Presentar un plan como si fuera una función", "Si no está activo, lleva un estado que lo dice."),
             ], numbered=False)},
        ],
        "faq_label": "04 · Preguntas", "faq_h2": "Preguntas sobre el proceso.",
        "faqs": [
            ("¿Cuánto tarda una cotización?",
             "Depende del material, la cantidad y qué tan completa esté la solicitud. Cuando confirmamos tu especificación, te decimos cuándo esperar la cotización y te avisamos si eso cambia."),
            ("¿Quiénes son los suplidores?",
             "Fabricantes y almacenistas que pueden cumplir con la especificación. Cada oferta indica lo que hemos verificado del suplidor y lo que no, para que lo evalúes tú."),
            ("¿Qué es BuildFlow?",
             "BuildFlow es la función de texto a cotización de post.supply. Lee una solicitud escrita en palabras comunes y prepara una especificación estructurada para que nuestro equipo la confirme. Hoy es un prototipo, y una persona revisa cada cotización antes de que la veas."),
            ("¿Puedo cambiar el pedido después de aprobarlo?",
             "Avísanos lo antes posible. Si el cambio es posible, y cuánto cuesta, depende de cuánto hayan avanzado la producción y el flete. Confirmamos cualquier cambio por escrito antes de actuar."),
        ],
        "closing": closing("es"),
        "service": True,
    },
})

# SUPPLIERS -------------------------------------------------------------------
PAGES.append({
    "id": "suppliers", "parent": "home",
    "en": {
        "path": "/suppliers/",
        "title": "Suppliers: close more of the orders you already have | post.supply",
        "description": "post.supply turns orders scattered across your text messages, WhatsApp and email into structured quotes and orders. Your customers, brand and prices stay yours.",
        "crumb": "For suppliers",
        "eyebrow": "post.supply · For suppliers",
        "h1": "Close more of the orders you already have.",
        "lead": "Your demand is already there, spread across text messages, WhatsApp chats, emails and calls. Quotes go out late, follow-ups slip and orders quietly go elsewhere. post.supply turns those conversations into structured quotes and orders, under your name and with your approval.",
        "form": "supplier",
        "sections": [
            {"label": "01 · Problem", "h2": "The problem is fragmentation, not software.",
             "body": p("Most building materials orders still start as a message. A contractor texts a list. A store owner sends a photo. A distributor emails a spreadsheet at night. Each one needs someone to read it, price it, answer it and follow up.",
                       "When that work piles up, the orders do not disappear. They go to whoever answered first. The fix is not another portal your customers will not use. It is turning the conversations you already have into orders.")},
            {"label": "02 · Mechanism", "band": True, "h2": "What a trial does for your desk.",
             "body": ruled([
                 ("Capture", "Requests from every channel you use land in one place, so none go unanswered."),
                 ("Structure", "Each request becomes a clear specification your team can price."),
                 ("Quote", "Quotes go out under your name, and you approve every price before it is sent."),
                 ("Follow up", "Open quotes get followed up on time, so fewer go quiet."),
                 ("Measure", "You see requests, quotes and closed orders against your own baseline."),
             ])},
            {"label": "03 · Rights", "h2": "Your business stays yours.",
             "body": ruled([
                 ("Your customers", "We do not sell to your customers or contact them for anyone else."),
                 ("Your brand", "Quotes and messages go out under your name."),
                 ("Your pricing", "You set every price. Nothing is published for comparison."),
                 ("Your data", "Your records belong to you, and you can take them with you."),
                 ("Your approval", "Nothing reaches a customer without your sign-off."),
                 ("Your channels", "Keep the numbers and accounts your customers already use."),
                 ("Your territory", "We do not set up competing listings in your market."),
                 ("Your commercial history", "The history we build together belongs to you."),
             ]) + p("<strong>No marketplace. No competing listings. No public price comparison. No selling to your customers.</strong>")},
            {"label": "04 · Trial", "band": True, "h2": "A ninety-day trial, measured.",
             "body": ruled([
                 ("Connect and map", "We connect to your existing channels and map how orders flow today, to set a baseline."),
                 ("Shadow mode", "We structure and draft alongside your team without sending anything to customers."),
                 ("Live operation", "With your approval, quotes and follow-ups go out under your name."),
                 ("Review", "We compare the results with your baseline. You decide whether to continue."),
             ]) + p("No false deadlines and no invented performance numbers. The result is whatever your own data shows.")},
        ],
        "faq_label": "05 · Questions", "faq_h2": "Questions suppliers ask.",
        "faqs": [
            ("Is post.supply a marketplace?",
             "No. Your products are not listed publicly, your prices are not shown for comparison, and we do not sell to your customers. post.supply works as the coordination layer behind your own sales, under your name."),
            ("Does this replace our sales team?",
             "No. Your team keeps the relationships. post.supply takes on the structuring, drafting and follow-up that pull their time away from selling."),
            ("Do our customers need to download anything?",
             "No. They keep writing to you by text message, WhatsApp, email or phone, exactly as they do today."),
            ("What happens at the end of the trial?",
             "We review the results against your baseline together. If the numbers do not justify continuing, you stop, and your records stay yours."),
        ],
        "closing": closing("en", "supplier"),
    },
    "es": {
        "path": "/es/suplidores/",
        "title": "Suplidores: cierra más de los pedidos que ya tienes | post.supply",
        "description": "post.supply convierte los pedidos regados entre textos, WhatsApp y email en cotizaciones y órdenes. Tus clientes, tu marca y tus precios siguen siendo tuyos.",
        "crumb": "Para suplidores",
        "eyebrow": "post.supply · Para suplidores",
        "h1": "Cierra más de los pedidos que ya tienes.",
        "lead": "Tu demanda ya está ahí, regada entre mensajes de texto, chats de WhatsApp, emails y llamadas. Las cotizaciones salen tarde, el seguimiento se pierde y los pedidos se van con otro sin hacer ruido. post.supply convierte esas conversaciones en cotizaciones y órdenes estructuradas, con tu nombre y con tu aprobación.",
        "form": "supplier",
        "sections": [
            {"label": "01 · Problema", "h2": "El problema es la fragmentación, no el software.",
             "body": p("La mayoría de los pedidos de materiales todavía empieza con un mensaje. Un contratista envía una lista por texto. El dueño de una ferretería manda una foto. Un distribuidor envía una hoja de cálculo por email de noche. Cada uno necesita que alguien lo lea, lo cotice, lo conteste y le dé seguimiento.",
                       "Cuando ese trabajo se acumula, los pedidos no desaparecen. Se van con quien contestó primero. La solución no es otro portal que tus clientes no van a usar. Es convertir en pedidos las conversaciones que ya tienes.")},
            {"label": "02 · Mecanismo", "band": True, "h2": "Lo que hace una prueba por tu equipo de ventas.",
             "body": ruled([
                 ("Captura", "Las solicitudes de todos tus canales llegan a un solo lugar, para que ninguna se quede sin contestar."),
                 ("Estructura", "Cada solicitud se convierte en una especificación clara que tu equipo puede cotizar."),
                 ("Cotización", "Las cotizaciones salen con tu nombre, y apruebas cada precio antes de enviarlo."),
                 ("Seguimiento", "Las cotizaciones abiertas reciben seguimiento a tiempo, para que menos se enfríen."),
                 ("Medición", "Ves solicitudes, cotizaciones y pedidos cerrados contra tu propia línea base."),
             ])},
            {"label": "03 · Derechos", "h2": "Tu negocio sigue siendo tuyo.",
             "body": ruled([
                 ("Tus clientes", "No le vendemos a tus clientes ni los contactamos para otros."),
                 ("Tu marca", "Las cotizaciones y los mensajes salen con tu nombre."),
                 ("Tus precios", "Tú fijas cada precio. Nada se publica para comparar."),
                 ("Tus datos", "Tus récords son tuyos y te los puedes llevar."),
                 ("Tu aprobación", "Nada le llega a un cliente sin tu visto bueno."),
                 ("Tus canales", "Mantén los números y las cuentas que tus clientes ya usan."),
                 ("Tu territorio", "No montamos listados que compitan contigo en tu mercado."),
                 ("Tu historial comercial", "El historial que construimos juntos te pertenece."),
             ]) + p("<strong>Sin marketplace. Sin listados que compitan. Sin comparación pública de precios. Sin venderle a tus clientes.</strong>")},
            {"label": "04 · Prueba", "band": True, "h2": "Una prueba de noventa días, medida.",
             "body": ruled([
                 ("Conectar y mapear", "Nos conectamos a tus canales actuales y mapeamos cómo fluyen hoy los pedidos, para fijar una línea base."),
                 ("Modo sombra", "Estructuramos y preparamos borradores junto a tu equipo sin enviarle nada a los clientes."),
                 ("Operación en vivo", "Con tu aprobación, las cotizaciones y el seguimiento salen con tu nombre."),
                 ("Revisión", "Comparamos los resultados con tu línea base. Tú decides si seguir."),
             ]) + p("Sin fechas límite falsas y sin números de rendimiento inventados. El resultado es lo que muestren tus propios datos.")},
        ],
        "faq_label": "05 · Preguntas", "faq_h2": "Lo que preguntan los suplidores.",
        "faqs": [
            ("¿post.supply es un marketplace?",
             "No. Tus productos no se publican, tus precios no se muestran para comparar y no le vendemos a tus clientes. post.supply funciona como la capa de coordinación detrás de tus propias ventas, con tu nombre."),
            ("¿Esto reemplaza a nuestro equipo de ventas?",
             "No. Tu equipo mantiene las relaciones. post.supply se encarga de estructurar, preparar borradores y dar seguimiento, que es lo que les quita tiempo para vender."),
            ("¿Nuestros clientes tienen que descargar algo?",
             "No. Siguen escribiéndote por mensaje de texto, WhatsApp, email o teléfono, igual que hoy."),
            ("¿Qué pasa al final de la prueba?",
             "Revisamos juntos los resultados contra tu línea base. Si los números no justifican seguir, paras, y tus récords siguen siendo tuyos."),
        ],
        "closing": closing("es", "supplier"),
    },
})

# MATERIALS HUB ---------------------------------------------------------------
PAGES.append({
    "id": "materials", "parent": "home",
    "en": {
        "path": "/materials/",
        "title": "Building materials: plywood, panels, decking, wood poles | post.supply",
        "description": "Request delivered-price quotes for plywood, film-faced plywood, MDF, melamine, OSB, WPC decking, PVC trim, wood flooring and wood poles. Any format, one price.",
        "crumb": "Materials",
        "eyebrow": "post.supply · Materials",
        "h1": "Materials you can request.",
        "lead": "Plywood, panels, decking, trim and wood poles. Send the spec you have, even if it is incomplete, and get one delivered price.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Categories", "h2": "Four categories, one way to ask.", "body": material_links("en")},
            {"label": "02 · Grades", "band": True, "h2": "Panels are quoted by grade.",
             "body": p("Panel quotes state one of four grades: Green, Premium, Standard or Construction. The grade is written on every quote, so two options are never compared across grades by accident. If you are not sure which grade you need, tell us the use and we will quote the grades that fit.")},
            {"label": "03 · Your request", "h2": "What to include, if you have it.",
             "body": checklist(["Product and type", "Thickness, width and length", "Grade or quality you buy today", "Quantity, in sheets, pieces, square meters or containers", "Destination: site, warehouse or port", "Need-by date"]) + p("Missing some of it? Send what you have. We ask for the rest.")},
            {"label": "04 · Not listed", "band": True, "h2": "Not on the list? Ask anyway.",
             "body": p("Lumber, hardware and other building materials can be requested the same way. If we cannot quote an item well, we say so instead of sending a weak price.")},
        ],
        "closing": closing("en"),
    },
    "es": {
        "path": "/es/materiales/",
        "title": "Materiales: plywood, paneles, decking y postes de madera | post.supply",
        "description": "Pide cotizaciones con precio entregado de plywood, plywood con película, MDF, melamina, OSB, decking WPC, molduras de PVC, pisos de madera y postes.",
        "crumb": "Materiales",
        "eyebrow": "post.supply · Materiales",
        "h1": "Materiales que puedes solicitar.",
        "lead": "Plywood, paneles, decking, molduras y postes de madera. Envía la especificación que tengas, aunque esté incompleta, y recibe un solo precio entregado.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Categorías", "h2": "Cuatro categorías, una sola forma de pedir.", "body": material_links("es")},
            {"label": "02 · Grados", "band": True, "h2": "Los paneles se cotizan por grado.",
             "body": p("Las cotizaciones de paneles indican uno de cuatro grados: Green, Premium, Standard o Construction. El grado aparece en cada cotización, para que nunca compares dos opciones de grados distintos por error. Si no sabes qué grado necesitas, dinos el uso y te cotizamos los grados que aplican.")},
            {"label": "03 · Tu solicitud", "h2": "Qué incluir, si lo tienes.",
             "body": checklist(["Producto y tipo", "Grosor, ancho y largo", "Grado o calidad que compras hoy", "Cantidad, en hojas, piezas, metros cuadrados o contenedores", "Destino: obra, almacén o puerto", "Fecha en que lo necesitas"]) + p("¿Te falta algo? Envía lo que tengas. Nosotros preguntamos el resto.")},
            {"label": "04 · No aparece", "band": True, "h2": "¿No está en la lista? Pregunta de todos modos.",
             "body": p("Madera aserrada, ferretería y otros materiales de construcción se piden de la misma forma. Si no podemos cotizar algo bien, te lo decimos en vez de enviarte un precio débil.")},
        ],
        "closing": closing("es"),
    },
})

# PLYWOOD -----------------------------------------------------------------------
PAGES.append({
    "id": "plywood", "parent": "materials",
    "en": {
        "path": "/materials/plywood/",
        "title": "Plywood and film-faced plywood, delivered price | post.supply",
        "description": "Request delivered-price quotes for commercial plywood, film-faced formwork plywood and door skin. Send thickness, size, grade and quantity in any format.",
        "crumb": "Plywood",
        "eyebrow": "post.supply · Materials · Plywood",
        "h1": "Plywood, quoted to your door.",
        "lead": "Commercial plywood, film-faced plywood for concrete formwork, and door skin. Tell us what you use and how much. We return comparable offers and one delivered price.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Types", "h2": "Plywood you can request.",
             "body": ruled([
                 ("Commercial plywood", "Cross-laminated veneer sheets for general construction, cabinetry, shelving and furniture. Usually specified by thickness, face species, core and glue type."),
                 ("Film-faced plywood", "Plywood with a phenolic film face, made for concrete formwork. The film sheds water and concrete, so the panel can be reused. Specified by thickness, film weight, core and edge sealing."),
                 ("Door skin", "Thin flat or molded panels used to face hollow-core and solid doors. Specified by thickness, size and face finish."),
             ])},
            {"label": "02 · Specify", "band": True, "h2": "What to include in a plywood request.",
             "body": checklist(["Type: commercial, film-faced or door skin", "Thickness, for example 12, 15 or 18 mm", "Sheet size. The common size is 1220 × 2440 mm, or 4 × 8 ft", "Glue type, for example moisture-resistant or phenolic", "Face species and grade", "Quantity in sheets, bundles or containers", "Destination and need-by date"])},
            {"label": "03 · Uses", "h2": "Where it goes.",
             "body": ruled([
                 ("Formwork", "Film-faced panels for walls, columns and slabs."),
                 ("Sheathing and subfloors", "Structural-rated panels where the use calls for them."),
                 ("Cabinetry and fixtures", "Smooth-faced commercial plywood for cabinets, shelving and store fixtures."),
                 ("Doors", "Door skin for door manufacturers and carpentry shops."),
             ], numbered=False)},
        ],
        "faq_label": "04 · Questions", "faq_h2": "Plywood questions.",
        "faqs": [
            ("What thickness of film-faced plywood is used for formwork?",
             "18 mm is the most common thickness for wall and slab formwork, with 12 and 15 mm used for lighter work. The right choice depends on the pour, the span between supports and how many reuses you need. Tell us the application and we will quote options that match."),
            ("Can I order less than a full container?",
             "Send the quantity you need. Each quote states any minimum and how the quantity affects the delivered price, so you can decide whether to combine items into one shipment."),
            ("How do I compare plywood quotes fairly?",
             "Compare the same thickness, size, glue type, face and grade, priced to the same destination. post.supply normalizes every offer on those points and gives one delivered price per option, so the comparison is like for like."),
        ],
        "closing": closing("en"),
    },
    "es": {
        "path": "/es/materiales/plywood/",
        "title": "Plywood y plywood con película, precio entregado | post.supply",
        "description": "Pide cotizaciones con precio entregado de plywood comercial, plywood con película para encofrado y door skin. Envía grosor, medida, grado y cantidad.",
        "crumb": "Plywood",
        "eyebrow": "post.supply · Materiales · Plywood",
        "h1": "Plywood, cotizado hasta tu puerta.",
        "lead": "Plywood comercial, plywood con película para encofrado de concreto y door skin. Dinos qué usas y cuánto. Te devolvemos ofertas comparables y un solo precio entregado.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Tipos", "h2": "Plywood que puedes solicitar.",
             "body": ruled([
                 ("Plywood comercial", "Hojas de chapas cruzadas para construcción general, gabinetes, tablillas y muebles. Se especifica por grosor, especie de la cara, núcleo y tipo de pega."),
                 ("Plywood con película", "Plywood con cara de película fenólica, hecho para encofrado de concreto. La película repele el agua y el concreto, así que el panel se puede reusar. Se especifica por grosor, peso de la película, núcleo y sellado de bordes."),
                 ("Door skin", "Paneles finos, planos o moldeados, para forrar puertas huecas y sólidas. Se especifica por grosor, medida y acabado de la cara."),
             ])},
            {"label": "02 · Especifica", "band": True, "h2": "Qué incluir en una solicitud de plywood.",
             "body": checklist(["Tipo: comercial, con película o door skin", "Grosor, por ejemplo 12, 15 o 18 mm", "Medida de la hoja. La más común es 1220 × 2440 mm, o 4 × 8 pies", "Tipo de pega, por ejemplo resistente a humedad o fenólica", "Especie y grado de la cara", "Cantidad en hojas, bultos o contenedores", "Destino y fecha en que lo necesitas"])},
            {"label": "03 · Usos", "h2": "Dónde se usa.",
             "body": ruled([
                 ("Encofrado", "Paneles con película para paredes, columnas y losas."),
                 ("Forro estructural y pisos", "Paneles con clasificación estructural cuando el uso lo requiere."),
                 ("Gabinetes y mobiliario", "Plywood comercial de cara lisa para gabinetes, tablillas y mobiliario de tienda."),
                 ("Puertas", "Door skin para fabricantes de puertas y talleres de carpintería."),
             ], numbered=False)},
        ],
        "faq_label": "04 · Preguntas", "faq_h2": "Preguntas sobre plywood.",
        "faqs": [
            ("¿Qué grosor de plywood con película se usa para encofrado?",
             "El más común para encofrado de paredes y losas es 18 mm, y se usan 12 y 15 mm para trabajos más livianos. La elección depende del vaciado, la distancia entre soportes y cuántos usos necesitas. Dinos la aplicación y te cotizamos las opciones que aplican."),
            ("¿Puedo pedir menos de un contenedor completo?",
             "Envía la cantidad que necesitas. Cada cotización indica cualquier mínimo y cómo la cantidad afecta el precio entregado, para que decidas si combinas productos en un solo embarque."),
            ("¿Cómo comparo cotizaciones de plywood de forma justa?",
             "Compara el mismo grosor, medida, tipo de pega, cara y grado, con precio al mismo destino. post.supply normaliza cada oferta en esos puntos y da un solo precio entregado por opción, para que la comparación sea punto por punto."),
        ],
        "closing": closing("es"),
    },
})

# PANELS ------------------------------------------------------------------------
PAGES.append({
    "id": "panels", "parent": "materials",
    "en": {
        "path": "/materials/panels/",
        "title": "MDF, melamine, particle board and OSB, delivered | post.supply",
        "description": "Request delivered-price quotes for MDF, melamine-faced board, particle board, OSB, slatwall and paulownia panels. One request, comparable offers, one price.",
        "crumb": "Panels",
        "eyebrow": "post.supply · Materials · Panels",
        "h1": "Panels, quoted to your door.",
        "lead": "MDF, particle board, melamine-faced board, OSB, slatwall and paulownia. Send the sizes and quantities you buy. We return comparable offers by grade and one delivered price.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Types", "h2": "Panels you can request.",
             "body": ruled([
                 ("MDF", "Medium-density fibreboard. Smooth, uniform faces and edges that machine and paint cleanly. For cabinetry, furniture, doors and moulding."),
                 ("Particle board", "Board pressed from wood particles. Lighter and usually less costly than MDF, and a common core under melamine or veneer."),
                 ("Melamine-faced board", "Particle board or MDF with a decorative melamine surface, ready-finished for cabinets, closets and store fixtures."),
                 ("OSB", "Oriented strand board. Panels for wall sheathing, subfloors and roof decking when rated for that use."),
                 ("Slatwall", "Grooved panels that hold hooks, shelves and brackets for retail display."),
                 ("Paulownia", "Very light wood panels for furniture, doors and lightweight cores."),
             ])},
            {"label": "02 · Specify", "band": True, "h2": "What to include in a panel request.",
             "body": checklist(["Panel type", "Thickness and sheet size", "Variant, for example moisture-resistant MDF", "Melamine colour, texture and one or two faces", "Grade: Green, Premium, Standard or Construction", "Quantity in sheets, bundles or containers", "Destination and need-by date"])},
        ],
        "faq_label": "03 · Questions", "faq_h2": "Panel questions.",
        "faqs": [
            ("What is the difference between MDF and particle board?",
             "MDF is made from fine wood fibres pressed into a dense, uniform board with smooth faces and edges, which machine and paint cleanly. Particle board is made from larger wood particles, is lighter and usually costs less, and is often used as a core under melamine or veneer. For exposed edges or routed profiles, MDF is the usual choice."),
            ("Is OSB structural?",
             "OSB is made for structural uses such as wall sheathing, subfloors and roof decking when it carries a rating for that use. Ask for the rating you need, and the quote will state the rating of each option."),
            ("What does melamine-faced board mean?",
             "It is a particle board or MDF core with a melamine paper surface fused to it under heat and pressure. The surface is already finished, so it goes straight into cabinets and fixtures. Specify the core, thickness, colour, texture and whether you need one or both faces finished."),
        ],
        "closing": closing("en"),
    },
    "es": {
        "path": "/es/materiales/paneles/",
        "title": "MDF, melamina, aglomerado y OSB, precio entregado | post.supply",
        "description": "Pide cotizaciones con precio entregado de MDF, melamina, aglomerado, OSB, slatwall y paneles de paulownia. Una solicitud, ofertas comparables, un precio.",
        "crumb": "Paneles",
        "eyebrow": "post.supply · Materiales · Paneles",
        "h1": "Paneles, cotizados hasta tu puerta.",
        "lead": "MDF, aglomerado, melamina, OSB, slatwall y paulownia. Envía las medidas y cantidades que compras. Te devolvemos ofertas comparables por grado y un solo precio entregado.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Tipos", "h2": "Paneles que puedes solicitar.",
             "body": ruled([
                 ("MDF", "Tablero de fibra de densidad media. Caras y bordes lisos y uniformes que se maquinan y pintan limpio. Para gabinetes, muebles, puertas y molduras."),
                 ("Aglomerado", "Tablero prensado de partículas de madera. Más liviano y por lo general más económico que el MDF, y un núcleo común bajo melamina o chapa."),
                 ("Melamina", "Aglomerado o MDF con superficie decorativa de melamina, ya terminado para gabinetes, closets y mobiliario de tienda."),
                 ("OSB", "Tablero de virutas orientadas. Paneles para forro de paredes, pisos y techos cuando tienen la clasificación para ese uso."),
                 ("Slatwall", "Paneles ranurados que sostienen ganchos, tablillas y soportes para exhibición en tiendas."),
                 ("Paulownia", "Paneles de madera muy liviana para muebles, puertas y núcleos livianos."),
             ])},
            {"label": "02 · Especifica", "band": True, "h2": "Qué incluir en una solicitud de paneles.",
             "body": checklist(["Tipo de panel", "Grosor y medida de la hoja", "Variante, por ejemplo MDF resistente a humedad", "Color y textura de la melamina, y si es de una o dos caras", "Grado: Green, Premium, Standard o Construction", "Cantidad en hojas, bultos o contenedores", "Destino y fecha en que lo necesitas"])},
        ],
        "faq_label": "03 · Preguntas", "faq_h2": "Preguntas sobre paneles.",
        "faqs": [
            ("¿Cuál es la diferencia entre MDF y aglomerado?",
             "El MDF se hace con fibras finas de madera prensadas en un tablero denso y uniforme, con caras y bordes lisos que se maquinan y pintan limpio. El aglomerado se hace con partículas de madera más grandes, es más liviano, por lo general cuesta menos y se usa mucho como núcleo bajo melamina o chapa. Para bordes expuestos o perfiles fresados, lo usual es el MDF."),
            ("¿El OSB es estructural?",
             "El OSB se fabrica para usos estructurales como forro de paredes, pisos y techos cuando tiene la clasificación para ese uso. Pide la clasificación que necesitas y la cotización indicará la de cada opción."),
            ("¿Qué es la melamina?",
             "Es un núcleo de aglomerado o MDF con una superficie de papel melamínico fundida con calor y presión. La superficie ya viene terminada, así que va directo a gabinetes y mobiliario. Especifica el núcleo, el grosor, el color, la textura y si necesitas una o dos caras terminadas."),
        ],
        "closing": closing("es"),
    },
})

# DECKING, FLOORING, TRIM -------------------------------------------------------
PAGES.append({
    "id": "decking", "parent": "materials",
    "en": {
        "path": "/materials/decking-flooring-trim/",
        "title": "WPC decking, PVC panels and trim, wood flooring | post.supply",
        "description": "Request delivered-price quotes for WPC composite decking, PVC wall panels and trim, wood flooring and moulding. Send profile, finish and quantity in any format.",
        "crumb": "Decking, flooring and trim",
        "eyebrow": "post.supply · Materials · Decking, flooring and trim",
        "h1": "Decking, flooring and trim, quoted to your door.",
        "lead": "WPC decking, PVC wall panels and trim, wood flooring and moulding. Send the profile, finish and quantity. We return comparable offers and one delivered price.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Types", "h2": "Products you can request.",
             "body": ruled([
                 ("WPC decking", "Wood-plastic composite boards for decks, terraces and walkways. They do not need sealing or staining."),
                 ("PVC wall panels and trim", "Moisture-proof interior wall and ceiling panels, with matching trim, for kitchens, bathrooms and commercial interiors."),
                 ("Wood flooring", "Solid or engineered boards, specified by species, thickness, width, length and finish."),
                 ("Moulding", "Base, crown, casing and trim profiles in wood, MDF or PVC."),
             ])},
            {"label": "02 · Specify", "band": True, "h2": "What to include in your request.",
             "body": checklist(["Product and profile", "Dimensions and length", "Colour, texture or finish", "Accessories: clips, fasteners, end caps, joints", "Quantity in square meters, linear meters, feet or pieces", "Destination and need-by date"])},
        ],
        "faq_label": "03 · Questions", "faq_h2": "Decking, flooring and trim questions.",
        "faqs": [
            ("Does WPC decking suit a humid, coastal climate?",
             "WPC boards do not rot like untreated wood and do not need sealing, which suits humid climates. They still expand and contract with heat, so follow the installation gaps for the specific board, and ask about sun and salt exposure when you request a quote. Each offer states the product's specifications."),
            ("How do I order PVC panels and trim together?",
             "Send the wall and ceiling areas, the panel profile and the trim pieces you need. We quote panels and matching trim as one delivered price, so the order arrives complete."),
            ("Should I order extra flooring or decking?",
             "Most installers add a margin for cuts and waste, and the right amount depends on the layout and the installer. Tell us the area and the margin you want, and the quote will show both."),
        ],
        "closing": closing("en"),
    },
    "es": {
        "path": "/es/materiales/decking-pisos-molduras/",
        "title": "Decking WPC, paneles y molduras de PVC, pisos de madera | post.supply",
        "description": "Pide cotizaciones con precio entregado de decking compuesto WPC, paneles y molduras de PVC, pisos de madera y molduras. Envía perfil, acabado y cantidad.",
        "crumb": "Decking, pisos y molduras",
        "eyebrow": "post.supply · Materiales · Decking, pisos y molduras",
        "h1": "Decking, pisos y molduras, cotizados hasta tu puerta.",
        "lead": "Decking WPC, paneles y molduras de PVC, pisos de madera y molduras. Envía el perfil, el acabado y la cantidad. Te devolvemos ofertas comparables y un solo precio entregado.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Tipos", "h2": "Productos que puedes solicitar.",
             "body": ruled([
                 ("Decking WPC", "Tablas de compuesto de madera y plástico para decks, terrazas y caminos. No necesitan sellador ni tinte."),
                 ("Paneles y molduras de PVC", "Paneles de pared y techo a prueba de humedad, con molduras a juego, para cocinas, baños e interiores comerciales."),
                 ("Pisos de madera", "Tablas sólidas o de ingeniería, especificadas por especie, grosor, ancho, largo y acabado."),
                 ("Molduras", "Perfiles de zócalo, cornisa, marco y remate en madera, MDF o PVC."),
             ])},
            {"label": "02 · Especifica", "band": True, "h2": "Qué incluir en tu solicitud.",
             "body": checklist(["Producto y perfil", "Medidas y largo", "Color, textura o acabado", "Accesorios: clips, tornillería, tapas, uniones", "Cantidad en metros cuadrados, metros lineales, pies o piezas", "Destino y fecha en que lo necesitas"])},
        ],
        "faq_label": "03 · Preguntas", "faq_h2": "Preguntas sobre decking, pisos y molduras.",
        "faqs": [
            ("¿El decking WPC sirve para un clima húmedo y costero?",
             "Las tablas WPC no se pudren como la madera sin tratar y no necesitan sellador, lo que les va bien a los climas húmedos. Aun así se expanden y contraen con el calor, así que sigue las separaciones de instalación de cada tabla y pregunta por la exposición al sol y al salitre cuando pidas la cotización. Cada oferta indica las especificaciones del producto."),
            ("¿Cómo pido paneles y molduras de PVC juntos?",
             "Envía las áreas de pared y techo, el perfil del panel y las molduras que necesitas. Cotizamos los paneles y las molduras a juego en un solo precio entregado, para que el pedido llegue completo."),
            ("¿Debo pedir piso o decking de más?",
             "La mayoría de los instaladores añade un margen para cortes y desperdicio, y la cantidad correcta depende del diseño y del instalador. Dinos el área y el margen que quieres, y la cotización mostrará ambos."),
        ],
        "closing": closing("es"),
    },
})

# WOOD POLES ----------------------------------------------------------------------
PAGES.append({
    "id": "poles", "parent": "materials",
    "en": {
        "path": "/materials/wood-poles/",
        "title": "Wood poles: Postes Naturales and Perfectos Redondos | post.supply",
        "description": "Request delivered-price quotes for wood poles: Postes Naturales, bark-free with a natural taper, and Perfectos Redondos, rounded to a constant diameter.",
        "crumb": "Wood poles",
        "eyebrow": "post.supply · Materials · Wood poles",
        "h1": "Wood poles, quoted to your door.",
        "lead": "Two lines: Postes Naturales, bark-free with the natural taper of the tree, and Perfectos Redondos, rounded to a constant diameter. Send length, diameter and quantity. We return comparable offers and one delivered price.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Types", "h2": "Two kinds of pole.",
             "body": ruled([
                 ("Postes Naturales", "Bark-free poles that keep the natural taper of the tree. For fencing, pergolas, shade structures and landscaping."),
                 ("Perfectos Redondos", "Poles machined round to a constant diameter along their length. For railings, uniform structures and builds where every pole must match."),
             ])},
            {"label": "02 · Specify", "band": True, "h2": "What to include in a pole request.",
             "body": checklist(["Postes Naturales or Perfectos Redondos", "Length", "Diameter: top diameter for natural poles, constant diameter for rounded", "Use: ground contact, outdoor or indoor", "Treatment or species, if required", "Quantity", "Destination and need-by date"])},
        ],
        "faq_label": "03 · Questions", "faq_h2": "Wood pole questions.",
        "faqs": [
            ("Do the poles come treated?",
             "Treatment depends on the offer. Tell us whether the poles will be in ground contact, exposed to weather or used indoors, and each quote will state the species and the treatment, if any, so you can match it to the use."),
            ("What is the difference between Postes Naturales and Perfectos Redondos?",
             "Postes Naturales keep the tree's natural taper, so the diameter is larger at the base than at the top. Perfectos Redondos are machined to one constant diameter from end to end, so every pole matches. Choose natural poles for an organic look and rounded poles where uniform fit matters."),
            ("How do I specify diameter?",
             "For Postes Naturales, give the minimum top diameter and the length. For Perfectos Redondos, give the constant diameter and the length. If you have a drawing or a photo of the build, send it with the request."),
        ],
        "closing": closing("en"),
    },
    "es": {
        "path": "/es/materiales/postes-de-madera/",
        "title": "Postes de madera: Postes Naturales y Perfectos Redondos | post.supply",
        "description": "Pide cotizaciones con precio entregado de postes de madera: Postes Naturales, sin corteza y con su conicidad natural, y Perfectos Redondos, de diámetro constante.",
        "crumb": "Postes de madera",
        "eyebrow": "post.supply · Materiales · Postes de madera",
        "h1": "Postes de madera, cotizados hasta tu puerta.",
        "lead": "Dos líneas: Postes Naturales, sin corteza y con la conicidad natural del árbol, y Perfectos Redondos, con diámetro constante. Envía largo, diámetro y cantidad. Te devolvemos ofertas comparables y un solo precio entregado.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Tipos", "h2": "Dos tipos de poste.",
             "body": ruled([
                 ("Postes Naturales", "Postes sin corteza que mantienen la conicidad natural del árbol. Para verjas, pérgolas, ranchones y paisajismo."),
                 ("Perfectos Redondos", "Postes maquinados con un diámetro constante en todo su largo. Para barandas, estructuras uniformes y obras donde cada poste tiene que cuadrar."),
             ])},
            {"label": "02 · Especifica", "band": True, "h2": "Qué incluir en una solicitud de postes.",
             "body": checklist(["Postes Naturales o Perfectos Redondos", "Largo", "Diámetro: diámetro de la punta en los naturales, diámetro constante en los redondos", "Uso: en contacto con el suelo, a la intemperie o bajo techo", "Tratamiento o especie, si lo requieres", "Cantidad", "Destino y fecha en que lo necesitas"])},
        ],
        "faq_label": "03 · Preguntas", "faq_h2": "Preguntas sobre postes de madera.",
        "faqs": [
            ("¿Los postes vienen tratados?",
             "El tratamiento depende de la oferta. Dinos si los postes estarán en contacto con el suelo, a la intemperie o bajo techo, y cada cotización indicará la especie y el tratamiento, si tiene, para que lo ajustes al uso."),
            ("¿Cuál es la diferencia entre Postes Naturales y Perfectos Redondos?",
             "Los Postes Naturales mantienen la conicidad natural del árbol, así que el diámetro es mayor en la base que en la punta. Los Perfectos Redondos se maquinan con un solo diámetro de punta a punta, así que todos cuadran. Escoge los naturales para un aspecto orgánico y los redondos donde importa que todo encaje igual."),
            ("¿Cómo especifico el diámetro?",
             "Para Postes Naturales, indica el diámetro mínimo de la punta y el largo. Para Perfectos Redondos, indica el diámetro constante y el largo. Si tienes un dibujo o una foto de la obra, envíalo con la solicitud."),
        ],
        "closing": closing("es"),
    },
})

# CONTACT -------------------------------------------------------------------------
PAGES.append({
    "id": "contact", "parent": "home",
    "en": {
        "path": "/contact/",
        "title": "Contact post.supply: get building materials prices",
        "description": "Get delivered-price quotes for building materials. Leave your mobile number for a reply by text or WhatsApp, or email your list to team@post.supply.",
        "crumb": "Contact",
        "eyebrow": "post.supply · Contact",
        "h1": "Get prices.",
        "lead": "Leave your mobile number and we will reach out by text or WhatsApp. Or email your list, in any format, to team@post.supply.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Email", "h2": "Send anything.",
             "body": p('A list, a photo, a PDF takeoff, a spreadsheet or a purchase order. Email it to <a href="mailto:team@post.supply">team@post.supply</a> and include where it needs to be delivered.')},
            {"label": "02 · Suppliers", "band": True, "h2": "Are you a supplier?",
             "body": p('Read <a href="/suppliers/">how a trial works</a>, or email <a href="mailto:team@post.supply?subject=Supplier%20trial">team@post.supply</a> with the subject “Supplier trial”.')},
        ],
        "closing": None,
    },
    "es": {
        "path": "/es/contacto/",
        "title": "Contacto post.supply: recibe precios de materiales",
        "description": "Recibe cotizaciones con precio entregado de materiales de construcción. Deja tu celular y te contestamos por texto o WhatsApp, o envía tu lista a team@post.supply.",
        "crumb": "Contacto",
        "eyebrow": "post.supply · Contacto",
        "h1": "Recibe precios.",
        "lead": "Deja tu número de celular y te contactamos por texto o WhatsApp. O envía tu lista, en cualquier formato, a team@post.supply.",
        "form": "buyer",
        "sections": [
            {"label": "01 · Email", "h2": "Envía lo que tengas.",
             "body": p('Una lista, una foto, un PDF de cantidades, una hoja de cálculo o una orden de compra. Envíala a <a href="mailto:team@post.supply">team@post.supply</a> e incluye dónde hay que entregarla.')},
            {"label": "02 · Suplidores", "band": True, "h2": "¿Eres suplidor?",
             "body": p('Lee <a href="/es/suplidores/">cómo funciona una prueba</a>, o escribe a <a href="mailto:team@post.supply?subject=Prueba%20para%20suplidores">team@post.supply</a> con el asunto “Prueba para suplidores”.')},
        ],
        "closing": None,
    },
})

# PRIVACY -------------------------------------------------------------------------
PAGES.append({
    "id": "privacy", "parent": "home",
    "en": {
        "path": "/privacy/",
        "title": "Privacy notice: how we handle your request | post.supply",
        "description": "How post.supply collects, uses and protects the information you send with a building materials request, and what you can ask us to do with it.",
        "crumb": "Privacy",
        "eyebrow": "post.supply · Privacy",
        "h1": "Privacy notice.",
        "lead": "What we collect when you send a request, why, and what you can ask us to do with it.",
        "updated": "2026-10-14",
        "sections": [
            {"label": "01 · Collect", "h2": "What we collect.", "body": p("What you send us: your mobile number, name, company, the materials you need, delivery details, and any files or messages you share. We also receive basic technical data that any website receives, such as your browser type, to keep the site working.")},
            {"label": "02 · Use", "h2": "Why we use it.", "body": p("To answer your request, prepare quotes, coordinate orders and deliveries, and keep records of what was agreed.")},
            {"label": "03 · Share", "h2": "Who sees it.", "body": p("Suppliers, carriers and service providers, only as far as needed to quote and fulfil your request. We do not sell your information.")},
            {"label": "04 · Messages", "h2": "Texts, WhatsApp and calls.", "body": p("If you give us your number, we may contact you by text message, WhatsApp or phone about your request. Message and data rates may apply. Reply STOP to stop texts at any time.")},
            {"label": "05 · Cookies", "h2": "Cookies.", "body": p("This site does not use advertising or tracking cookies. If you switch to the dark theme, that choice is saved in your browser.")},
            {"label": "06 · Choices", "h2": "Your choices.", "body": p('You can ask us to show, correct or delete the information we hold about you. Email <a href="mailto:team@post.supply">team@post.supply</a>.')},
            {"label": "07 · Changes", "h2": "Changes.", "body": p("If this notice changes, we will update the date on this page.")},
        ],
        "closing": None,
    },
    "es": {
        "path": "/es/privacidad/",
        "title": "Aviso de privacidad: cómo manejamos tu solicitud | post.supply",
        "description": "Cómo post.supply recopila, usa y protege la información que envías con una solicitud de materiales, y qué nos puedes pedir que hagamos con ella.",
        "crumb": "Privacidad",
        "eyebrow": "post.supply · Privacidad",
        "h1": "Aviso de privacidad.",
        "lead": "Qué recopilamos cuando envías una solicitud, para qué, y qué nos puedes pedir que hagamos con eso.",
        "updated": "2026-10-14",
        "sections": [
            {"label": "01 · Recopilamos", "h2": "Qué recopilamos.", "body": p("Lo que nos envías: tu número de celular, nombre, empresa, los materiales que necesitas, los datos de entrega y cualquier archivo o mensaje que compartas. También recibimos datos técnicos básicos que recibe cualquier sitio web, como el tipo de navegador, para que el sitio funcione.")},
            {"label": "02 · Uso", "h2": "Para qué lo usamos.", "body": p("Para contestar tu solicitud, preparar cotizaciones, coordinar pedidos y entregas, y guardar constancia de lo acordado.")},
            {"label": "03 · Compartimos", "h2": "Quién lo ve.", "body": p("Suplidores, transportistas y proveedores de servicios, solo en la medida necesaria para cotizar y cumplir tu solicitud. No vendemos tu información.")},
            {"label": "04 · Mensajes", "h2": "Textos, WhatsApp y llamadas.", "body": p("Si nos das tu número, podemos contactarte por mensaje de texto, WhatsApp o llamada sobre tu solicitud. Pueden aplicar cargos de mensajes y datos. Responde STOP para dejar de recibir textos cuando quieras.")},
            {"label": "05 · Cookies", "h2": "Cookies.", "body": p("Este sitio no usa cookies de publicidad ni de rastreo. Si cambias al tema oscuro, esa preferencia se guarda en tu navegador.")},
            {"label": "06 · Opciones", "h2": "Tus opciones.", "body": p('Puedes pedirnos que te mostremos, corrijamos o borremos la información que tenemos sobre ti. Escribe a <a href="mailto:team@post.supply">team@post.supply</a>.')},
            {"label": "07 · Cambios", "h2": "Cambios.", "body": p("Si este aviso cambia, actualizaremos la fecha en esta página.")},
        ],
        "closing": None,
    },
})

# THANKS (noindex, no-JS form fallback target) ---------------------------------
PAGES.append({
    "id": "thanks", "parent": None, "noindex": True,
    "en": {"path": "/thanks/", "title": "Request received | post.supply", "description": "Your request was received.",
           "crumb": "Thanks", "eyebrow": "post.supply · Received", "h1": "Got it.",
           "lead": 'We will reach out on the number you gave us. Have a list, photo or PDF? Email it to <a href="mailto:team@post.supply">team@post.supply</a>.',
           "sections": [], "closing": None},
    "es": {"path": "/es/gracias/", "title": "Solicitud recibida | post.supply", "description": "Recibimos tu solicitud.",
           "crumb": "Gracias", "eyebrow": "post.supply · Recibido", "h1": "Recibido.",
           "lead": 'Te contactamos al número que nos diste. ¿Tienes una lista, foto o PDF? Envíala a <a href="mailto:team@post.supply">team@post.supply</a>.',
           "sections": [], "closing": None},
})

# Map page id -> slug per language, for nav
def path_of(pid, lang):
    for pg in PAGES:
        if pg["id"] == pid:
            return pg[lang]["path"]
    raise KeyError(pid)
