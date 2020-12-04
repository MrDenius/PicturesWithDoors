const { spawn } = require("child_process");
//const { dir } = require("console");

module.exports = (() => {
	const init = () => {
		const api = () => {};

		const Run = (command, args, options) => {
			if (args) args = ["/C", command, args];
			else args = ["/C", command];
			return spawn(`C:\\Windows\\system32\\cmd.exe`, args, options);
		};

		const PackageManager = (PM, args, dir) => {
			if (Array.isArray(args)) args = args.join(" ");

			let command = `${PM} ${args}`;
			if (dir) command = `cd ${dir} && ${command}`;

			return Run(command);
		};

		api.run = Run;
		api.yarn = (args, dir) => PackageManager("yarn", args, dir);
		api.npm = (args, dir) => PackageManager("npm", args, dir);

		return api;
	};

	return init();
})();
