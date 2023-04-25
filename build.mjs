import fs from 'fs';

let mPkg = readPk('package.json');

function readPk(file) {
    let txt = fs.readFileSync(file);
    return JSON.parse(txt);
}

{ // core
    let cPkg = readPk('core/package.json');
    cPkg.version = mPkg.version;
    fs.writeFileSync('dist/core/package.json', JSON.stringify(cPkg, null, 4));

    console.log('copy: core/package.json')
}

{ // client
    let cPkg = readPk('client/package.json');
    cPkg.version = mPkg.version;
    cPkg.dependencies["@napp/dti-core"] = mPkg.version;
    fs.writeFileSync('dist/client/package.json', JSON.stringify(cPkg, null, 4));

    console.log('copy: client/package.json')
}

{ // server
    let cPkg = readPk('server/package.json');
    cPkg.version = mPkg.version;
    cPkg.dependencies["@napp/dti-core"] = mPkg.version;
    fs.writeFileSync('dist/server/package.json', JSON.stringify(cPkg, null, 4));

    console.log('copy: client/package.json')
}
