import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
	resolve: {
		alias: [
			{
				find: "@lms-repo/ui/globals.css",
				replacement: path.resolve(
					__dirname,
					"../../packages/ui/src/styles/globals.css",
				),
			},
			{
				find: /^@lms-repo\/ui\/(.*)/,
				replacement: path.resolve(__dirname, "../../packages/ui/src/$1"),
			},
			{
				find: "@lms-repo/ui",
				replacement: path.resolve(__dirname, "../../packages/ui/src"),
			},
			{
				find: "@",
				replacement: path.resolve(__dirname, "src"),
			},
		],
	},
	server: {
		host: true,
		port: 3001,
		strictPort: true,
	},
	envDir: "../../apps/web/.env",
});
