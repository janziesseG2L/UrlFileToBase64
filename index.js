const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const app = express();
const token = process.env.G2L_token;

app.use(express.json());

app.post("/procesar-pdf", async (req, res) => {
  const { file_url, document_id, document_name } = req.body;

  if (!file_url || !document_id || !document_name) {
    return res.status(400).json({
      error: "Parámetros requeridos: file_url, document_id, document_name",
    });
  }

  try {
    console.log(` Descargando archivo desde ${file_url}`);
    // Fase 1: Descargar el archivo desde la URL recibida
    const pdfResponse = await fetch(file_url);

    if (!pdfResponse.ok) {
      return res
        .status(500)
        .json({ error: "Error al recuperar el archivo remoto" });
    }

    const buffer = await pdfResponse.buffer();

    // Fase 2: Codificar a base64
    console.log(` Convertiendo a base64`);
    const base64PDF = buffer.toString("base64");

    // Fase 3: Preparar payload en JSON
   const url = `https://www.gladtolink.com:8080/api/G2LIntegration/${token}`;
    console.log(`Llamando a API G2L con DocID: ${document_id} y DocName: ${document_name}`);
    const dataPayload = {
      documentUniqueId: document_id,
      documentFileName: document_name,
      documentFile: base64PDF,
    };

    const formParams = new URLSearchParams();
    formParams.append("data", JSON.stringify(dataPayload));

    const uploadResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formParams,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return res
        .status(500)
        .json({ error: "Error al enviar el PDF", details: errorText });
    }

    const result = await uploadResponse.json();
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(` Servidor escuchando en el puerto ${port}`);
});
