import Plausible from "plausible-tracker";
import { PUBLIC_PLAUSIBLE_HOST, PUBLIC_PLAUSIBLE_DOMAIN } from "$env/static/public";

import { navigating } from "$app/stores";

const { trackPageview } = Plausible({
  domain: PUBLIC_PLAUSIBLE_DOMAIN,
  // Track localhost by default
  trackLocalhost: !!PUBLIC_PLAUSIBLE_HOST,
  apiHost: PUBLIC_PLAUSIBLE_HOST
});

export function trackRouteChange(page) {
  trackPageview({
    url: page.route.id
  });
}
