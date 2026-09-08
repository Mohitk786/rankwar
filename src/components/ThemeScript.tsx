const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("rw-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export function ThemeScript() {
  // Runs before paint to avoid a flash of the wrong theme — must be an
  // inline script tag, not an effect, since effects run after first paint.
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
