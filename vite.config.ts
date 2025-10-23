import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";

config({
  quiet: true
});

const allowedHostsString = process.env.DEV_ALLOWED_HOSTS
let allowedHosts: string[] = [];
if (allowedHostsString) {
  allowedHosts = allowedHostsString.split(",");
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: allowedHosts
  }
});