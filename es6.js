// Utils
const isNull = v => v === null;
const isArray = v => Array.isArray(v);
const isString = v => typeof v === 'string';
const isDefined = v => typeof v !== 'undefined';
const isNonEmptyString = v => isString(v) && v.length;
const isFunction = v => typeof v === 'function';
const isObject = v => typeof v === 'object' && !isNull(v) && !isArray(v);
const getKeys = v => isObject(v) ? Object.keys(v) : [];
const splitBy = (v, d) => !isString(v) ? [] : v.split(d).filter(isNonEmptyString);

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
    && value._isDictionaryObject
    && isNonEmptyString(value.defaultLanguage);
}

function createDictionary (defaultLanguage, ...dictionaryValues) {
  if (!isNonEmptyString(defaultLanguage))
    throw new TypeError(`${defaultLanguage} is not a non-empty <String>.`);
  if (!isObject(dictionaryValues) && !isArray(dictionaryValues))
    throw new TypeError(`${dictionaryValues} is not an <Object|Array>.`);
  if (isDictionary(dictionaryValues))
    return dictionaryValues;

  const sourceList = isObject(dictionaryValues) ? [ dictionaryValues ] : dictionaryValues;
  const flatSourceList = sourceList.map(item => isDictionary(item) ? item.entries : item);
  const entries = mergeDeep(...flatSourceList);

  return { entries, defaultLanguage, _isDictionaryObject: true };
}

const _preferredLocale = { current: 'en' };

function getPreferredLocale () {
  return _preferredLocale.current;
}

function setPreferredLocale (newValue) {
  return _preferredLocale.current = newValue;
}

function createLexer (dictionary) {
  if (!isDictionary(dictionary))
    throw new TypeError(`${dictionary} is not a dictionary-like <Object> (use createDictionary()).`);

  const { defaultLanguage } = dictionary;

  return function lookupText (lookupId) {
    const languageCode = getPreferredLocale();

    if (!isNonEmptyString(lookupId))
      throw new TypeError(`${lookupId} is not a non-empty <String>.`);

    const cleanLookupId = lookupId.replace(/[^a-zA-Z0-9.-_\s]+/g, '');
    const outputValue = getDeep(dictionary.entries, cleanLookupId);

    if (!isString(outputValue) && !isFunction(outputValue) && !isObject(outputValue)) {
      return null;
    }

    return (isString(outputValue) || isFunction(outputValue))
      ? outputValue
      : languageCode in outputValue
        ? outputValue[languageCode]
        : outputValue[defaultLanguage]
  }
}

export { createLexer, createDictionary, setPreferredLocale, getPreferredLocale };
