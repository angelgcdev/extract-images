const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function scrape({
  categoriaSelector,
  subcategoriaSelector,
  nombreArchivo,
}) {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Navegar a la página
    await page.goto(
      "http://sij.usfx.bo/elibro/principal.usfx?cu=null&ca=INV&idLibro=null"
    );
    await page.waitForTimeout(5000);

    // Función para seleccionar una categoría
    const seleccionarCategoria = async (selector) => {
      try {
        await page.waitForSelector(selector);
        await page.click(selector);
        await page.waitForTimeout(5000);
      } catch (error) {
        console.error(
          `Error al seleccionar el elemento con el selector ${selector}:`,
          error
        );
        throw error;
      }
    };

    // Ir a la categoría y subcategoría
    await seleccionarCategoria(categoriaSelector);
    await seleccionarCategoria(subcategoriaSelector);

    //--------------------------------------------------------
    // Obtener el total de páginas

    await page.waitForSelector("#j_idt130\\:_t142");
    const textoTotalPaginas = await page.textContent("#j_idt130\\:_t142");
    const match = textoTotalPaginas.match(/\d+/);
    const totalPaginas = match ? parseInt(match[0], 10) : 0;
    console.log(`Total de páginas: ${totalPaginas}`);

    // Ruta al escritorio en Windows
    const escritorio = path.join(process.env.USERPROFILE, "Desktop");
    const directorioDestino = path.join(escritorio, nombreArchivo);

    // Crear el directorio si no existe
    if (!fs.existsSync(directorioDestino)) {
      fs.mkdirSync(directorioDestino);
    }

    // Función para capturar y guardar la imagen
    const capturarImagen = async () => {
      try {
        await page.waitForSelector(".documentPageView img");
        const imagen = await page.$(".documentPageView img");
        return await imagen.screenshot();
      } catch (error) {
        console.error("Error al capturar la imagen:", error);
        throw error;
      }
    };

    // Iterar sobre el número total de páginas
    for (let i = 1; i <= totalPaginas; i++) {
      try {
        const imagenBuffer = await capturarImagen();
        const rutaArchivo = path.join(directorioDestino, `${i}.png`);
        fs.writeFileSync(rutaArchivo, imagenBuffer);
        console.log(`Imagen ${i} guardada como ${rutaArchivo}`);
      } catch (error) {
        console.error(`Error al guardar la imagen ${i}:`, error);
        throw error;
      }

      // Navegar a la siguiente página si es necesario
      if (i < totalPaginas) {
        try {
          await page.waitForSelector("#j_idt130\\:_t144");
          await page.click("#j_idt130\\:_t144");
          await page.waitForTimeout(2000); // Ajusta el tiempo de espera según sea necesario
        } catch (error) {
          console.error("Error al navegar a la siguiente página:", error);
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("Error en la función de scraping:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrape };
