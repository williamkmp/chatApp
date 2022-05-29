export class App {
	constructor(serverUrl) {
        this.serverUrl = serverUrl;
		this.components = {
			displayName: document.getElementById("display-name"),
			conversation: document.getElementById("conversation"),
			textInput: document.getElementById("chatInput"),
			sendButton: document.getElementById("sendBtn"),
			headerTitle: document.getElementById("room-id"),
			chatBox: document.getElementById("conversation-container"),
			loader: document.getElementById("loading-screen"),
			nameBtn: document.getElementById("submit-name"),
			errorLabel: document.getElementById("error-label"),
			nameInput: document.getElementById("name-input"),
            userCount: document.getElementById("user-count"),
		};
		this.state = {
			typedMessage: "",
			userName: "",
            userCount: 0
		};
		this.params = this.getParams();
		this.socket = io(serverUrl);
		this.mountListener();
		console.log("Application Finised Loading 👍.");
	}

	mountListener() {
		const APP = this;
		const DOM = this.components;
		const STATE = this.state;
		const SOCKET = this.socket;

		DOM.nameInput.focus();

		DOM.sendButton.addEventListener("click", function (event) {
			APP.sendMessage(STATE.typedMessage);
		});

		DOM.textInput.addEventListener("input", function (event) {
			STATE.typedMessage = DOM.textInput.value;
		});

		DOM.nameBtn.addEventListener("click", async function (event) {
			event.preventDefault();
			let submittedName = DOM.nameInput.value.trim();
			await APP.validateName(submittedName);
		});

		DOM.nameInput.addEventListener("keypress", async function (event) {
			if (event.code === "Enter") {
				let submittedName = DOM.nameInput.value.trim();
				await APP.validateName(submittedName);
			}
		});

		DOM.textInput.addEventListener("keypress", function (event) {
			if (event.code === "Enter" && event.shiftKey) {
				APP.changeTypedMessage(STATE.typedMessage + "\n");
			} else if (event.code === "Enter" && !event.shiftKey) {
				event.preventDefault();
				APP.sendMessage(STATE.typedMessage);
			}
		});

		SOCKET.on("receive-message", (messageContent) => {
            let message = APP.createChat(messageContent, true);
			APP.pushToChat(message);
		});

        SOCKET.on("user-join", (userName) => {
            let message = `[${userName}] has joined the room`;
            let notiffication = APP.createNotiff(message);
			APP.pushToChat(notiffication);
            APP.updateUserCount(STATE.userCount + 1);
		});

        SOCKET.on("user-leave", (userName) => {
            let message = `[${userName}] has left the room`;
            let notiffication = APP.createNotiff(message);
			APP.pushToChat(notiffication);
            APP.updateUserCount(STATE.userCount - 1);

		});
	}

	async validateName(submittedName) {
		const DOM = this.components;
		const STATE = this.state;
		const SOCKET = this.socket;

		if (submittedName == null || submittedName === "") {
			DOM.errorLabel.textContent = "Name cannot be empty";
		} else {
            let response = await fetch(`${this.serverUrl}/user/count`);
            let data = await response.json();
            this.updateUserCount(data.count)
			STATE.userName = submittedName;
			DOM.loader.innerHTML = "";
			DOM.loader.classList.add("remove");
			DOM.displayName.textContent = submittedName;
            DOM.textInput.focus();
			SOCKET.emit("join", submittedName);
		}
	}

	sendMessage(message) {
		let trimmedMessage = message.trim();
		if (trimmedMessage !== "") {
			this.sendToServer(trimmedMessage);
            let message = this.createChat(trimmedMessage, false);
			this.pushToChat(message);
			this.changeTypedMessage("");
		}
	}

	changeTypedMessage(message) {
		this.components.textInput.value = message;
		this.state.typedMessage = message;
	}

    updateUserCount(count){
        this.state.userCount = count;
        this.components.userCount.textContent = count;
    }

	sendToServer(message) {
		message = `[${this.state.userName}] :\n${message}`;
		this.socket.emit("new-message", message);
	}

	pushToChat(item) {
		const conversation = this.components.conversation;
		conversation.appendChild(item);
		this.chatToBottom();
	}

	createChat(message, fromOther) {
		const chat = document.createElement("span");
		chat.textContent = message;
		chat.classList.add("message");
		chat.classList.add("self");
		if (fromOther) chat.classList.remove("self");
		return chat;
	}

    createNotiff(message){
		const notif = document.createElement("span");
		notif.textContent = message;
		notif.classList.add("notif");
        return notif;
    }

	chatToBottom() {
		const chatBox = this.components.chatBox;
		chatBox.scroll({
			top: chatBox.scrollHeight,
			behavior: "smooth",
		});
	}

	getParams() {
		let result = {};
		let parameters = Array.from(document.querySelectorAll('input[type="hidden"]'));
		for (let param of parameters) {
			let key = param.name;
			let value = param.value;
			result[key] = value;
		}
		return result;
	}
}
