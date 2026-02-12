import fs from "fs";
import path from "path";
import mPkg from "./package.json" with { type: "json" };

import corePkg from "./core.package.json" with { type: "json" };
import clientPkg from "./client.package.json" with { type: "json" };
import serverPkg from "./server.package.json" with { type: "json" };

{
  // core

  corePkg.version = mPkg.version;
  if (corePkg.peerDependencies && mPkg.peerDependencies) {
    for (let d in corePkg.peerDependencies) {
      if (mPkg.peerDependencies[d]) corePkg.peerDependencies[d] = mPkg.peerDependencies[d];
    }
  }

  fs.mkdirSync("dist/core", { recursive: true });
  fs.writeFileSync("dist/core/package.json", JSON.stringify(corePkg, null, 4));
  console.log("write: dist/core/package.json");

  // copy ESM build into package under esm/
  const srcEsmCore = path.join("dist", "esm", "core");
  const dstEsmCore = path.join("dist", "core", "esm");
  if (fs.existsSync(srcEsmCore)) {
    try {
      fs.cpSync(srcEsmCore, dstEsmCore, { recursive: true });
    } catch (e) {
      // fallback recursive copy for older Node versions
      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
          const s = path.join(src, name);
          const d = path.join(dest, name);
          const stat = fs.statSync(s);
          if (stat.isDirectory()) copyRecursive(s, d);
          else fs.copyFileSync(s, d);
        }
      };
      copyRecursive(srcEsmCore, dstEsmCore);
    }
    console.log("copy: esm -> dist/core/esm");
  }
}

{
  // client

  clientPkg.version = mPkg.version;
  if (clientPkg.peerDependencies && mPkg.peerDependencies) {
    for (let d in clientPkg.peerDependencies) {
      if (mPkg.peerDependencies[d]) clientPkg.peerDependencies[d] = mPkg.peerDependencies[d];
    }
  }
  clientPkg.dependencies = clientPkg.dependencies || {};
  clientPkg.dependencies["@napp/dti-core"] = mPkg.version;
  fs.mkdirSync("dist/client", { recursive: true });
  fs.writeFileSync("dist/client/package.json", JSON.stringify(clientPkg, null, 4));
  console.log("write: dist/client/package.json");

  const srcEsmClient = path.join("dist", "esm", "client");
  const dstEsmClient = path.join("dist", "client", "esm");
  if (fs.existsSync(srcEsmClient)) {
    try {
      fs.cpSync(srcEsmClient, dstEsmClient, { recursive: true });
    } catch (e) {
      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
          const s = path.join(src, name);
          const d = path.join(dest, name);
          const stat = fs.statSync(s);
          if (stat.isDirectory()) copyRecursive(s, d);
          else fs.copyFileSync(s, d);
        }
      };
      copyRecursive(srcEsmClient, dstEsmClient);
    }
    console.log("copy: esm -> dist/client/esm");
  }
}

{
  // server

  serverPkg.version = mPkg.version;
  if (serverPkg.peerDependencies && mPkg.peerDependencies) {
    for (let d in serverPkg.peerDependencies) {
      if (mPkg.peerDependencies[d]) serverPkg.peerDependencies[d] = mPkg.peerDependencies[d];
    }
  }
  serverPkg.dependencies = serverPkg.dependencies || {};
  serverPkg.dependencies["@napp/dti-core"] = mPkg.version;
  fs.mkdirSync("dist/server", { recursive: true });
  fs.writeFileSync("dist/server/package.json", JSON.stringify(serverPkg, null, 4));
  console.log("write: dist/server/package.json");

  const srcEsmServer = path.join("dist", "esm", "server");
  const dstEsmServer = path.join("dist", "server", "esm");
  if (fs.existsSync(srcEsmServer)) {
    try {
      fs.cpSync(srcEsmServer, dstEsmServer, { recursive: true });
    } catch (e) {
      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
          const s = path.join(src, name);
          const d = path.join(dest, name);
          const stat = fs.statSync(s);
          if (stat.isDirectory()) copyRecursive(s, d);
          else fs.copyFileSync(s, d);
        }
      };
      copyRecursive(srcEsmServer, dstEsmServer);
    }
    console.log("copy: esm -> dist/server/esm");
  }
}

if (fs.existsSync(".npmrc")) {
  ["client", "core", "server"].forEach((p) => {
    const dest = path.join("dist", p, ".npmrc");
    fs.copyFileSync(".npmrc", dest);
  });
}