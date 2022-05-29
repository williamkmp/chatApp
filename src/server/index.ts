import { SERVER } from "./server.js";
import { PORT, SERVERURL } from "./server.js";

const { server, socket, app } = SERVER(PORT);
let userCount = 0;


//[SERVER]
app.get("/", (request, response) => {
	console.log("SERVER : request index.ejs");
	response.render("index", { room: SERVERURL });
});

app.get("/user/count", (request, response) => {
	response.json({count : userCount});
});

socket.on("connection", (socket) => {
	console.log(`SERVER : new connection (${socket.id})`);

	socket.on("new-message", (payload) => {
		socket.broadcast.emit("receive-message", payload);
	});

	socket.on("join", (name) => {
		userCount = userCount + 1;
		console.log(`SERVER : new user [${name}]`);
		socket.broadcast.emit("user-join", name);
	});

	socket.on('disconnect', (name)=>{
		userCount = userCount + 1;
		console.log(`SERVER : user dissconnected [${name}]`);
		socket.broadcast.emit("user-leave", name);
	})
});

server.listen(PORT, () => {
	console.log(`SERVER : listening on ${SERVERURL}`);
});
