const WebpackPwaManifest = require("webpack-pwa-manifest");
const { join } = require("path");

const config = {
	entry: join(__dirname + "/client-src/index.js"),
	output: {
		path: join(__dirname + "/public/dist"),
		filename: "app-bundle.js"
	},
	mode: "development",
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"]
					}
				}
			}
		]
	},
	plugins: [
		new WebpackPwaManifest({
			filename: "manifest.webmanifest",
			inject: true,
			fingerprints: false,
			name: "IntelliDnD",
			short_name: "IntelliDnD",
			theme_color: "#9b59b6",
			background_color: "#192a51",
			start_url: "/",
			display: "standalone",
			publicPath: "/dist",
			icons: [
				{
					src: join(__dirname + "/public/assets/images/icons/icon.png"),
					sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
				}
			]
		})
	]
};
module.exports = config;
