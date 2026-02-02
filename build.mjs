import fs from "fs";
import mPkg from "./package.json" with { type: "json" };

import corePkg from "./core.package.json" with { type: "json" };
import clientPkg from "./client.package.json" with { type: "json" };
import serverPkg from "./server.package.json" with { type: "json" };

{
  // core

  corePkg.version = mPkg.version;
  for (let d in corePkg.peerDependencies) {
    corePkg.peerDependencies[d] = mPkg.peerDependencies[d];
  }

  fs.writeFileSync("dist/core/package.json", JSON.stringify(corePkg, null, 4));

  console.log("copy: core/package.json");
}

{
  // client

  clientPkg.version = mPkg.version;
  for (let d in clientPkg.peerDependencies) {
    clientPkg.peerDependencies[d] = mPkg.peerDependencies[d];
  }
  clientPkg.dependencies["@napp/dti-core"] = mPkg.version;
  fs.writeFileSync(
    "dist/client/package.json",
    JSON.stringify(clientPkg, null, 4),
  );

  console.log("copy: client/package.json");
}

{
  // server

  serverPkg.version = mPkg.version;
  for (let d in serverPkg.peerDependencies) {
    serverPkg.peerDependencies[d] = mPkg.peerDependencies[d];
  }
  serverPkg.dependencies["@napp/dti-core"] = mPkg.version;
  fs.writeFileSync(
    "dist/server/package.json",
    JSON.stringify(serverPkg, null, 4),
  );

  console.log("copy: client/package.json");
}

if (fs.existsSync(".npmrc")) {
  fs.copyFileSync(".npmrc", "dist/client/.npmrc");
  fs.copyFileSync(".npmrc", "dist/core/.npmrc");
  fs.copyFileSync(".npmrc", "dist/server/.npmrc");
}