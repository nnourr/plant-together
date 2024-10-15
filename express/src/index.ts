import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import expressWs from "express-ws";
// @ts-expect-error import directly from dist folder
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";

const { app } = expressWs(express());
const port = process.env.PORT || 3333;

app.use(express.json());

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

app.ws("/collaboration/:document", (ws, req) => {
  setupWSConnection(ws, req, { docName: req.params.document });
});

app.listen(port, () => {
  console.log(`express server started on ${port}`);
});
