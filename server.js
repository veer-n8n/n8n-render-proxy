import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/proxy", async (req, res) => {
  try {
    const { url, method = "POST", headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing target URL" });
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    }

    const text = await response.text();
    res.send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Proxy running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
