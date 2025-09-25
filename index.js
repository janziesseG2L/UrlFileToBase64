const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.get("/convert", async (req, res) => {
  const { file_url, document_name, document_id } = req.query;

  if (!file_url || !document_name || !document_id) {
    return res.status(400).json({ error: "Faltan parámetros obligatorios" });
  }

  try {
    // Descargar archivo
    const response = await axios.get(file_url, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(response.data, "binary");

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
                base64: `application/pdf;base64,${encodedFile}`,
              },
            },
          ],
        },
      ],
    };

    // Llamada a API destino
    const targetUrl = "https://api.destino.com/upload"; // <- Cambia por tu API
    const postResponse = await axios.post(targetUrl, payload);

    res.json({
      status: "success",
      message: "Documento convertido y enviado",
      api_response: postResponse.data,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Puerto de Azure App Service
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
