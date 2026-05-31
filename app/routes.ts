import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
route('visualizer/:id', 'visualizer.$id.tsx')
] satisfies RouteConfig;
