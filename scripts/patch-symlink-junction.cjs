// Windows-only build-time workaround: @netlify/plugin-nextjs calls
// fs.promises.symlink(target, path) with no `type` argument when copying
// node_modules (e.g. @prisma/client). Node then defaults to a "dir" symlink
// on Windows, which needs SeCreateSymbolicLinkPrivilege (admin/Developer
// Mode) and fails with EPERM otherwise. "junction" links do the same job
// for directories without that privilege, so this coerces the type instead
// of touching any OS setting. Loaded via NODE_OPTIONS=--require for the
// Netlify build step only; not used at runtime.
const fs = require("fs");
const path = require("path");

if (process.platform === "win32") {
  const original = fs.promises.symlink.bind(fs.promises);
  fs.promises.symlink = async (target, linkPath, type) => {
    if (!type) {
      const resolvedTarget = path.resolve(path.dirname(linkPath), target);
      let isDir = false;
      try {
        isDir = fs.statSync(resolvedTarget).isDirectory();
      } catch {
        isDir = false;
      }
      type = isDir ? "junction" : "file";
    }
    return original(target, linkPath, type);
  };
}
