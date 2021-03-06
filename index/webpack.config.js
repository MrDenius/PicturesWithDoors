const path = require("path");

const exp = require("../WebPackHI/webpack")()
	.AddIndexHtml(path.win32.normalize(__dirname + "/src/index.html"))
	.ChangeCleanPluginExclude(["core"]).config;

exp.context = __dirname + "/src";
exp.entry = __dirname + "/src/main.js";
exp.output.path = path.win32.normalize(__dirname + "/../" + "/dist/");
exp.output.publicPath = "/";
module.exports = exp;
