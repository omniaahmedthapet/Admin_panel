// proxy-server.cjs
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

// ✅ السماح بالـ Origin بتاع React
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ أي طلب يبدأ بـ /api يتحوّل للسيرفر الأصلي
app.use("/api", createProxyMiddleware({
  target: "http://medicall2026.runasp.net",
  changeOrigin: true
}));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});
