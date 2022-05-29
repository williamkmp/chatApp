import express from "express";
import http from "http";
import {Server} from "socket.io";
import { io as ioClient } from "socket.io-client"

import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * function to bootstrap the server
 */
export function SERVER(port: number) {
	const app = express();
	const server = http.createServer(app);
	const io = new Server(server);

	app.set('views', __dirname + "..\\client\\views")
	app.set("view engine", "ejs");
	app.use(express.static( __dirname + "..\\client\\public"));
	app.use(express.urlencoded({ extended: true }));

	return {
		server: server,
		socket: io,
		app: app,
	};
}

//[SERVER CONFIG]
export const PORT = 3000;
export const SERVERURL = `http://localhost:${PORT}`;
export const IO = ioClient;