const express = require("express");
const path = require("path");
const scraper = require("./scraper");

const app = express();
const port = 3001;

// Servir archivos estáticos (CSS, JS, HTML)
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para manejar la solicitud de scraping
app.post("/scrape", async (req, res) => {
  const { categoriaSelector, subcategoriaSelector, nombreArchivo } = req.body;

  console.log("Datos recibidos:", req.body); // Verifica los datos recibidos

  try {
    await scraper.scrape({
      categoriaSelector,
      subcategoriaSelector,
      nombreArchivo,
    });
    res.send("Scraping completado.");
  } catch (error) {
    console.error("Error durante el scraping:", error); // Detalles del error en el servidor
    res.status(500).send(`Error durante el scraping: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
