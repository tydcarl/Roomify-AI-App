import type { H } from "node_modules/react-router/dist/development/router-cLsU7kHk.mjs";
import { HOSTING_CONFIG_KEY } from "./utils";
import { puter } from "@heyputer/puter.js";

type HostingConfig = { subdomain: string; }; 
type HostedAsset = { url: string };

export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null; 

        if(existing?.subdomain) {subdomain: existing.subdomain };

        const subdomain = createHostingSlug();
}
