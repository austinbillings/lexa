// build.js
const fs = require('fs')
const path = require('path')
const fileContents = fs.readFileSync(path.resolve(__dirname, 'lexa.js'), 'utf8')

const exportsList = `{
    isDictionary,
    createDictionary,
    createLex,
    setPreferredLocale,
    getPreferredLocale
}`

const commonJs = fileContents.concat('\n', `module.exports = ${exportsList}`)
fs.writeFileSync(path.resolve(__dirname, 'lib', 'commonjs.js'), commonJs, 'utf8')

const es6 = fileContents.concat('\n', `export ${exportsList};`)
fs.writeFileSync(path.resolve(__dirname, 'lib', 'es6.js'), es6, 'utf8')
