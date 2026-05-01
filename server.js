const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataDir = path.join(root, "data");
const enquiriesFile = path.join(dataDir, "enquiries.json");
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const ensureStore = () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(enquiriesFile)) fs.writeFileSync(enquiriesFile, "[]\n");
};

const readBody = (request) => {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};

const saveEnquiry = async (request, response) => {
  try {
    ensureStore();
    const body = await readBody(request);
    const payload = JSON.parse(body || "{}");

    if (!payload.name || !payload.phone) {
      sendJson(response, 400, { error: "Name and phone are required." });
      return;
    }

    const enquiries = JSON.parse(fs.readFileSync(enquiriesFile, "utf8"));
    const enquiry = {
      id: enquiries.length + 1,
      name: String(payload.name).trim(),
      email: String(payload.email || "").trim(),
      phone: String(payload.phone).trim(),
      interest: String(payload.interest || "Website popup").trim(),
      message: String(payload.message || "").trim(),
      createdAt: new Date().toISOString()
    };

    enquiries.push(enquiry);
    fs.writeFileSync(enquiriesFile, JSON.stringify(enquiries, null, 2));
    sendJson(response, 201, enquiry);
  } catch (error) {
    sendJson(response, 500, { error: "Unable to save enquiry." });
  }
};

const serveStatic = (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const cleanPath = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
  const filePath = path.normalize(path.join(root, cleanPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  });
};

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/enquiries") {
    saveEnquiry(request, response);
    return;
  }

  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

ensureStore();
server.listen(port, "0.0.0.0", () => {
  console.log(`UrbanNest demo running at http://127.0.0.1:${port}`);
});
