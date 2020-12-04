const GetWebPackExports = () => {
	const webpack = require("webpack");
	const path = require("path");
	const HtmlWebpackPlugin = require("html-webpack-plugin"); // Require  html-webpack-plugin plugin
	const MiniCssExtractPlugin = require("mini-css-extract-plugin");
	//const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
	const { CleanWebpackPlugin } = require("clean-webpack-plugin");
	const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin");
	const CopyPlugin = require("copy-webpack-plugin");
	//const ExtractTextPlugin = require("extract-text-webpack-plugin");
	const TerserPlugin = require("terser-webpack-plugin");
	//const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
	//	.BundleAnalyzerPlugin;

	const isDev = process.env.NODE_ENV === "development";
	const isProd = !isDev;

	const filename = (ext) =>
		isDev ? `[name].[contenthash].${ext}` : `[name].[contenthash].${ext}`;

	const CleanPluginOptions = {};

	const additionPlugins = [];
	const GetDefaultPlugins = () => {
		const plugins = [
			new CleanWebpackPlugin(CleanPluginOptions),
			new MiniCssExtractPlugin({
				filename: filename("css"),
			}),
		];

		//if (isProd) plugins.push(new BundleAnalyzerPlugin());

		additionPlugins.forEach((element) => {
			plugins.push(element);
		});

		return plugins;
	};

	const CreateExports = () => {
		return {
			mode: process.env.NODE_ENV,
			config: {
				output: {
					filename: filename("js"), // Name of generated bundle after build
					publicPath: "/",
				},
				optimization: {
					splitChunks: {
						chunks: "all",
					},
					minimize: true,
					minimizer: [
						new OptimizeCssAssetWebpackPlugin(),
						new TerserPlugin(),
					],
				},
				devtool: isDev ? "source-map" : false,
				module: {
					// where we defined file patterns and their loaders
					rules: [
						{
							test: /\.js$/,
							exclude: [/node_modules/],
							use: [
								{
									loader: "cache-loader",
									options: {
										cacheDirectory: path.resolve(
											__dirname,
											"node_modules/.cache/cache-loader"
										),
									},
								},
								{
									loader: "babel-loader",
									options: {
										presets: ["@babel/preset-env"],
										plugins: [
											"@babel/plugin-proposal-class-properties",
											"@babel/plugin-proposal-export-default-from",
										],
									},
								},
							],
						},
						{
							test: /\.css$/,
							use: ["style-loader", "css-loader"],
						},
						{
							test: /\.(png|jpg|jpeg|svg|gif|webp)$/,
							use: [
								{
									loader: "file-loader",
									options: {
										outputPath: "./img/",
										name: filename("[ext]"),
										publicPath: "./img/",
									},
								},
							],
						},
						{
							test: /\.(ttf|wolf)$/,
							use: ["file-loader"],
						},
					],
				},
				plugins: GetDefaultPlugins(),
			},
			AddIndexHtml: (index) => {
				additionPlugins.push(
					new HtmlWebpackPlugin({
						template: index,
						inject: "body",
						manify: {
							collapseWhitespace: isProd,
						},
						publicPath: "./",
					})
				);
				return CreateExports();
			},
			AddCopyPlugin: (patterns) => {
				additionPlugins.push(
					new CopyPlugin({
						patterns: patterns,
					})
				);
				return CreateExports();
			},
			ChangeCleanPluginExclude: (exclude) => {
				CleanPluginOptions.cleanStaleWebpackAssets = false;
				CleanPluginOptions.verbose = true;
				CleanPluginOptions.dry = false;
				CleanPluginOptions.cleanOnceBeforeBuildPatterns = ["**/*"];
				exclude
					.map((el) => "!" + el + "*")
					.forEach((el) => {
						CleanPluginOptions.cleanOnceBeforeBuildPatterns.push(
							el
						);
					});
				return CreateExports();
			},
		};
	};

	const exp = CreateExports();
	return exp;
};

module.exports = GetWebPackExports;
