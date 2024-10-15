import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { WebSocketServer } from "ws";

// @ts-expect-error import directly from dist folder
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";

const app = express();
const PORT = (process.env.PORT || 3333) as number;
const KEY = process.env.KEY || "";
const CERT = process.env.CERT || "";

app.use(express.json());

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

let server;
if (KEY != "" || CERT != "") {
  server = createHttpsServer(
    {
      key: KEY,
      cert: CERT,
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
