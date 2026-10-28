// One owner for page views; Firebase automatic page views are disabled at initialization.
// Keep this tracker outside React so StrictMode remounts do not repeat a visit.
export function createPageViewTracker(send) {
  let previousPath = null;
  let previousLocation = null;
  return ({ pathname, location, title, referrer = "" }) => {
    if (!pathname || pathname === previousPath) return false;
    const previous = previousLocation || referrer;
    previousPath = pathname;
    previousLocation = location;
    send("page_view", { page_location: location, page_path: pathname, page_title: title, page_referrer: previous });
    return true;
  };
}
