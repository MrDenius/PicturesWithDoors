const cmd = require("./cmd");

const ArgsHandler = (args) => {
	const myArgs = args.slice(2);

	const cmdWCD = (cd) => {
		cd = cd || "..";
		return (command, callback) => {
			command = `cd ${cd}\n${command}`;
			return cmd.run(command, callback);
		};
	};

	for (let i = 0; i < myArgs.length; i++) {
		let arg = myArgs[i];
		if (i < myArgs.length + 1) {
			let value = myArgs[i + 1];
		}

		let mode;
		let procIndex;
		let procCore;

		if (arg === "dev" || arg === "build") {
			if (arg === "dev") mode = "development";
			if (arg === "build") mode = "production";

			procIndex = cmd.run(
				`cd .\\index && .\\node_modules\\.bin\\webpack --mode ${mode}`,
				undefined,
				{ env: { NODE_ENV: mode } }
			);
			procCore = cmd.run(
				`cd .\\core && .\\node_modules\\.bin\\webpack --mode ${mode}`,
				undefined,
				{ env: { NODE_ENV: mode } }
			);

			procIndex.stdout.on("data", (data) =>
				console.log(`<INDEX> => ${data}`)
			);
			procCore.stdout.on("data", (data) =>
				console.log(`<CORE> => ${data}`)
			);
			procIndex.stderr.on("data", (data) =>
				console.log(`<INDEX> => ${data}`)
			);
			procCore.stderr.on("data", (data) =>
				console.log(`<CORE> => ${data}`)
			);
		}

		switch (arg) {
			case "start":
				mode = "development";
				procIndex = cmd.run(
					`cd .\\index && .\\node_modules\\.bin\\webpack --mode ${mode} --watch`,
					undefined,
					{ env: { NODE_ENV: mode } }
				);
				procCore = cmd.run(
					`cd .\\core && .\\node_modules\\.bin\\webpack --mode ${mode} --watch`,
					undefined,
					{ env: { NODE_ENV: mode } }
				);

				procIndex.stdout.on("data", (data) =>
					console.log(`<INDEX> => ${data}`)
				);
				procCore.stdout.on("data", (data) =>
					console.log(`<CORE> => ${data}`)
				);
				procIndex.stderr.on("data", (data) =>
					console.log(`<INDEX> => ${data}`)
				);
				procCore.stderr.on("data", (data) =>
					console.log(`<CORE> => ${data}`)
				);
				break;

			case "stats":
				procIndex = cmd.run(
					`cd .\\index && .\\node_modules\\.bin\\webpack --json > stats.json && webpack-bundle-analyzer stats.json`,
					undefined,
					{}
				);
				procCore = cmd.run(
					`cd .\\core && .\\node_modules\\.bin\\webpack --json > stats.json && webpack-bundle-analyzer stats.json`,
					undefined,
					{}
				);

				procIndex.stdout.on("data", (data) =>
					console.log(`<INDEX> => ${data}`)
				);
				procCore.stdout.on("data", (data) =>
					console.log(`<CORE> => ${data}`)
				);
				procIndex.stderr.on("data", (data) =>
					console.log(`<INDEX> => ${data}`)
				);
				procCore.stderr.on("data", (data) =>
					console.log(`<CORE> => ${data}`)
				);
				break;

			case "yarn":
				let procWPHI = cmd.yarn(myArgs[i + 1], ".\\WebPackHI");
				procIndex = cmd.yarn(myArgs[i + 1], ".\\index");
				procCore = cmd.yarn(myArgs[i + 1], ".\\core");

				procWPHI.stdout.on("data", (data) =>
					console.log(`<ROOT> => ${data}`)
				);
				procWPHI.stderr.on("data", (data) =>
					console.log(`<ROOT> => ${data}`)
				);
				procIndex.stdout.on("data", (data) =>
					console.log(`<INDEX> => ${data}`)
				);
				procCore.stdout.on("data", (data) =>
					console.log(`<CORE> => ${data}`)
				);
				procIndex.stderr.on("data", (data) =>
					console.log(`<INDEX> => ${data}`)
				);
				procCore.stderr.on("data", (data) =>
					console.log(`<CORE> => ${data}`)
				);
				break;

			default:
				break;
		}
	}
};

module.exports = { ArgsHandler: ArgsHandler };
