// router.jsx
// Hash router with path-param support.

function useHashRoute(defaultRoute = "landing") {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, "");
    if (!h) return { name: defaultRoute, params: [] };
    const [name, ...params] = h.split("/");
    return { name, params };
  };
  const [route, setRoute] = React.useState(parse);
  React.useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = (path) => {
    window.location.hash = "/" + path;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return [route, navigate];
}

function Router({ tweaks, heroVariant }) {
  const [route, navigate] = useHashRoute("landing");
  const props = { tweaks, heroVariant, current: route.name, params: route.params, onNavigate: navigate };

  switch (route.name) {
    case "landing": return <LandingPage {...props} />;
    case "system":  return <SystemPage {...props} />;
    case "fixture": return <FixturePage {...props} />;
    case "match":   return <MatchPage {...props} />;
    case "pools":   return <PoolsPage {...props} />;
    case "pool":    return <PoolPage {...props} />;
    case "predict": return <PredictPage {...props} />;
    case "groups":
    case "album":
    case "tickets":
    case "nations":
      return <PlaceholderPage {...props} />;
    default:
      return <LandingPage {...props} />;
  }
}

Object.assign(window, { Router, useHashRoute });
