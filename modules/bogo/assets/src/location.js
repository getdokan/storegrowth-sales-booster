import { useState, useEffect } from "react";

function useLocationWatcher() {
  const [location, setLocation] = useState(window.location);

  useEffect(() => {
    const updateLocation = () => {
      setLocation({ ...window.location });
    };

    // Handle browser navigation (back/forward)
    window.addEventListener("popstate", updateLocation);

    // Patch pushState / replaceState to detect programmatic changes
    const pushState = history.pushState;
    history.pushState = function (...args) {
      pushState.apply(history, args);
      updateLocation();
    };

    const replaceState = history.replaceState;
    history.replaceState = function (...args) {
      replaceState.apply(history, args);
      updateLocation();
    };

    return () => {
      window.removeEventListener("popstate", updateLocation);
      history.pushState = pushState;
      history.replaceState = replaceState;
    };
  }, []);

  return location;
}
export default useLocationWatcher;
