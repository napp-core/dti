import fs from 'fs';
import mPkg from './package.json' assert {type: 'json'};

import corePkg from './core.package.json' assert {type: 'json'};
import clientPkg from './client.package.json' assert {type: 'json'};
import serverPkg from './server.package.json' assert {type: 'json'};

{ // core

    corePkg.version = mPkg.version;
    for (let d in corePkg.dependencies) {
        corePkg.dependencies[d] = mPkg.dependencies[d];
    }

    fs.writeFileSync('dist/core/package.json', JSON.stringify(corePkg, null, 4));

    console.log('copy: core/package.json')
}

{ // client
    
    clientPkg.version = mPkg.version;
    for (let d in clientPkg.dependencies) {
        clientPkg.dependencies[d] = mPkg.dependencies[d];
    }
    clientPkg.dependencies["@napp/dti-core"] = mPkg.version;
    fs.writeFileSync('dist/client/package.json', JSON.stringify(clientPkg, null, 4));

    console.log('copy: client/package.json')
}

{ // server
    
    serverPkg.version = mPkg.version;
    for (let d in serverPkg.dependencies) {
        serverPkg.dependencies[d] = mPkg.dependencies[d];
    }
    serverPkg.dependencies["@napp/dti-core"] = mPkg.version;
    fs.writeFileSync('dist/server/package.json', JSON.stringify(serverPkg, null, 4));

    console.log('copy: client/package.json')
}
