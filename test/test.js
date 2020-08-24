const assert = require('assert');
const { createLex, createDictionary, setPreferredLocale, getPreferredLocale } = require('..');

// test values
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
    first: { second: { third: { fourth: '"Quatro", Cinco says.' } } }
});

const functionalDict = createDictionary('en', {
    ounces: (v) => `${v}oz.`,
    greeting: (name) => `Hey there, ${name}!`,
    weight: {
        'en-us': (pounds) => `${pounds} lbs.`,
        'en-gb': (pounds) => `${pounds * 0.4535924} kg.`
    }
});

// tests
describe('lexa', function () {
    describe('#getPreferredLocale/#setPreferredLocale', function () {

        it('should resolve default locale as "en"', function () {
            assert.equal(getPreferredLocale(), 'en');
        });

        it('should not throw when setting a valid preferred locale', function () {
            assert.doesNotThrow(() => setPreferredLocale('es'));
        });

        it('should reflect changed default locale to "es"', function () {
            assert.equal(getPreferredLocale(), 'es');
        });

        it('should throw when setting an invalid locale value', function () {
            assert.throws(() => setPreferredLocale({}));
            assert.throws(() => setPreferredLocale(null));
            assert.throws(() => setPreferredLocale(123));
            assert.throws(() => setPreferredLocale(true));
        });

        it('should not throw when re-setting preferred locale to "en"', function () {
            assert.doesNotThrow(() => setPreferredLocale('en'));
        });

    });

    describe('#createDictionary', function () {
        it('should throw when given an invalid defaultLocale', function () {
            assert.throws(() => createDictionary());
            assert.throws(() => createDictionary(null));
            assert.throws(() => createDictionary(123));
            assert.throws(() => createDictionary(true));
        });

        it('should throw when given an invalid dictionary list', function () {
            assert.throws(() => createDictionary('en'));
            assert.throws(() => createDictionary('en', null));
            assert.throws(() => createDictionary('en', null, 123));
            assert.throws(() => createDictionary('en', {}, {}, {}, null));
            assert.throws(() => createDictionary('en', {}, {}, {}, [], [], null));
        });

        it('should create a valid dictionary object with explicit locale', function () {
            let dict;

            assert.doesNotThrow(() => dict = createDictionary('en', { a: 'The letter A', b: 'The letter B' }));
            assert.equal(dict.defaultLocale, 'en');
            assert.equal(typeof dict.entries, 'object');
            assert.equal(Object.keys(dict.entries).length, 2);
            assert.ok(dict._isDictionaryObject)
        });
    });

    describe('#createLex', function () {
        it('should throw when creating lex with non-dictionary objects', function () {
            assert.throws(() => createLex());
            assert.throws(() => createLex(true));
            assert.throws(() => createLex(null));
            assert.throws(() => createLex(123));
            assert.throws(() => createLex([]));
            assert.throws(() => createLex('test'));
        });

        function getLex () {
            return createLex(mostlyEnglish, mostlySpanish, deepObject, functionalDict);
        }

        it('shouldn\'t throw when creating a lex using dictionary objects', function () {
            assert.doesNotThrow(getLex);
        });

        it('should return a function', function () {
            assert.equal(typeof getLex(), 'function');
        });

        it('should throw if no lookupId is passed to function', function () {
            assert.throws(() => getLex()());
        });

        it('should throw if a non-string lookupId is passed to function', function () {
            assert.throws(() => getLex()(true));
            assert.throws(() => getLex()(null));
            assert.throws(() => getLex()({}));
            assert.throws(() => getLex()([]));
            assert.throws(() => getLex()(123));
            assert.throws(() => getLex()(/sampleRegex/));
        });

        it('should resolve a lookup using default locale when no alternatives given', function () {
            assert.equal(getLex()('hello'), 'Welcome to our site!');
        });

        it('should resolve a lookup using preferred locale when multiple available', function () {
            assert.equal(getLex()('goodbye'), 'Peace out');
        });

        it('should resolve a lookup from a secondary dictionary', function () {
            assert.equal(getLex()('sup'), 'What\'s up dude?');
        });

        it('should return null when preferred locale unavailable in dictionary-of-nonpreferred-locale', function () {
            assert.equal(getLex()('woah'), null);
        });

        it('should resolve a lookup with a specified locale subselector', function () {
            assert.equal(getLex()('woah.es'), '¡Ay carumba!');
        });

        it('should resolve lookup with default value when preferred locale unavailable', function () {
            setPreferredLocale('es');
            assert.equal(getLex()('hello'), 'Welcome to our site!');
        });

        it('should resolve lookup with preferred locale when available', function () {
            setPreferredLocale('es');
            assert.equal(getLex()('goodbye'), 'Hasta Luego');
        });

        it('should resolve lookup with preferred locale when available in secondary dictionary', function () {
            setPreferredLocale('es');
            assert.equal(getLex()('sup'), '¿Que pasa, esé?');
        });

        it('should return null when lookup ID not found', function () {
            setPreferredLocale('en');
            assert.equal(getLex()('FAKE_NONEXISTENT_ID'), null);
        });

        it('should resolve deep lookups', function () {
            assert.equal(getLex()('first.second.third.fourth'), '"Quatro", Cinco says.');
        });

        it('should resolve functional lookups', function () {
            assert.equal(getLex()('ounces')(13), '13oz.');
        });

    });

    describe('#setPreferredLocale', function () {

    });
});
