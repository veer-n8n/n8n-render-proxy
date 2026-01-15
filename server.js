import express from "express";
import fetch from "node-fetch";

const app = express();

// allow large payloads (image/audio/video/base64)
app.use(express.json({ limit: "100mb" }));

// universal proxy (POST / GET)
app.all("/proxy", async (req, res) => {
  try {
    const { url, method = "POST", headers = {}, body } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "Missing target URL" });
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const contentType = response.headers.get("content-type") || "";

    // JSON response
    if (contentType.includes("application/json")) {
      const json = await response.json();
      return res.json(json);
    }

    // Binary response (image / audio / video / file)
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);

  } catch (err) {
    res.status(500).json({
      error: "Proxy error",
      message: err.message
    });
  }
});

// health check
app.get("/", (_, res) => {
  res.send("n8n proxy running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
