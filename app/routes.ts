import { type RouteConfig, index } from "@react-router/dev/routes";

export default 
[index("routes/home.tsx"),
route ('visualiser/:id', './routes/visualiser.$id.tsx')
] satisfies RouteConfig;
