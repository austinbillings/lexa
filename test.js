const assert = require('assert');
const zaq = require('zaq');
const { createLexer, createDictionary, setPreferredLocale, getPreferredLocale } = require('./index');

const mostlyEnglish = createDictionary('en', {
    hello: 'Welcome to our site!',
    goodbye: {
        en: 'Peace out',
        es: 'Hasta Luego'
    }
});

const mostlySpanish = createDictionary('es', {
    sup: {
        en: 'What\'s up dude?',
        es: '¿Que pasa, esé?'
    },
    woah: {
        es: '¡Ay carumba!'
    }
});

const deepObject = createDictionary('en', {
    first: {
        second: {
            third: {
                fourth: '"Quatro", Cinco says.'
            }
        }
    }
});

const functionalDict = createDictionary('en', {
    ounces: (v) => `${v}oz.`,
    greeting: (name) => `Hey there, ${name}!`
});

const testLexer = createLexer(mostlyEnglish, mostlySpanish, deepObject, functionalDict);

assert.equal(getPreferredLocale(), 'en');
zaq.ok('Default locale resolves to en: passed');

assert.equal(testLexer('hello'), 'Welcome to our site!');
zaq.ok('Default top-level entry resolution: passed');

assert.equal(testLexer('goodbye'), 'Peace out');
zaq.ok('Preferred top-level entry resolution: passed');

assert.equal(testLexer('sup'), 'What\'s up dude?');
zaq.ok('Default top-level entry from secondary dictionary resolution: passed');

assert.equal(testLexer('woah'), '¡Ay carumba!');
zaq.ok('Preferred "not found" entry resolving to undefined: passed');

assert.equal(testLexer('woah.es'), '¡Ay carumba!');
zaq.ok('Specific locale subselected via lookup ID: passed');


assert.doesNotThrow(() => setPreferredLocale('es'));
zaq.ok('Set preferred locale to español: passed');;


assert.equal(testLexer('hello'), 'Welcome to our site!');
zaq.ok('Default dictionary locale resolves when preferred string doesn\'t exist: passed');;

assert.equal(testLexer('goodbye'), 'Hasta Luego');
zaq.ok('Preferred top-level entry resolution: passed');;

assert.equal(testLexer('sup'), '¿Que pasa, esé?');
zaq.ok('Preferred top-level entry from secondary dictionary resolution: passed');;

assert.equal(testLexer('woah'), '¡Ay carumba!');
zaq.ok('Preferred-only top-level entry resolution: passed');;

assert.equal(testLexer('FAKE_NONEXISTENT_ID'), null);
zaq.ok('Unknown entry ID resolves to null: passed');

assert.equal(testLexer('first.second.third.fourth'), '"Quatro", Cinco says.');
zaq.ok('Deep lookup ID resolution: passed');

assert.equal(testLexer('ounces')(13), '13oz.');
zaq.ok('Functional property resolution: passed');
