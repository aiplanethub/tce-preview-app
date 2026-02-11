import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/home.tsx", [
    index("routes/home-index.tsx"),
    route(":assetId", "routes/asset.tsx"),
  ]),
  route("auth/callback", "routes/auth.callback.tsx"),
] satisfies RouteConfig;
