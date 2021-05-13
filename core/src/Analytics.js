((factory) => {
	module.exports = factory();
})(() => {
	const Cookies = require("js-cookie");

	const api = {};

	const GetUUID = () => {
		let uuid;
		if (Cookies.get("uuid")) {
			uuid = Cookies.get("uuid");
		} else {
			function uuidv4() {
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
					/[xy]/g,
					function (c) {
						var r = (Math.random() * 16) | 0,
							v = c == "x" ? r : (r & 0x3) | 0x8;
						return v.toString(16);
					}
				);
			}
			uuid = uuidv4();
			Cookies.set("uuid", uuid);
		}
		console.log("uuid: " + uuid);
		return uuid;
	};

	const UUID = GetUUID();

	let serverIsAlive = false;
	const CheckServer = () => {};

	const Send = (query) => {
		const urlRedirector = "./redirector.php";
		const urlApi = "http://localhost:4000/graphql";
		query = query.replace("#graphql", "");
		query = { query, query };

		return fetch(urlRedirector, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `url=${urlApi}&query=${encodeURI(JSON.stringify(query))}`,
		}).then((response) => response.json());
	};

	const RegUser = () => {
		Send(`#graphql
		{
			user(UUID: "${UUID}") {
				UUID
			}
		}`).then((response) => {
			if (response && response.data && !response.data.user) {
				Send(`#graphql
				mutation {
					addUser(UUID: "${UUID}") {
						UUID
					}
				}`);
			}
		});
	};

	const SendLog = (data) => {
		data.date = new Date().toISOString();
		data.roomsHistory = data.roomsHistory === [] ? data.roomsHistory : "[]";
		console.log(data.roomsHistory);
		Send(`#graphql
		mutation {
			addLog(UUID: "${UUID}", type: "${data.type}", date: "${data.date}", roomsHistory: ${data.roomsHistory}, RoomsPath: "${data.RoomsPath}", VERSION: "${data.VERSION}") {
				UUID
				type
				date
				RoomsPath
				VERSION
			}
		}
		`);
	};

	const Step = (data) => {
		SendLog(data);
	};

	RegUser();

	api.Step = Step;

	return api;
});
