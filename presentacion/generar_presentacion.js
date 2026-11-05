// Presentación de la parte individual (estilo Swiss International, igual que la grupal).
// Uso: python presentacion/formulas.py && node presentacion/generar_presentacion.js
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = path.resolve(__dirname, "..");
const FIG = (f) => path.join(RAIZ, "figuras", f);
const FORM = (f) => path.join(__dirname, "formulas", f + ".png");

const ROJO = "E8000D", NEGRO = "111111", GRIS = "444444", LINEA = "DDDDDD", BLANCO = "FFFFFF", GRIS_CLARO = "9A9A9A";
const SANS = "Arial", MONO = "Courier New";
const X0 = 0.7, ANCHO = 11.93;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Grafo de colaboración de Samuel L. Jackson";
pres.author = "Rodolfo Flores";
pres.theme = { headFontFace: SANS, bodyFontFace: SANS };

pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: BLANCO },
  objects: [
    { rect: { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ROJO }, line: { color: ROJO } } },
    { line: { x: X0, y: 1.42, w: ANCHO, h: 0, line: { color: LINEA, width: 1 } } },
    { text: { text: "GRAFO DE COLABORACIÓN · SAMUEL L. JACKSON · RODOLFO FLORES · UNIS 2026",
              options: { x: X0, y: 6.85, w: 9, h: 0.3, fontFace: MONO, fontSize: 9, color: GRIS_CLARO, charSpacing: 3, margin: 0 } } },
    { placeholder: { options: { name: "kicker", type: "body", x: X0, y: 0.32, w: ANCHO, h: 0.3, fontFace: MONO, fontSize: 10,
                                color: ROJO, charSpacing: 4, bold: true, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.62, w: ANCHO, h: 0.72, fontFace: SANS, fontSize: 30,
                                bold: true, color: NEGRO, margin: 0, valign: "middle", align: "left" }, text: "" } },
  ],
  slideNumber: { x: 12.33, y: 6.85, w: 0.52, h: 0.26, fontFace: SANS, fontSize: 10, color: ROJO, bold: true, align: "center" },
});
pres.defineSlideMaster({
  title: "PORTADA",
  background: { color: BLANCO },
  objects: [
    { rect: { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ROJO }, line: { color: ROJO } } },
    { line: { x: X0, y: 4.35, w: ANCHO, h: 0, line: { color: LINEA, width: 1 } } },
  ],
});

// ------------------------------------------------------------------ utilidades
function circulo(s, x, y, d, grosor) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: BLANCO, transparency: 100 }, line: { color: ROJO, width: grosor } });
}
function nueva(kicker, titulo, notas) {
  const s = pres.addSlide({ masterName: "CONTENIDO" });
  circulo(s, 12.33, 6.72, 0.52, 1.5);
  s.addText(kicker.toUpperCase(), { placeholder: "kicker" });
  s.addText(titulo, { placeholder: "title" });
  if (notas) s.addNotes(notas);
  return s;
}
function etiqueta(s, texto, x, y, w, color = GRIS) {
  s.addText(texto.toUpperCase(), { x, y, w, h: 0.28, fontFace: MONO, fontSize: 9.5, color, charSpacing: 3, bold: true, margin: 0, isTextBox: true });
}
function regla(s, x, y, w) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: LINEA, width: 1 } });
}
function cuerpo(s, items, x, y, w, h, fontSize = 14.5, vinetas = true) {
  const runs = items.map((t, i) => {
    const partes = Array.isArray(t) ? t : [{ text: t }];
    return partes.map((p, j) => ({ text: p.text, options: {
      bold: !!p.bold, color: p.color || NEGRO, breakLine: j === partes.length - 1 && i < items.length - 1,
      bullet: j === 0 && vinetas ? { indent: 14 } : undefined, paraSpaceAfter: 7 } }));
  }).flat();
  s.addText(runs, { x, y, w, h, fontFace: SANS, fontSize, color: NEGRO, valign: "top", margin: 0, isTextBox: true });
}
function cifra(s, valor, texto, x, y, w, color = NEGRO) {
  s.addText(valor, { x, y, w, h: 0.85, fontFace: SANS, fontSize: 42, bold: true, color, margin: 0, isTextBox: true });
  s.addText(texto, { x, y: y + 0.88, w, h: 0.7, fontFace: SANS, fontSize: 12.5, color: GRIS, margin: 0, valign: "top", isTextBox: true });
}
function tabla(s, filas, x, y, w, colW, fs = 13, rowH = 0.38) {
  const datos = filas.map((fila, i) => fila.map((c) => {
    const b = typeof c === "object" ? c : { text: String(c) };
    return { text: b.text, options: {
      bold: i === 0 || !!b.bold, color: i === 0 ? GRIS : (b.color || NEGRO), fontFace: i === 0 ? MONO : SANS,
      fontSize: i === 0 ? 9.5 : fs, charSpacing: i === 0 ? 2 : 0, margin: [4, 6, 4, 0], valign: "middle",
      border: [{ type: "none" }, { type: "none" }, { pt: i === 0 ? 1.2 : 0.6, color: i === 0 ? NEGRO : LINEA }, { type: "none" }] } };
  }));
  s.addTable(datos, { x, y, w, colW, rowH });
}
function formula(s, nombre, x, y, wMax, escala = 0.75) {
  const buf = fs.readFileSync(FORM(nombre));
  let w = (buf.readUInt32BE(16) / 200) * escala, h = (buf.readUInt32BE(20) / 200) * escala;
  if (w > wMax) { h *= wMax / w; w = wMax; }
  s.addImage({ path: FORM(nombre), x, y, w, h, altText: nombre });
  return y + h;
}
function imagen(s, archivo, x, y, wMax, hMax) {
  const buf = fs.readFileSync(FIG(archivo));
  const r = buf.readUInt32BE(16) / buf.readUInt32BE(20);
  let w = wMax, h = w / r;
  if (h > hMax) { h = hMax; w = h * r; }
  s.addImage({ path: FIG(archivo), x, y, w, h });
  return { w, h };
}

// ------------------------------------------------------------------ 1 portada
{
  const s = pres.addSlide({ masterName: "PORTADA" });
  circulo(s, 10.9, 4.9, 1.7, 2.5);
  s.addText("ANÁLISIS Y CIENCIA DE DATOS · PARTE INDIVIDUAL", { x: X0, y: 1.0, w: 10, h: 0.3, fontFace: MONO, fontSize: 11,
    color: ROJO, charSpacing: 4, bold: true, margin: 0, isTextBox: true });
  s.addText("Grafo de colaboración de Samuel L. Jackson", { x: X0, y: 1.45, w: 11.5, h: 1.9, fontFace: SANS, fontSize: 48,
    bold: true, color: NEGRO, margin: 0, valign: "top", isTextBox: true });
  s.addText("Un grafo de colaboración es un kernel: construirlo con TMDB y leerlo con el espectro de su Laplaciano",
    { x: X0, y: 3.3, w: 10.5, h: 0.8, fontFace: SANS, fontSize: 18, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  s.addText([{ text: "Rodolfo Flores", options: { bold: true, color: NEGRO, breakLine: true } },
             { text: "Facultad de Ingeniería, Universidad del Istmo de Guatemala", options: { color: GRIS, breakLine: true } },
             { text: "6 de noviembre de 2026", options: { color: GRIS } }],
    { x: X0, y: 4.65, w: 9, h: 1.2, fontFace: SANS, fontSize: 15, margin: 0, valign: "top", isTextBox: true });
  s.addText("A = BBᵀ", { x: 10.9, y: 5.38, w: 1.7, h: 0.74, fontFace: SANS, fontSize: 20, bold: true, color: ROJO,
    align: "center", valign: "middle", margin: 0, isTextBox: true });
}

// ------------------------------------------------------------------ 2 el puente
{
  const s = nueva("El puente con la parte grupal", "Un grafo de colaboración es un kernel",
    "B es la matriz actores por películas. A = BBᵀ cuenta películas compartidas: dos actores se parecen si salen en las mismas películas, igual que dos filas se parecen en el bosque si caen en las mismas hojas. Cada película hace el papel de una hoja.");
  let y = formula(s, "B", X0, 1.75, ANCHO);
  y = formula(s, "A", X0, y + 0.25, ANCHO);
  y = formula(s, "bosque", X0, y + 0.3, ANCHO);
  regla(s, X0, y + 0.3, ANCHO);
  const cols = [["Bosque (grupal)", "Filas de entrenamiento que caen en la misma hoja de un árbol."],
                ["Grafo (individual)", "Actores que salen en la misma película."],
                ["Espectro", "Igual que Sudjianto con el bosque: buscar regiones donde el kernel conecta poco."]];
  cols.forEach(([t, d], i) => {
    const x = X0 + i * 4.05;
    etiqueta(s, t, x, y + 0.5, 3.7, ROJO);
    s.addText(d, { x, y: y + 0.85, w: 3.7, h: 1.0, fontFace: SANS, fontSize: 14, color: GRIS, margin: 0, valign: "top", isTextBox: true });
  });
}

// ------------------------------------------------------------------ 3 construcción
{
  const s = nueva("I.4 · Construcción", "Del API de TMDB a 377 actores",
    "Una película cuenta para un actor si salió entre 1975 y 2025 y el actor tiene order menor que 5. (a) semilla; (b) elenco principal de cada película que cuenta para la semilla; (c) para cada nodo, sus créditos; cada película que cuenta para dos nodos agrega o refuerza su arista, una sola vez por película y pareja.");
  cifra(s, "108", "películas cuentan para Jackson (1975–2025, order < 5)", X0, 1.7, 2.8, ROJO);
  cifra(s, "377", "actores (nodos) tras el paso (b)", X0 + 3.05, 1.7, 2.8);
  cifra(s, "2 666", "aristas; peso total 2 984 películas compartidas", X0 + 6.1, 1.7, 2.8);
  cifra(s, "371", "grado de la semilla; le sigue Bruce Willis con 54", X0 + 9.15, 1.7, 2.8);
  regla(s, X0, 3.55, ANCHO);
  etiqueta(s, "Pasos", X0, 3.75, 5.6);
  cuerpo(s, ["limit = 5, ventana 1975-01-01 a 2025-12-31",
             "(a) la semilla; (b) elenco con order < 5 de cada película que cuenta para ella",
             "(c) créditos de cada nodo: una arista por película y por pareja, sin nodos nuevos",
             "Sin documentales (género 99) ni papeles de sí mismo (Himself / Herself / Self)"], X0, 4.1, 5.6, 2.6, 13.5);
  etiqueta(s, "Aristas más pesadas", 6.9, 3.75, 5.7);
  tabla(s, [["Pareja", "Películas"], ["Vin Diesel – Michelle Rodriguez", "8"], ["Eddie Murphy – Antonio Banderas", "8"],
            ["Chris Evans – Scarlett Johansson", "7"], [{ text: "Bruce Willis – Samuel L. Jackson", bold: true }, "5"]],
    6.9, 4.1, 5.7, [4.5, 1.2], 13, 0.4);
}

// ------------------------------------------------------------------ 4 implementación
{
  const s = nueva("I.2 – I.3 · Implementación", "Dos clases: Graph y TMDBAPIUtils",
    "Graph guarda las aristas con clave (min, max) para que (a,b) y (b,a) sean la misma; add_edge suma 1 si ya existe. max_degree_nodes devuelve todos los empatados. adjacency devuelve A y el orden de los id. TMDBAPIUtils guarda cada respuesta en un JSON y la lee de ahí: el notebook corre sin API key.");
  etiqueta(s, "Graph (grafo.py)", X0, 1.7, 5.6, ROJO);
  cuerpo(s, ["add_node((id, nombre)): solo si el id no existe",
             "add_edge(a, b): clave (min, max), peso + 1 si ya existe",
             "total_nodes(), total_edges()",
             "max_degree_nodes(): {id: grado} con todos los empatados",
             "adjacency(): (A con pesos, lista de id en el orden de las filas)"], X0, 2.05, 5.6, 3.5, 14);
  etiqueta(s, "TMDBAPIUtils (tmdb_utils.py)", 6.9, 1.7, 5.7, ROJO);
  cuerpo(s, ["get_movie_cast(movie_id, limit, exclude_ids): 0 ≤ order ≤ limit − 1",
             "get_movie_credits_for_person(person_id, start_date, end_date): id, title, release_date, order",
             "Filtro de fechas propio (YYYY-MM-DD), sin documentales ni papeles de sí mismo",
             "Cache: cada respuesta es un JSON en cache/ (486 archivos)",
             "La API key se lee de TMDB_API_KEY; nunca va al repositorio"], 6.9, 2.05, 5.7, 3.5, 14);
  regla(s, X0, 5.75, ANCHO);
  cuerpo(s, [[{ text: "Prueba: ", bold: true }, { text: "3 nodos, (1,2) dos veces y (2,1) cuenta como la misma arista → A₁₂ = 2, A simétrica." }]],
    X0, 5.9, ANCHO, 0.6, 13.5, false);
}

// ------------------------------------------------------------------ 5 visualización
{
  const s = nueva("I.5 · Visualización", "La semilla en el centro, todos a un paso",
    "Layout de resorte con pesos. Tamaño y color por grado, grosor por películas compartidas. Se ven la semilla como hub y una periferia de actores que solo la tocan a ella.");
  const { w } = imagen(s, "grafo.png", X0, 1.6, 6.6, 5.1);
  const x = X0 + w + 0.35, wt = ANCHO - w - 0.35;
  etiqueta(s, "Mayor grado", x, 1.75, wt);
  tabla(s, [["Actor", "Grado", "Ponderado"], [{ text: "Samuel L. Jackson", bold: true }, "371", "415"], ["Bruce Willis", "54", "71"],
            ["Robert De Niro", "45", "56"], ["Nicolas Cage", "44", "59"], ["Julianne Moore", "43", "47"],
            ["Danny Glover", "42", "48"], ["Morgan Freeman", "41", "50"]], x, 2.1, wt, [wt - 2.2, 1.0, 1.2], 13, 0.4);
}

// ------------------------------------------------------------------ 6 Laplacianos
{
  const s = nueva("I.6 · Espectro", "Laplaciano y Laplaciano normalizado",
    "La forma cuadrática explica por qué hay un valor propio cero por componente: vᵀLv = 0 obliga a v constante dentro de cada componente. Nodo aislado: d = 0 y D^(-1/2) no existe; si ponemos 0, la fila de L_sym queda como la de la identidad y da valor propio 1, no 0. Convención: L_sym = D^(-1/2) L D^(-1/2) con 0 en esa entrada; así el aislado da 0 y el conteo cuadra.");
  let y = formula(s, "L", X0, 1.75, ANCHO);
  y = formula(s, "Lsym", X0, y + 0.25, ANCHO);
  y = formula(s, "cuadratica", X0, y + 0.25, ANCHO);
  y = formula(s, "componentes", X0, y + 0.25, ANCHO);
  regla(s, X0, y + 0.25, ANCHO);
  etiqueta(s, "Nodos aislados (sin vecinos)", X0, y + 0.45, 6, ROJO);
  formula(s, "convencion", X0, y + 0.8, ANCHO);
}

// ------------------------------------------------------------------ 7 componentes
{
  const s = nueva("I.6 (a) · Componentes", "Tres actores aislados, incluso con la semilla",
    "Kendrick Lamar, Serena Williams y Mustard salen en el elenco principal de una película de Jackson, pero en sus propios créditos se interpretan a sí mismos, así que la película no cuenta para ellos y el paso (c) no les da aristas. Sin la semilla se separan además 4 actores italianos de The Red Violin.");
  tabla(s, [["Grafo", "Nodos", "Aislados", "BFS", "λ<1e-8 ingenuo", "λ<1e-8 corregido", "networkx"],
            ["Con semilla", "377", "3", "4", { text: "1", color: ROJO, bold: true }, "4", "4"],
            ["Sin semilla", "376", "3", "5", { text: "2", color: ROJO, bold: true }, "5", "5"]],
    X0, 1.75, ANCHO, [1.9, 1.2, 1.4, 1.2, 2.2, 2.4, 1.63], 15, 0.5);
  regla(s, X0, 3.55, ANCHO);
  cifra(s, "3", "aislados: Kendrick Lamar, Serena Williams, Mustard (papel de sí mismos)", X0, 3.8, 3.7, ROJO);
  cifra(s, "−3", "lo que pierde el conteo ingenuo: exactamente los aislados", X0 + 4.1, 3.8, 3.7);
  cifra(s, "4", "italianos de The Red Violin forman su propia componente sin la semilla", X0 + 8.2, 3.8, 3.7);
}

// ------------------------------------------------------------------ 8 brecha
{
  const s = nueva("I.6 (b) · Brecha espectral", "λ₂ = 0 con la semilla; 0.247 en su componente",
    "Con semilla λ2 = 0 porque el grafo no es conexo (los 3 aislados): cuatro ceros y la mayor brecha en k = 4. Sin semilla, cinco ceros. En la componente de la semilla λ2 = 0.247. La brecha delata comunidades aunque el grafo sea conexo porque L_sym divide cada arista entre la raíz de los grados y la semilla tiene grado ponderado 415: sus aristas pesan poco.");
  const { h } = imagen(s, "espectro.png", X0, 1.6, ANCHO, 3.6);
  formula(s, "brecha", X0, 1.6 + h + 0.15, 6);
  cuerpo(s, ["Con semilla: λ₁ = λ₂ = λ₃ = λ₄ = 0 → k = 4 (tres aislados + resto)",
             "Componente de la semilla (374): λ₂ = 0.247; siguiente brecha en k = 2",
             "La semilla tiene grado ponderado 415: en L_sym sus aristas pesan poco y los grupos que solo se unen por ella casi se separan"],
    6.9, 1.6 + h + 0.1, 5.7, 1.6, 12.5);
}

// ------------------------------------------------------------------ 9 clustering
{
  const s = nueva("I.6 (c) · Clustering espectral", "Comunidades: un país, una época, una industria",
    "Ng, Jordan y Weiss: k vectores propios más pequeños, filas normalizadas a norma 1, k-means. Lo aplicamos a la componente de la semilla porque los aislados cuentan como comunidades de un actor. Con k = 2 se separan los italianos de The Red Violin. Con k = 3 aparecen el Hollywood comercial, el núcleo de Jackson de los 90 y el cine afroamericano de los 90 y 2000.");
  let y = formula(s, "njw", X0, 1.7, ANCHO);
  etiqueta(s, "k = 2 (mayor brecha con k ≥ 2): un país", X0, y + 0.3, ANCHO, ROJO);
  tabla(s, [["n", "Actores de mayor grado", "Películas más repetidas"],
            ["4", "Carlo Cecchi, Irene Grazioli, Anita Laurenzi", "The Red Violin (1998) ×4"]], X0, y + 0.62, ANCHO, [0.8, 5.2, 5.93], 12.5, 0.36);
  etiqueta(s, "k = 3: épocas e industrias", X0, y + 1.55, ANCHO, ROJO);
  tabla(s, [["n", "Actores de mayor grado", "Películas más repetidas"],
            ["187", "Robert De Niro, Nicolas Cage, Julianne Moore", "Spider-Man: Homecoming · Snakes on a Plane · Hero"],
            ["115", "Samuel L. Jackson, Bruce Willis, Danny Glover", "Pulp Fiction · The Great White Hype · Against the Wall"],
            ["72", "Wesley Snipes, Giancarlo Esposito, Lynn Whitfield", "Coach Carter · Menace II Society · Fresh"]],
    X0, y + 1.87, ANCHO, [0.8, 5.2, 5.93], 12.5, 0.36);
}

// ------------------------------------------------------------------ 10 comunidades figura
{
  const s = nueva("I.6 (c) · Comunidades", "Las tres comunidades sobre el grafo",
    "Azul: Hollywood comercial. Naranja: núcleo de Jackson de los 90. Verde: cine afroamericano de los 90 y 2000. Gris: los tres aislados.");
  const { w } = imagen(s, "comunidades.png", X0, 1.6, 7.0, 5.1);
  const x = X0 + w + 0.35, wt = ANCHO - w - 0.35;
  cuerpo(s, [[{ text: "Azul · ", bold: true, color: "1F77B4" }, { text: "Hollywood comercial 2000–2010 (187)" }],
             [{ text: "Naranja · ", bold: true, color: "FF7F0E" }, { text: "núcleo de Jackson en los 90 (115)" }],
             [{ text: "Verde · ", bold: true, color: "2CA02C" }, { text: "cine afroamericano de los 90 y 2000 (72)" }],
             [{ text: "Gris · ", bold: true, color: GRIS_CLARO }, { text: "aislados por la regla de “sí mismo”" }]],
    x, 1.9, wt, 3, 14);
}

// ------------------------------------------------------------------ 11 Fiedler
{
  const s = nueva("I.6 (d) · Vector de Fiedler", "El corte separa al cine afroamericano del comercial",
    "Sin la semilla, en la componente más grande (369 actores), el signo del vector propio de λ2 separa 318 actores del Hollywood comercial de 51 del cine afroamericano e independiente. Solo 344 de 2 289 aristas cruzan; las más pesadas son colaboraciones puntuales entre los dos mundos.");
  formula(s, "fiedler", X0, 1.7, ANCHO);
  cifra(s, "318", "lado + : Willis, De Niro, Cage, Moore, Freeman, Ed Harris", X0, 2.55, 3.7);
  cifra(s, "51", "lado − : Glover, Rhames, Snipes, Angela Bassett, Perlman, Schreiber", X0 + 4.1, 2.55, 3.7, ROJO);
  cifra(s, "15 %", "de las aristas cruzan (344 de 2 289); λ₂ = 0.154", X0 + 8.2, 2.55, 3.7);
  regla(s, X0, 4.45, ANCHO);
  etiqueta(s, "Películas de cada lado", X0, 4.6, 6);
  cuerpo(s, ["+ : Lucky Number Slevin, Spider-Man: Homecoming, The Protégé, Snakes on a Plane",
             "− : Fresh, Chi-Raq, Spike & Co.: Do It a Cappella, Monkeybone, Kiss of Death"], X0, 4.95, 6.0, 1.6, 13.5);
  etiqueta(s, "Aristas que cruzan (más pesadas)", 6.9, 4.6, 5.7);
  cuerpo(s, ["Eddie Murphy – Antonio Banderas (8)", "Jada Pinkett Smith – Chris Rock (5)", "Bruce Willis – Ving Rhames (2)"],
    6.9, 4.95, 5.7, 1.6, 13.5);
}

// ------------------------------------------------------------------ 12 centralidad
{
  const s = nueva("I.6 (e) · Centralidad", "Grado contra vector propio: 3 de 5 en común",
    "El grado cuenta colaboradores distintos. La centralidad de vector propio resuelve Av = λmax v: un actor es central si sus vecinos son centrales y si repite películas con ellos. Por eso entran Travolta y Freeman, que repiten con Jackson y con los nodos de mayor grado.");
  formula(s, "centralidad", X0, 1.7, ANCHO);
  tabla(s, [["#", "Mayor grado", "Mayor centralidad de vector propio"],
            ["1", "Samuel L. Jackson (371)", "Samuel L. Jackson (1.000)"], ["2", "Bruce Willis (54)", "Bruce Willis (0.372)"],
            ["3", "Robert De Niro (45)", "Nicolas Cage (0.255)"], ["4", "Nicolas Cage (44)", { text: "John Travolta (0.229)", color: ROJO, bold: true }],
            ["5", "Julianne Moore (43)", { text: "Morgan Freeman (0.223)", color: ROJO, bold: true }]],
    X0, 2.6, 7.4, [0.5, 3.3, 3.6], 14, 0.45);
  etiqueta(s, "Qué mide cada una", 8.5, 2.6, 4.1, ROJO);
  cuerpo(s, ["Grado: alcance directo, cuántos coprotagonistas distintos",
             "Vector propio: importancia de los contactos, usando pesos (películas repetidas)",
             "Verificado contra networkx en la componente principal (dif. 9·10⁻¹⁶)"], 8.5, 2.95, 4.1, 3.2, 13.5);
}

// ------------------------------------------------------------------ 13 A = BB^T
{
  const s = nueva("I.7 · El puente", "BBᵀ coincide con A; su diagonal cuenta películas",
    "B tiene 377 filas (actores) y 10 334 columnas (películas que cuentan para al menos un actor). Fuera de la diagonal BBᵀ es exactamente A. La diagonal es el número de películas que cuentan para cada actor: su grado en el grafo bipartito. Analogía: cada película es una hoja; el bosque normaliza por el tamaño de la hoja y aquí normaliza L_sym.");
  let y = formula(s, "A", X0, 1.7, ANCHO);
  y = formula(s, "diag", X0, y + 0.25, ANCHO);
  cifra(s, "377 × 10 334", "dimensiones de B (actores × películas)", X0, y + 0.4, 4.2, ROJO);
  cifra(s, "BBᵀ = A", "fuera de la diagonal: verificado exactamente", X0 + 4.6, y + 0.4, 3.5);
  cifra(s, "142", "diagonal más grande: Corbin Bernsen (Glover 127, Jackson 108)", X0 + 8.5, y + 0.4, 3.4);
  regla(s, X0, y + 2.2, ANCHO);
  cuerpo(s, [[{ text: "Analogía: ", bold: true }, { text: "en el bosque, dos filas se parecen si comparten hojas; aquí, dos actores si comparten películas. El bosque divide entre |hoja| para que el voto sume 1; aquí L_sym descuenta a los actores con muchas películas. El espectro de ambos kernels señala dónde la conexión (la evidencia) es débil." }]],
    X0, y + 2.35, ANCHO, 1.3, 14, false);
}

// ------------------------------------------------------------------ 14 cierre
{
  const s = pres.addSlide({ masterName: "PORTADA" });
  circulo(s, 10.9, 4.9, 1.7, 2.5);
  s.addText("CONCLUSIONES", { x: X0, y: 0.9, w: 10, h: 0.3, fontFace: MONO, fontSize: 11, color: ROJO, charSpacing: 4, bold: true, margin: 0, isTextBox: true });
  s.addText("Gracias", { x: X0, y: 1.3, w: 11.5, h: 1.2, fontFace: SANS, fontSize: 56, bold: true, color: NEGRO, margin: 0, isTextBox: true });
  cuerpo(s, ["El grafo es un kernel: A = BBᵀ cuenta películas compartidas, igual que el bosque cuenta hojas compartidas",
             "La regla de excluir papeles de sí mismo rompe la conexidad: 3 aislados y λ₂ = 0",
             "El espectro encuentra comunidades reales: un país (The Red Violin), épocas e industrias",
             "Grado y vector propio miden cosas distintas: alcance contra importancia de los contactos"],
    X0, 2.7, 9.8, 1.6, 15);
  s.addText("?", { x: 10.9, y: 4.9, w: 1.7, h: 1.7, fontFace: SANS, fontSize: 54, bold: true, color: ROJO, align: "center",
    valign: "middle", margin: 0, isTextBox: true });
}

pres.writeFile({ fileName: path.join(__dirname, "presentacion.pptx") }).then((f) => console.log(f));
