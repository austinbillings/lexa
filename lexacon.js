// Utils
const isNull = v => v === null;
const isArray = v => Array.isArray(v);
const isString = v => typeof v === 'string';
const isDefined = v => typeof v !== 'undefined';
const isFunction = v => typeof v === 'function';
const isNonEmptyString = v => isString(v) && v.length;
const isObject = v => typeof v === 'object' && !isNull(v) && !isArray(v);
const getKeys = v => isObject(v) ? Object.keys(v) : [];
const splitBy = (v, d) => !isString(v) ? [] : v.split(d).filter(isNonEmptyString);
const flat = v => !isArray(v) ? v : v.reduce((o, i) => [...o, ...(isArray(i) ? flat(i) : [i])], []);

// Tools
function mergeDeep (...objects) {
  return objects.reduce((output, item) => {
    getKeys(item).forEach(key => {
      return isDefined(item[key])
        ? output[key] = isObject(output[key]) && isObject(item[key])
          ? mergeDeep(output[key], item[key])
          : item[key]
        : null;
    });

    return output;
  }, {});
}

function getDeep (object, path, pathSeparator = '.') {
  if (!isObject(object))
    throw new TypeError(`${object} is not an <Object>`);
  if (!isNonEmptyString(path))
    throw new TypeError(`${path} is not a non-empty <String>`);
  if (!isNonEmptyString(pathSeparator))
    throw new TypeError(`${pathSeparator} is not a non-empty <String>`);

  let lookupPath = splitBy(path, pathSeparator);
  let outputValue = Object.assign({}, object);

  while (lookupPath.length) {
    let currentPathSegment = lookupPath.shift();

    if (isObject(outputValue) || isArray(outputValue)) {
      let nextValue = outputValue[currentPathSegment];

      if (!isDefined(nextValue))
        return undefined;

      outputValue = nextValue;
    }
  }

  return outputValue;
}

// Dictionaries
function isDictionary (value) {
  return isObject(value)
    && value._isDictionaryObject;
}

function createDictionary (defaultLocale, ...dictionaryValues) {
  if (!isNonEmptyString(defaultLocale))
    throw new TypeError(`${defaultLocale} is not a non-empty <String>.`);
  if (!dictionaryValues.length)
    throw new TypeError(`No dictionary values given.`);
  if (flat(dictionaryValues).some(d => !isObject(d)))
    throw new TypeError(`dictionaryValues flattened list contains a value which is not an <Object>.`);

  const flatSourceList = flat(dictionaryValues).map(item => isDictionary(item) ? item.entries : item);
  const entries = mergeDeep(...flatSourceList);

  return { entries, defaultLocale, _isDictionaryObject: true };
}

// Locale setting & state

const _preferredLocale = { current: 'en' };

function getPreferredLocale () {
  return _preferredLocale.current;
}

function setPreferredLocale (newValue) {
  if (!isNonEmptyString(newValue)) {
    throw new TypeError(`${newValue} is not a non-empty <String>.`);
  }

  return _preferredLocale.current = newValue;
}

function createLex (...dictionaries) {
  if (!dictionaries.length)
    throw new TypeError(`No dictionaries provided.`)
  if (!dictionaries.every(isDictionary))
    throw new TypeError(`Given a non dictionary-like <Object> (use createDictionary()): ${dictionaries.find(d => !isDictionary(d))}`);

  const lookupText = (lookupId) => {
    if (!isNonEmptyString(lookupId))
      throw new TypeError(`${lookupId} is not a non-empty <String>.`);

    const cleanLookupId = lookupId.replace(/[^a-zA-Z0-9.-_\s]+/g, '');
    const matchedDictionary = dictionaries.find(d => getDeep(d.entries, cleanLookupId));
    const outputValue = matchedDictionary ? getDeep(matchedDictionary.entries, cleanLookupId) : null;

    if (!isString(outputValue) && !isFunction(outputValue) && !isObject(outputValue)) {
      return undefined;
    }

    const preferredLocale = getPreferredLocale();

    return (isString(outputValue) || isFunction(outputValue))
      ? outputValue
      : preferredLocale in outputValue
        ? outputValue[preferredLocale]
        : outputValue[matchedDictionary.defaultLanguage]
  }

  lookupText.dictionaries = dictionaries;

  return lookupText;
}
