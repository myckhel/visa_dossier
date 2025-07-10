import {
  type RouteConfig,
  route,
  layout,
  index,
} from "@react-router/dev/routes";

export default [
  // Public routes
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),

  // Protected routes with layout
  layout("components/MainLayout.tsx", [
    index("routes/dashboard.tsx"), // This will be the index route for "/"
    route("/upload", "routes/upload.tsx"),

    // Dossier management routes
    route("/dossiers", "routes/dossiers._index.tsx"),
    route("/dossiers/new", "routes/dossiers.new.tsx"),
    route("/dossiers/:id", "routes/dossiers.$id.tsx"),
    route("/dossiers/:id/edit", "routes/dossiers.$id.edit.tsx"),
  ]),
] satisfies RouteConfig;
