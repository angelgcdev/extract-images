document
  .getElementById("scrapeForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const categoriaSelector =
      document.getElementById("categoriaSelector").value;
    const subcategoriaSelector = document.getElementById(
      "subcategoriaSelector"
    ).value;
    const nombreArchivo = document.getElementById("nombreArchivo").value;

    const response = await fetch("/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoriaSelector,
        subcategoriaSelector,
        nombreArchivo,
      }),
    });

    if (response.ok) {
      alert("Scraping completado.");
    } else {
      alert("Error durante el scraping.");
    }
  });
