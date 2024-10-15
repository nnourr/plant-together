import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { WebSocketServer } from "ws";
import * as fs from "fs";

// @ts-expect-error import directly from dist folder
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";

const app = express();
const PORT = (process.env.PORT || 3333) as number;
const KEY_PATH = process.env.KEY_PATH || "";
const CERT_PATH = process.env.CERT_PATH || "";

app.use(express.json());

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

let server;
if (KEY_PATH != "" || CERT_PATH != "") {
  const key = fs.readFileSync(KEY_PATH);
  const cert = fs.readFileSync(CERT_PATH);
  server = createHttpsServer(
    {
      key: key,
      cert: cert,
    },
    app
  );
} else {
  console.log("running http");
  server = createHttpServer(app);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`express server started on ${PORT}`);
});

const ws = new WebSocketServer({ server });

ws.on("connection", setupWSConnection);
