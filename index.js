const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json()); // para leer JSON en el body

app.post("/convert", async (req, res) => {
  const { file_url, document_name, document_id } = req.body;

  if (!file_url || !document_name || !document_id) {
    return res.status(400).json({ error: "Faltan parámetros obligatorios" });
  }

  try {
    // Descargar archivo desde la URL
    const response = await axios.get(file_url, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data, "binary");

    // Detectar MIME (ej: application/pdf, image/png, etc.)
    const mimeType = response.headers["content-type"] || "application/octet-stream";

    // Convertir a Base64
    const encodedFile = fileBuffer.toString("base64");

    // Construir payload
    const payload = {
      documentName: document_name,
      documentUniqueId: document_id,
      tags: [
        {
          uniqueId: "65686500-62f7-4bb6-8faf-91e30cde3839",
          name: "ESTRUCTURA DATOS IMPORTADOS",
          fields: [
            {
              uniqueId: "2f6994f2-9d74-4145-8736-379775e861a6",
              name: "Archivo",
              value_file: {
                name: document_name,
                base64: `${mimeType};base64,${encodedFile}`,
              },
            },
          ],
        },
      ],
    };

    // URL de destino con token ya incluido
    const targetUrl =
      "https://www.gladtolink.com:8080/api/G2LIntegration/b72d5cb3-8f5c-4a94-8a73-d7770e74ee70";

    // Llamada a API destino
    const postResponse = await axios.post(targetUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });

    res.json({
      status: "success",
      message: "Documento convertido y enviado",
      api_response: postResponse.data,
    });
  } catch (error) {
    console.error("❌ Error en /convert:", error.message);

    if (error.response) {
      // Error de la API destino o al descargar
      return res.status(error.response.status).json({
        status: "error",
        message: error.message,
        details: error.response.data,
        headers: error.response.headers,
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message,
      stack: error.stack,
    });
  }
});

// Puerto para Azure App Service
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
