import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("history", "routes/history.tsx"),
  route("processing/:id", "routes/processing.$id.tsx"),
  route("paper/:id", "routes/paper.$id.tsx"),
] satisfies RouteConfig;
