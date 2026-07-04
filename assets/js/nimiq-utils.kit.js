"use strict";
var NimiqUtils = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // kit-entry.ts
  var kit_entry_exports = {};
  __export(kit_entry_exports, {
    Clipboard: () => Clipboard,
    CurrencyInfo: () => CurrencyInfo,
    FormattableNumber: () => FormattableNumber,
    RequestLinkEncoding: () => RequestLinkEncoding_exports,
    Tweenable: () => Tweenable_default,
    ValidationUtils: () => ValidationUtils,
    toNonScientificNumberString: () => toNonScientificNumberString
  });

  // src/formattable-number/FormattableNumber.ts
  var _FormattableNumber = class _FormattableNumber {
    constructor(value) {
      __publicField(this, "_digits");
      __publicField(this, "_decimalSeparatorPosition");
      __publicField(this, "_sign");
      if (typeof value !== "string") {
        value = value.toString();
      }
      const numberMatch = value.match(_FormattableNumber.NUMBER_REGEX);
      if (!numberMatch)
        throw new Error(`${value} is not a valid number`);
      this._sign = numberMatch[1];
      this._digits = `${numberMatch[2]}${numberMatch[3]}`;
      if (!this._digits)
        throw new Error(`${value} is not a valid number`);
      this._decimalSeparatorPosition = numberMatch[2].length;
      const exponent = Number.parseInt(numberMatch[5], 10);
      if (exponent)
        this.moveDecimalSeparator(exponent);
    }
    toString(optionsOrUseGrouping) {
      let {
        maxDecimals = void 0,
        minDecimals = void 0,
        useGrouping = optionsOrUseGrouping === true,
        groupSeparator = "\u202F"
      } = typeof optionsOrUseGrouping === "object" ? optionsOrUseGrouping : {};
      if (maxDecimals !== void 0 && minDecimals !== void 0) {
        minDecimals = Math.min(minDecimals, maxDecimals);
      }
      if (maxDecimals !== void 0 && maxDecimals < this._digits.length - this._decimalSeparatorPosition) {
        this.round(maxDecimals);
      }
      let integers = this._digits.slice(0, this._decimalSeparatorPosition).replace(/^0+/, "");
      let decimals = this._digits.slice(this._decimalSeparatorPosition).replace(/0+$/, "");
      if (minDecimals !== void 0 && minDecimals > decimals.length) {
        decimals = decimals.padEnd(minDecimals, "0");
      }
      if (useGrouping && groupSeparator && integers.length > 4) {
        integers = integers.replace(/(\d)(?=(\d{3})+$)/g, `$1${groupSeparator}`);
      }
      return `${this._sign}${integers || "0"}${decimals ? `.${decimals}` : ""}`;
    }
    valueOf() {
      return this.toString();
    }
    moveDecimalSeparator(moveBy) {
      this._decimalSeparatorPosition += moveBy;
      if (this._decimalSeparatorPosition > this._digits.length) {
        this._digits = this._digits.padEnd(this._decimalSeparatorPosition, "0");
      } else if (this._decimalSeparatorPosition < 0) {
        this._digits = this._digits.padStart(this._digits.length - this._decimalSeparatorPosition, "0");
        this._decimalSeparatorPosition = 0;
      }
      return this;
    }
    round(decimals) {
      if (this._digits.length - this._decimalSeparatorPosition <= decimals)
        return this;
      const firstCutOffIndex = this._decimalSeparatorPosition + decimals;
      const digitsToKeep = this._digits.substring(0, firstCutOffIndex).padEnd(this._decimalSeparatorPosition, "0");
      if (Number.parseInt(this._digits[firstCutOffIndex], 10) < 5) {
        this._digits = digitsToKeep;
        return this;
      }
      const digits = `0${digitsToKeep}`.split("");
      const lastRemainingIndex = firstCutOffIndex;
      for (let i = lastRemainingIndex; i >= 0; --i) {
        const newDigit = Number.parseInt(digits[i], 10) + 1;
        if (newDigit < 10) {
          digits[i] = newDigit.toString();
          break;
        } else {
          digits[i] = "0";
        }
      }
      this._digits = digits.join("");
      this._decimalSeparatorPosition += 1;
      return this;
    }
    equals(other) {
      if (!(other instanceof _FormattableNumber)) {
        try {
          other = new _FormattableNumber(other);
        } catch (e) {
          return false;
        }
      }
      return this.toString() === other.toString();
    }
  };
  __publicField(_FormattableNumber, "NUMBER_REGEX", /^(-?)(\d*)\.?(\d*)(e(-?\d+))?$/);
  var FormattableNumber = _FormattableNumber;
  function toNonScientificNumberString(value) {
    return new FormattableNumber(value).toString();
  }

  // src/currency-info/CurrencyInfo.ts
  var _CurrencyInfo = class _CurrencyInfo {
    constructor(currencyCode, decimalsOrLocaleOrOptions, name, symbol) {
      __publicField(this, "code");
      __publicField(this, "symbol");
      __publicField(this, "name");
      __publicField(this, "decimals");
      __publicField(this, "locale");
      if (!_CurrencyInfo.CURRENCY_CODE_REGEX.test(currencyCode)) {
        throw new Error(`Invalid currency code ${currencyCode}`);
      }
      let decimals;
      let locale;
      if (typeof decimalsOrLocaleOrOptions === "number") {
        decimals = decimalsOrLocaleOrOptions;
      } else if (typeof decimalsOrLocaleOrOptions === "string") {
        locale = decimalsOrLocaleOrOptions;
      } else if (typeof decimalsOrLocaleOrOptions === "object") {
        ({ decimals, name, symbol, locale } = decimalsOrLocaleOrOptions);
      }
      this.code = currencyCode.toUpperCase();
      const currencyCountry = this.code.substring(0, 2);
      const isBrowserEnv = typeof globalThis.navigator !== "undefined";
      const nameLocalesToTry = [
        ...locale ? [locale] : [],
        // try requested locale
        ...isBrowserEnv ? [`${navigator.language.substring(0, 2)}-${currencyCountry}`] : [],
        // user language as spoken in currency country
        ...isBrowserEnv ? [navigator.language] : []
        // fallback
      ];
      let supportsDisplayNames = "DisplayNames" in Intl;
      [this.locale] = supportsDisplayNames ? Intl.DisplayNames.supportedLocalesOf(nameLocalesToTry) : Intl.NumberFormat.supportedLocalesOf(nameLocalesToTry);
      if (supportsDisplayNames && !this.locale) {
        supportsDisplayNames = false;
        [this.locale] = Intl.NumberFormat.supportedLocalesOf(nameLocalesToTry);
      }
      const isAutoGenerated = decimals === void 0 && name === void 0 && symbol === void 0;
      const cacheKey = `${this.code} ${this.locale}`;
      const cachedCurrencyInfo = _CurrencyInfo.CACHED_AUTO_GENERATED_CURRENCY_INFOS[cacheKey];
      if (isAutoGenerated && cachedCurrencyInfo) {
        return cachedCurrencyInfo;
      }
      let formattedString;
      const formatterOptions = {
        style: "currency",
        currency: currencyCode,
        // without toUpperCase to avoid conversion of characters, e.g. Eszett to SS
        useGrouping: false,
        numberingSystem: "latn"
      };
      if (name !== void 0) {
        this.name = name;
      } else if (cachedCurrencyInfo) {
        this.name = cachedCurrencyInfo.name;
      } else if (supportsDisplayNames) {
        try {
          this.name = new Intl.DisplayNames(this.locale, { type: "currency" }).of(currencyCode);
        } catch (e) {
        }
      }
      if (!this.name) {
        formattedString = _CurrencyInfo.failsafeNumberToLocaleString(
          0,
          this.locale,
          { currencyDisplay: "name", ...formatterOptions }
        );
        this.name = formattedString ? formattedString.replace(_CurrencyInfo.NUMBER_REGEX, "").trim() : this.code;
      }
      if (symbol !== void 0) {
        this.symbol = symbol;
      } else if (cachedCurrencyInfo) {
        this.symbol = cachedCurrencyInfo.symbol;
      } else {
        const extraSymbol = _CurrencyInfo.EXTRA_SYMBOLS[this.code];
        if (typeof extraSymbol === "string") {
          this.symbol = extraSymbol;
        } else if (Array.isArray(extraSymbol)) {
          const useRightToLeft = this.locale === locale && _CurrencyInfo.RIGHT_TO_LEFT_DETECTION_REGEX.test(this.name);
          this.symbol = extraSymbol[useRightToLeft ? 1 : 0];
        } else {
          const symbolLocalesToTry = [
            ...locale ? [locale] : [],
            // try requested locale
            `en-${currencyCountry}`,
            "en"
          ];
          const symbolFormattedString = _CurrencyInfo.failsafeNumberToLocaleString(
            0,
            symbolLocalesToTry,
            { currencyDisplay: "narrowSymbol", ...formatterOptions }
            // not supported on older browsers
          ) || _CurrencyInfo.failsafeNumberToLocaleString(
            0,
            symbolLocalesToTry,
            { currencyDisplay: "symbol", ...formatterOptions }
          );
          if (symbolFormattedString) {
            formattedString = symbolFormattedString;
            this.symbol = formattedString.replace(_CurrencyInfo.NUMBER_REGEX, "").trim();
          } else {
            this.symbol = this.code;
          }
        }
      }
      if (decimals !== void 0) {
        this.decimals = decimals;
      } else if (cachedCurrencyInfo) {
        this.decimals = cachedCurrencyInfo.decimals;
      } else if (_CurrencyInfo.CUSTOM_DECIMAL_LESS_CURRENCIES.has(this.code)) {
        this.decimals = 0;
      } else {
        formattedString = formattedString || _CurrencyInfo.failsafeNumberToLocaleString(
          0,
          "en",
          { currencyDisplay: "code", ...formatterOptions }
        );
        if (formattedString) {
          const numberMatch = formattedString.match(_CurrencyInfo.NUMBER_REGEX);
          this.decimals = numberMatch ? (numberMatch[1] || "").length : 2;
        } else {
          this.decimals = 2;
        }
      }
      if (isAutoGenerated) {
        _CurrencyInfo.CACHED_AUTO_GENERATED_CURRENCY_INFOS[cacheKey] = this;
      }
    }
    static failsafeNumberToLocaleString(value, locales, options) {
      try {
        return value.toLocaleString(
          locales,
          options
        );
      } catch (e) {
        return null;
      }
    }
    /* eslint-enable lines-between-class-members */
  };
  // This is a manually curated list which was created mainly from
  // https://en.wikipedia.org/wiki/List_of_circulating_currencies with help of the following script run
  // on that wikipedia page. Note that we don't just use the ISO 4217 list of currency codes directly, as
  // it includes some additional codes which are not actual fiat currency codes (see
  // https://en.wikipedia.org/wiki/ISO_4217#X_currencies). Also note that there are also already nicely
  // parsable npm packages like https://github.com/bengourley/currency-symbol-map/blob/master/map.js
  // or https://github.com/smirzaei/currency-formatter/blob/master/currencies.json. However, they both
  // seem to be less accurate than the Wikipedia article (see e.g. KGS), missing some currencies (e.g. MRU)
  // and contain some non-fiat currencies like crypto currencies. When unsure about a currency sign, also
  // consult https://en.wikipedia.org/wiki/Currency_symbol#List_of_currency_symbols_currently_in_use.
  //
  // const EXTRA_SYMBOLS = {
  //     as defined below
  // };
  //
  // function parseWikipediaCurrencyList() {
  //     const sectionHeadline = document.querySelector('#List_of_circulating_currencies_by_state_or_territory')
  //         .closest('div');
  //     const table = ((el) => {
  //         while (el.tagName !== 'TABLE' || !el.classList.contains('wikitable')) el = el.nextElementSibling;
  //         return el;
  //     })(sectionHeadline);
  //
  //     const currencySymbols = {};
  //
  //     for (const row of table.querySelectorAll('tbody tr')) {
  //         // count columns from the end because not all rows have the same number of columns as on some rows, the
  //         // first column is omitted if the cell in the first column of a previous row spans multiple rows.
  //         const code = row.children[row.childElementCount - 3].textContent.trim();
  //         if (code.includes('none')) continue;
  //         const symbols = row.children[row.childElementCount - 4].textContent.trim()
  //             .replace(/\s*\(.+\)\s*/g, '') // remove comments
  //             .split(/ or |, /);
  //         if (symbols.length === 1 && !symbols[0]) continue;
  //
  //         var entry = currencySymbols[code] || [];
  //         symbols.forEach((symbol) => {
  //             if (!entry.includes(symbol)) entry.push(symbol);
  //         });
  //         currencySymbols[code] = entry;
  //     }
  //
  //     return currencySymbols;
  // }
  //
  // // simplified from CurrencyInfo and removed checking for navigator.language to remove the dependency of this code
  // // snippet from the tester's browser language.
  // function getBrowserCurrencySymbol(currencyCode) {
  //     const currencyCountry = currencyCode.substring(0, 2);
  //
  //     const [locale] = Intl.NumberFormat.supportedLocalesOf([ // also normalizes the locales
  //         `en-${currencyCountry}`, // English as spoken in currency country
  //         'en-US', // en-US as last resort
  //     ]);
  //     const formatterOptions = {
  //         style: 'currency',
  //         currency: currencyCode,
  //         useGrouping: false,
  //         numberingSystem: 'latn',
  //     };
  //
  //     let formattedString = (0).toLocaleString(
  //         locale,
  //         { currencyDisplay: 'narrowSymbol', ...formatterOptions },
  //     );
  //
  //     return formattedString.replace(/\d+(?:\D(\d+))?/, '').trim();
  // }
  //
  // function isRightToLeft(s){
  //     return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(s);
  // };
  //
  // const referenceCurrencySymbols = parseWikipediaCurrencyList();
  //
  // for (const currency of Object.keys(referenceCurrencySymbols).sort()) {
  //     const referenceSymbols = referenceCurrencySymbols[currency];
  //     const extraSymbols = !EXTRA_SYMBOLS[currency]
  //         ? []
  //         : Array.isArray(EXTRA_SYMBOLS[currency])
  //             ? EXTRA_SYMBOLS[currency]
  //             : [EXTRA_SYMBOLS[currency]];
  //     const browserSymbol = getBrowserCurrencySymbol(currency);
  //
  //     if (extraSymbols.length) {
  //         if (referenceSymbols.includes(browserSymbol) && !isRightToLeft(browserSymbol)) {
  //             console.warn(`${currency}: potentially unnecessary definition in EXTRA_SYMBOLS. `
  //                 + `Reference symbols are ${referenceSymbols}; extra symbols are ${extraSymbols}; `
  //                 + `browser symbol is ${browserSymbol}.`);
  //         } else {
  //             console.info(`${currency}: manually defined via EXTRA_SYMBOLS. `
  //                 + `Reference symbols are ${referenceSymbols}; extra symbols are ${extraSymbols}; `
  //                 + `browser symbol is ${browserSymbol}.`);
  //         }
  //
  //         if (!extraSymbols.some((symbol) => referenceSymbols.includes(symbol))) {
  //             console.warn(`${currency}: mismatch between reference symbols and EXTRA_SYMBOLS. `
  //                 + `Reference symbols are ${referenceSymbols}; extra symbols are ${extraSymbols}; `
  //                 + `browser symbol is ${browserSymbol}.`);
  //         }
  //     } else {
  //         if (!referenceSymbols.includes(browserSymbol) && browserSymbol === currency) {
  //             console.warn(`${currency}: missing in EXTRA_SYMBOLS. `
  //                 + `Reference symbols are ${referenceSymbols}; browser symbol is ${browserSymbol}. `
  //                 + `Add as ${currency}: ${referenceSymbols.length > 1
  //                     ? `['${referenceSymbols.join(`', '`)}']`
  //                     : `'${referenceSymbols}'`},`);
  //         } else {
  //             console.info(`${currency}: Saved explicit definition of extra symbol.  `
  //                 + `Reference symbols are ${referenceSymbols}; `
  //                 + `browser symbol is ${browserSymbol}.`);
  //         }
  //
  //         if (isRightToLeft(browserSymbol)) {
  //             console.warn(`${currency}: browser symbol is right to left. `
  //                 + `Reference symbols are ${referenceSymbols}; extra symbols are ${extraSymbols}; `
  //                 + `browser symbol is ${browserSymbol}.`);
  //         }
  //     }
  // }
  __publicField(_CurrencyInfo, "EXTRA_SYMBOLS", {
    AED: ["DH", "\u062F.\u0625"],
    AFN: ["Afs", "\u060B"],
    ALL: "L",
    ANG: "\u0192",
    AWG: "\u0192",
    BGN: "\u043B\u0432.",
    BHD: ["BD", ".\u062F.\u0628"],
    BTN: "Nu.",
    BYN: "Br",
    CDF: "Fr",
    CHF: "Fr.",
    CVE: "$",
    DJF: "Fr",
    DZD: ["DA", "\u062F.\u062C"],
    EGP: ["\xA3", "\u062C.\u0645"],
    ETB: "Br",
    HTG: "G",
    IQD: ["ID", "\u0639.\u062F"],
    IRR: ["RI", "\uFDFC"],
    JOD: ["JD", "\u062F.\u0627"],
    KES: "Sh",
    KGS: "\u20C0",
    KWD: ["KD", "\u062F.\u0643"],
    LBP: ["LL", "\u0644.\u0644"],
    LSL: "M",
    // mismatch to Wikipedia's L because M is used for plural
    LYD: ["LD", "\u0644.\u062F"],
    MAD: ["DH", "\u062F\u0631\u0647\u0645"],
    // mismatch to Wikipedia as the actual wiki article shows different symbols, also in Arabic
    MDL: "L",
    MKD: "\u0434\u0435\u043D",
    MMK: "Ks",
    // Ks for plural
    MRU: "UM",
    MVR: ["Rf", ".\u0783"],
    MZN: "MT",
    NPR: "\u0930\u0941",
    // mismatch to Wikipedia as actual wiki article shows it as रु, also in Nepali
    OMR: ["R.O.", "\u0631.\u0639."],
    PAB: "B/.",
    PEN: "S/",
    // mismatch to Wikipedia as actual wiki article shows it as S/, also in Spanish
    QAR: ["QR", "\u0631.\u0642"],
    RSD: "\u0434\u0438\u043D.",
    SAR: ["SR", "\uFDFC"],
    SDG: ["\xA3SD", "\u062C.\u0633."],
    SLE: "Le",
    SOS: "Sh.",
    TJS: "SM",
    // mismatch to Wikipedia as actual wiki article shows it as SM
    TMT: "m",
    // mismatch to Wikipedia as actual wiki article shows it as m
    TND: ["DT", "\u062F.\u062A"],
    UZS: "\u0441\u0443\u043C",
    // mismatch to Wikipedia as actual wiki article shows it as сум
    VED: "Bs.D",
    VES: "Bs.S",
    WST: "T",
    XPF: "\u20A3",
    YER: ["RI", "\uFDFC"],
    ZWG: "ZiG",
    ZWL: "Z$"
  });
  // Some currencies have been devalued so much by inflation that their sub-units have been removed from circulation
  // or are effectively not being used anymore. This is not for all currencies reflected yet in toLocaleString, such
  // that we mark some currencies manually as decimal-less. This list has been assembled manually from the list of all
  // circulating currencies (https://en.wikipedia.org/wiki/List_of_circulating_currencies) by first reducing it to
  // currencies that still have decimals via the following script, and then looking through their Wikipedia articles.
  //
  // const referenceCurrencySymbols = parseWikipediaCurrencyList(); // as defined above
  // for (const currency of Object.keys(referenceCurrencySymbols).sort()) {
  //     const country = currency.substring(0, 2);
  //     const formatted = (2).toLocaleString([`en-${country}`], {
  //         style: 'currency',
  //         currency: currency,
  //         currencyDisplay: 'narrowSymbol',
  //         numberingSystem: 'latn',
  //     });
  //     const numberMatch = formatted.match(/\d+(?:\D(\d+))?/);
  //     const decimals = numberMatch ? (numberMatch[1] || '').length : 2;
  //     if (!decimals) continue;
  //     console.log(`${currency} - ${decimals}\n`);
  // }
  __publicField(_CurrencyInfo, "CUSTOM_DECIMAL_LESS_CURRENCIES", /* @__PURE__ */ new Set([
    "AMD",
    // sub-unit rarely used
    "AOA",
    // sub-unit rarely used
    "ARS",
    // sub-unit discontinued
    "BDT",
    // sub-unit discontinued
    "BTN",
    // sub-unit rarely used
    "CDF",
    // sub-unit rarely used
    "COP",
    // sub-unit rarely used
    "CRC",
    // sub-unit discontinued
    "CVE",
    // sub-unit discontinued
    "CZK",
    // sub-unit discontinued
    "DOP",
    // sub-unit rarely used
    "DZD",
    // sub-unit discontinued
    "GMD",
    // sub-unit discontinued
    "GYD",
    // sub-unit discontinued
    "HUF",
    // sub-unit discontinued
    "IDR",
    // sub-unit discontinued
    "INR",
    // sub-unit discontinued
    "JMD",
    // sub-unit discontinued
    "KES",
    // sub-unit rarely used
    "KGS",
    // sub-unit rarely used
    "KHR",
    // sub-unit discontinued
    "KZT",
    // sub-unit rarely used
    "LKR",
    // sub-unit discontinued
    "MAD",
    // sub-unit rarely used
    "MKD",
    // sub-unit discontinued
    "MNT",
    // sub-unit discontinued
    "MOP",
    // sub-unit discontinued
    "MWK",
    // sub-unit rarely used
    "MXN",
    // sub-unit rarely used
    "NGN",
    // sub-unit rarely used
    "NOK",
    // sub-unit discontinued
    "NPR",
    // sub-unit rarely used
    "PHP",
    // sub-unit rarely used
    "PKR",
    // sub-unit discontinued
    "RUB",
    // sub-unit rarely used
    "SEK",
    // sub-unit discontinued
    "TWD",
    // sub-unit discontinued
    "TZS",
    // sub-unit discontinued
    "UAH",
    // sub-unit discontinued
    "UYU",
    // sub-unit discontinued
    "UZS",
    // sub-unit discontinued
    "VES"
    // sub-unit rarely used
  ]));
  // Cache auto-generated CurrencyInfos such that they do not need to be recalculated.
  __publicField(_CurrencyInfo, "CACHED_AUTO_GENERATED_CURRENCY_INFOS", {});
  // Regex for detecting valid currency codes.
  __publicField(_CurrencyInfo, "CURRENCY_CODE_REGEX", /[A-Z]{3}/i);
  // Regex for detecting the number with optional decimals in a formatted string for useGrouping: false
  __publicField(_CurrencyInfo, "NUMBER_REGEX", /\d+(?:\D(\d+))?/);
  // Simplified and adapted from https://stackoverflow.com/a/14824756.
  // Note that this rtl detection is incomplete but good enough for our needs.
  __publicField(_CurrencyInfo, "RIGHT_TO_LEFT_DETECTION_REGEX", /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/);
  var CurrencyInfo = _CurrencyInfo;

  // src/tweenable/Tweenable.ts
  var Tweenable = class _Tweenable {
    constructor(targetValue = 0, startValue = targetValue, tweenTime = 0, startTime = Date.now(), easing = _Tweenable.Easing.EASE_IN_OUT_CUBIC) {
      this.targetValue = targetValue;
      this.startValue = startValue;
      this.tweenTime = tweenTime;
      this.startTime = startTime;
      this.easing = easing;
    }
    get currentValue() {
      const easedProgress = this.easing(this.progress);
      return this.startValue + (this.targetValue - this.startValue) * easedProgress;
    }
    get progress() {
      if (this.tweenTime === 0)
        return 1;
      return Math.min(1, (Date.now() - this.startTime) / this.tweenTime);
    }
    get finished() {
      return this.progress === 1;
    }
    tweenTo(targetValue, tweenTime = this.tweenTime) {
      if (targetValue === this.targetValue)
        return;
      this.startValue = this.currentValue;
      this.targetValue = targetValue;
      this.startTime = Date.now();
      this.tweenTime = tweenTime;
    }
  };
  ((Tweenable2) => {
    Tweenable2.Easing = {
      // tslint:disable-line variable-name
      LINEAR: (t) => t,
      EASE_IN_OUT_CUBIC: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      // At some point would be nice to add the default nimiq easing function here which is cubic-bezier(.25,0,0,1)
      // (https://cubic-bezier.com/#.25,0,0,1). This is a cubic Bezier curve with P0=(0,0), P1=(.25,0),
      // P2=(0,1), P3=(1,1) (https://developer.mozilla.org/en-US/docs/Web/CSS/timing-function).
      // However, the standard bezier curve equation that can be constructed from these points as described in
      // https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves generates points (x,y) of the
      // easing function depending on a parameter t which describes the advancement on the curve. However, here our
      // t denotes the advancement along the x-axis (time) and we're interested in the eased value y. Therefore the
      // equation needs to be solved for y depending on x (see https://stackoverflow.com/q/8217346). This could also
      // be done computationally as described in https://stackoverflow.com/a/11697909.
      // See http://greweb.me/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/ for a
      // summary.
    };
  })(Tweenable || (Tweenable = {}));
  var Tweenable_default = Tweenable;

  // src/validation-utils/ValidationUtils.ts
  var ValidationUtils = class _ValidationUtils {
    static isValidAddress(address) {
      if (!address)
        return false;
      try {
        this.isUserFriendlyAddress(address);
        return true;
      } catch (e) {
        return false;
      }
    }
    static normalizeAddress(address) {
      return address.toUpperCase().replace(/[\s+-]|%20/g, "").replace(/(.)(?=(.{4})+$)/g, "$1 ");
    }
    // Copied from: https://github.com/nimiq-network/core/blob/master/src/main/generic/consensus/base/account/Address.js
    static isUserFriendlyAddress(str) {
      if (!str)
        return;
      str = str.replace(/ /g, "");
      if (str.substr(0, 2).toUpperCase() !== "NQ") {
        throw new Error("Addresses start with NQ");
      }
      if (str.length !== 36) {
        throw new Error("Addresses are 36 chars (ignoring spaces)");
      }
      if (!this._alphabetCheck(str)) {
        throw new Error("Address has invalid characters");
      }
      if (this._ibanCheck(str.substr(4) + str.substr(0, 4)) !== 1) {
        throw new Error("Address Checksum invalid");
      }
    }
    static _alphabetCheck(str) {
      str = str.toUpperCase();
      for (let i = 0; i < str.length; i++) {
        if (!_ValidationUtils.NIMIQ_ALPHABET.includes(str[i]))
          return false;
      }
      return true;
    }
    static _ibanCheck(str) {
      const num = str.split("").map((c) => {
        const code = c.toUpperCase().charCodeAt(0);
        return code >= 48 && code <= 57 ? c : (code - 55).toString();
      }).join("");
      let tmp = "";
      for (let i = 0; i < Math.ceil(num.length / 6); i++) {
        tmp = (parseInt(tmp + num.substr(i * 6, 6), 10) % 97).toString();
      }
      return parseInt(tmp, 10);
    }
    static isValidHash(hash) {
      try {
        return atob(hash).length === 32;
      } catch (e) {
        return false;
      }
    }
    static get NIMIQ_ALPHABET() {
      return "0123456789ABCDEFGHJKLMNPQRSTUVXY";
    }
  };

  // src/request-link-encoding/RequestLinkEncoding.ts
  var RequestLinkEncoding_exports = {};
  __export(RequestLinkEncoding_exports, {
    Currency: () => Currency,
    ETHEREUM_SUPPORTED_CONTRACTS: () => ETHEREUM_SUPPORTED_CONTRACTS,
    ETHEREUM_SUPPORTED_CONTRACTS_REVERSE_LOOKUP: () => ETHEREUM_SUPPORTED_CONTRACTS_REVERSE_LOOKUP,
    ETHEREUM_SUPPORTED_NATIVE_CURRENCIES: () => ETHEREUM_SUPPORTED_NATIVE_CURRENCIES,
    EthereumChain: () => EthereumChain,
    NimiqRequestLinkType: () => NimiqRequestLinkType,
    createBitcoinRequestLink: () => createBitcoinRequestLink,
    createEthereumRequestLink: () => createEthereumRequestLink,
    createNimiqRequestLink: () => createNimiqRequestLink,
    createRequestLink: () => createRequestLink,
    parseBitcoinRequestLink: () => parseBitcoinRequestLink,
    parseEthereumRequestLink: () => parseEthereumRequestLink,
    parseNimiqSafeRequestLink: () => parseNimiqSafeRequestLink,
    parseNimiqUriRequestLink: () => parseNimiqUriRequestLink,
    parseRequestLink: () => parseRequestLink
  });

  // src/utf8-tools/Utf8Tools.ts
  var Utf8Tools = class _Utf8Tools {
    static stringToUtf8ByteArray(str) {
      const encoder = new TextEncoder();
      return encoder.encode(str);
    }
    static utf8ByteArrayToString(bytes) {
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(bytes);
    }
    static isValidUtf8(bytes, denyControlCharacters = false) {
      const controlCharsWhitelist = [
        9,
        /* horizontal tab (\t) */
        10,
        /* line feed (\n) */
        13
        /* carriage return (\r) */
      ];
      try {
        const decoder = new TextDecoder("utf-8", { fatal: true });
        const decoded = decoder.decode(bytes);
        if (!denyControlCharacters)
          return true;
        const controlCharsMatch = decoded.match(/[\u0000-\u001F\u007F]/gu);
        if (!controlCharsMatch)
          return true;
        return controlCharsMatch.every((char) => controlCharsWhitelist.includes(char.charCodeAt(0)));
      } catch (e) {
        return false;
      }
    }
    static truncateToUtf8ByteLength(input, length, applyEllipsis = true) {
      if (length < 0) {
        throw new Error("Invalid byte length");
      }
      let bytes;
      if (typeof input === "string") {
        bytes = _Utf8Tools.stringToUtf8ByteArray(input);
      } else {
        bytes = input;
      }
      if (bytes.length <= length) {
        return {
          result: input,
          didTruncate: false
        };
      }
      const ellipsisBytes = [226, 128, 166];
      if (length < ellipsisBytes.length)
        applyEllipsis = false;
      bytes = bytes.subarray(0, length - (applyEllipsis ? ellipsisBytes.length : 0));
      while (!_Utf8Tools.isValidUtf8(bytes))
        bytes = bytes.subarray(0, bytes.length - 1);
      if (applyEllipsis) {
        bytes = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.length + ellipsisBytes.length);
        if (typeof input !== "string") {
          bytes = new Uint8Array(bytes);
        }
        bytes.set(ellipsisBytes, bytes.length - ellipsisBytes.length);
      }
      return {
        result: typeof input === "string" ? _Utf8Tools.utf8ByteArrayToString(bytes) : bytes,
        didTruncate: true
      };
    }
    /* eslint-enable lines-between-class-members */
  };

  // src/request-link-encoding/RequestLinkEncoding.ts
  var Currency = /* @__PURE__ */ ((Currency2) => {
    Currency2["NIM"] = "nim";
    Currency2["BTC"] = "btc";
    Currency2["ETH"] = "eth";
    Currency2["MATIC"] = "matic";
    Currency2["USDC"] = "usdc";
    Currency2["USDT"] = "usdt";
    return Currency2;
  })(Currency || {});
  var DECIMALS = {
    ["nim" /* NIM */]: 5,
    ["btc" /* BTC */]: 8,
    ["eth" /* ETH */]: 18,
    ["matic" /* MATIC */]: 18,
    ["usdc" /* USDC */]: 6,
    ["usdt" /* USDT */]: 6
  };
  var EthereumChain = /* @__PURE__ */ ((EthereumChain2) => {
    EthereumChain2[EthereumChain2["ETHEREUM_MAINNET"] = 1] = "ETHEREUM_MAINNET";
    EthereumChain2[EthereumChain2["ETHEREUM_SEPOLIA_TESTNET"] = 11155111] = "ETHEREUM_SEPOLIA_TESTNET";
    EthereumChain2[EthereumChain2["POLYGON_MAINNET"] = 137] = "POLYGON_MAINNET";
    EthereumChain2[EthereumChain2["POLYGON_AMOY_TESTNET"] = 80002] = "POLYGON_AMOY_TESTNET";
    return EthereumChain2;
  })(EthereumChain || {});
  var EthereumBlockchainName = /* @__PURE__ */ ((EthereumBlockchainName2) => {
    EthereumBlockchainName2["ETHEREUM"] = "ethereum";
    EthereumBlockchainName2["POLYGON"] = "polygon";
    return EthereumBlockchainName2;
  })(EthereumBlockchainName || {});
  var ETHEREUM_SUPPORTED_NATIVE_CURRENCIES = ["eth" /* ETH */, "matic" /* MATIC */];
  var ETHEREUM_SUPPORTED_CONTRACTS = {
    [1 /* ETHEREUM_MAINNET */]: {
      ["usdc" /* USDC */]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      ["usdt" /* USDT */]: "0xdac17f958d2ee523a2206206994597c13d831ec7"
    },
    [11155111 /* ETHEREUM_SEPOLIA_TESTNET */]: {
      ["usdc" /* USDC */]: "0xf08a50178dfcde18524640ea6618a1f965821715",
      ["usdt" /* USDT */]: "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0"
    },
    [137 /* POLYGON_MAINNET */]: {
      ["usdc" /* USDC */]: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      ["usdt" /* USDT */]: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    },
    [80002 /* POLYGON_AMOY_TESTNET */]: {
      ["usdc" /* USDC */]: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
      ["usdt" /* USDT */]: "0x1616d425cd540b256475cbfb604586c8598ec0fb"
    }
  };
  var ETHEREUM_SUPPORTED_CONTRACTS_REVERSE_LOOKUP = {};
  for (const [chainId, chainContracts] of Object.entries(ETHEREUM_SUPPORTED_CONTRACTS)) {
    for (const [currency, address] of Object.entries(chainContracts)) {
      ETHEREUM_SUPPORTED_CONTRACTS_REVERSE_LOOKUP[address] = [
        parseInt(chainId, 10),
        currency
      ];
    }
  }
  var ETHEREUM_PATH_REGEX = new RegExp("^(?:pay-)?([^@/?]+)(?:@([^/?]+))?(?:/([^?]+))?$");
  var NimiqRequestLinkType = /* @__PURE__ */ ((NimiqRequestLinkType2) => {
    NimiqRequestLinkType2["SAFE"] = "safe";
    NimiqRequestLinkType2["URI"] = "nimiq";
    NimiqRequestLinkType2["WEBURI"] = "web+nim";
    return NimiqRequestLinkType2;
  })(NimiqRequestLinkType || {});
  function createRequestLink(recipient, amountOrOptions, message, basePath = typeof globalThis.window !== "undefined" ? globalThis.window.location.host : "wallet.nimiq.com") {
    if (typeof amountOrOptions === "object") {
      switch (amountOrOptions.currency) {
        case "nim" /* NIM */:
          return createNimiqRequestLink(recipient, amountOrOptions);
        case "btc" /* BTC */:
          return createBitcoinRequestLink(recipient, amountOrOptions);
        case "eth" /* ETH */:
        case "matic" /* MATIC */:
        case "usdc" /* USDC */:
        case "usdt" /* USDT */:
          return createEthereumRequestLink(recipient, amountOrOptions.currency, amountOrOptions);
        default:
          throw new Error("Unsupported currency.");
      }
    }
    const amount = typeof amountOrOptions !== "undefined" ? amountOrOptions * 10 ** DECIMALS["nim" /* NIM */] : void 0;
    return createNimiqRequestLink(recipient, { amount, message, basePath });
  }
  function parseRequestLink(requestLink, options = {}) {
    const currencies = options.currencies || Object.values(Currency);
    const isValidAddress = options.isValidAddress || {};
    const normalizeAddress = options.normalizeAddress || {};
    const { expectedNimiqSafeRequestLinkBasePath } = options;
    const url = toUrl(requestLink);
    if (!url)
      return null;
    const addCurrencyToResult = (parsedRequestLink, currency) => parsedRequestLink ? { ...parsedRequestLink, currency } : null;
    if (currencies.includes("nim" /* NIM */) && /^(web\+)?nim(iq)?:$/i.test(url.protocol)) {
      return addCurrencyToResult(parseNimiqUriRequestLink(url), "nim" /* NIM */);
    }
    if (currencies.includes("nim" /* NIM */) && /^https?:$/i.test(url.protocol)) {
      return addCurrencyToResult(parseNimiqSafeRequestLink(url, expectedNimiqSafeRequestLinkBasePath), "nim" /* NIM */);
    }
    if (currencies.includes("btc" /* BTC */) && /^bitcoin:$/i.test(url.protocol)) {
      return addCurrencyToResult(
        parseBitcoinRequestLink(url, isValidAddress["btc" /* BTC */], normalizeAddress["btc" /* BTC */]),
        "btc" /* BTC */
      );
    }
    if ([...ETHEREUM_SUPPORTED_NATIVE_CURRENCIES, "usdc" /* USDC */, "usdt" /* USDT */].some((currency) => currencies.includes(currency)) && new RegExp(`^(${Object.values(EthereumBlockchainName).join("|")}):$`, "i").test(url.protocol)) {
      const parsedRequestLink = parseEthereumRequestLink(
        url,
        isValidAddress["eth" /* ETH */],
        normalizeAddress["eth" /* ETH */]
      );
      if (parsedRequestLink && currencies.includes(parsedRequestLink.currency)) {
        return parsedRequestLink;
      }
    }
    return null;
  }
  var defaultCreateNimiqRequestLinkOptions = {
    basePath: typeof globalThis.window !== "undefined" ? globalThis.window.location.host : "wallet.nimiq.com"
  };
  function createNimiqRequestLink(recipient, options = defaultCreateNimiqRequestLinkOptions) {
    const { amount, message, label, basePath, type = "safe" /* SAFE */ } = options;
    if (!ValidationUtils.isValidAddress(recipient))
      throw new Error(`Not a valid address: ${recipient}`);
    if (amount && !isUnsignedSafeInteger(amount))
      throw new Error(`Not a valid amount: ${amount}`);
    if (message && (typeof message !== "string" || Utf8Tools.stringToUtf8ByteArray(message).byteLength > 64))
      throw new Error(`Not a valid message: ${message}`);
    if (label && typeof label !== "string")
      throw new Error(`Not a valid label: ${label}`);
    recipient = ValidationUtils.normalizeAddress(recipient).replace(/ /g, "");
    const amountNim = amount ? new FormattableNumber(amount).moveDecimalSeparator(-DECIMALS["nim" /* NIM */]).toString() : "";
    const query = [["recipient", recipient]];
    if (amountNim || message || label)
      query.push(["amount", amountNim || ""]);
    if (message || label)
      query.push(["message", encodeURIComponent(message || "")]);
    if (label)
      query.push(["label", encodeURIComponent(label)]);
    if (type === "safe" /* SAFE */) {
      const params = query.map((param) => param[1]);
      return `${basePath}${!basePath.endsWith("/") ? "/" : ""}#_request/${params.join("/")}_`;
    }
    if (type === "nimiq" /* URI */ || type === "web+nim" /* WEBURI */) {
      const address = query.shift()[1];
      const params = query.map(([key, value]) => value ? `${key}=${value}` : "").filter((param) => !!param);
      return `${type}:${address}${params.length ? "?" : ""}${params.join("&")}`;
    }
    throw new Error(`Unknown type: ${type}`);
  }
  function parseNimiqSafeRequestLink(requestLink, expectedBasePath) {
    const url = toUrl(requestLink);
    if (!url || expectedBasePath && url.host !== expectedBasePath)
      return null;
    const requestRegex = /_request\/(([^/]+)(\/[^/]*){0,2})_/;
    const requestRegexMatch = url.hash.match(requestRegex);
    if (!requestRegexMatch)
      return null;
    const optionsSubstr = requestRegexMatch[1];
    const [recipient, amount, message] = optionsSubstr.split("/").map((part) => part ? decodeURIComponent(part) : part);
    return parseNimiqParams({ recipient, amount, message });
  }
  function parseNimiqUriRequestLink(requestLink) {
    const url = toUrl(requestLink);
    if (!url || !/^(web\+)?nim(iq)?:$/i.test(url.protocol))
      return null;
    const recipient = url.pathname;
    const amount = url.searchParams.get("amount") || void 0;
    const label = url.searchParams.get("label") || void 0;
    const message = url.searchParams.get("message") || void 0;
    return parseNimiqParams({ recipient, amount, label, message });
  }
  function parseNimiqParams(params) {
    const recipient = ValidationUtils.normalizeAddress(params.recipient);
    if (!ValidationUtils.isValidAddress(recipient))
      return null;
    const amount = params.amount ? Math.round(parseFloat(params.amount) * 10 ** DECIMALS["nim" /* NIM */]) : void 0;
    if (typeof amount === "number" && !isUnsignedSafeInteger(amount))
      return null;
    const { label, message } = params;
    if (message && Utf8Tools.stringToUtf8ByteArray(message).byteLength > 64)
      return null;
    return { recipient, amount, label, message };
  }
  function createBitcoinRequestLink(recipient, options = {}) {
    if (!validateBitcoinAddress(recipient))
      throw new Error(`Invalid recipient address: ${recipient}`);
    if (options.amount && !isUnsignedSafeInteger(options.amount))
      throw new TypeError("Invalid amount");
    if (options.fee && !isUnsignedSafeInteger(options.fee))
      throw new TypeError("Invalid fee");
    const query = [];
    const validQueryKeys = ["amount", "fee", "label", "message"];
    validQueryKeys.forEach((key) => {
      const option = options[key];
      if (!option)
        return;
      const formattedValue = key === "amount" || key === "fee" ? new FormattableNumber(option).moveDecimalSeparator(-DECIMALS["btc" /* BTC */]).toString() : encodeURIComponent(option.toString());
      query.push(`${key}=${formattedValue}`);
    }, "");
    const queryString = query.length ? `?${query.join("&")}` : "";
    return `bitcoin:${recipient}${queryString}`;
  }
  function parseBitcoinRequestLink(requestLink, isValidAddress = validateBitcoinAddress, normalizeAddress = (address) => address) {
    const url = toUrl(requestLink);
    if (!url || !/^bitcoin:$/i.test(url.protocol))
      return null;
    const recipient = normalizeAddress(url.pathname);
    const rawAmount = url.searchParams.get("amount");
    const rawFee = url.searchParams.get("fee");
    const label = url.searchParams.get("label") || void 0;
    const message = url.searchParams.get("message") || void 0;
    if (!isValidAddress(recipient))
      return null;
    const amount = rawAmount ? Math.round(parseFloat(rawAmount) * 10 ** DECIMALS["btc" /* BTC */]) : void 0;
    if (typeof amount === "number" && !isUnsignedSafeInteger(amount))
      return null;
    const fee = rawFee ? Math.round(parseFloat(rawFee) * 10 ** DECIMALS["btc" /* BTC */]) : void 0;
    if (typeof fee === "number" && !isUnsignedSafeInteger(fee))
      return null;
    return { recipient, amount, fee, label, message };
  }
  function createEthereumRequestLink(recipient, currency, options) {
    const { amount, gasPrice, gasLimit, chainId } = options;
    const contractAddress = options.contractAddress || (chainId ? getEthereumContractAddress(chainId, currency) : void 0);
    if (!validateEthereumAddress(recipient))
      throw new TypeError(`Invalid recipient address: ${recipient}.`);
    if (amount && !isUnsignedSafeInteger(amount))
      throw new TypeError("Invalid amount");
    if (gasPrice && !isUnsignedSafeInteger(gasPrice))
      throw new TypeError("Invalid gasPrice");
    if (gasLimit && !isUnsignedSafeInteger(gasLimit))
      throw new TypeError("Invalid gasLimit");
    if (chainId && !isUnsignedSafeInteger(chainId))
      throw new TypeError("Invalid chainId");
    if (contractAddress && !validateEthereumAddress(contractAddress)) {
      throw new TypeError(`Invalid contract address: ${contractAddress}.`);
    }
    const [contractChainId] = (contractAddress ? getEthereumContractInfo(contractAddress) : null) || [];
    if (chainId !== void 0 && contractChainId !== void 0 && chainId !== contractChainId) {
      throw new Error("chainId does not match chain id associated to contractAddress");
    }
    const blockchainName = (chainId ? getEthereumBlockchainName(chainId) : null) || (contractChainId ? getEthereumBlockchainName(contractChainId) : null) || getEthereumBlockchainName(currency) || "ethereum" /* ETHEREUM */;
    const protocol = `${blockchainName}:`;
    let targetAddress;
    if (contractAddress) {
      targetAddress = contractAddress;
    } else if (isNativeEthereumCurrency(currency)) {
      targetAddress = recipient;
    } else {
      throw new Error(`No contractAddress or chainId provided for ${currency} transaction`);
    }
    const isContract = !!contractAddress;
    const chainIdString = chainId !== void 0 && chainId !== 1 /* ETHEREUM_MAINNET */ ? `@${chainId}` : "";
    const functionString = isContract ? "/transfer" : "";
    const query = new URLSearchParams();
    if (isContract) {
      query.set("address", recipient);
    }
    if (amount) {
      const decimals = DECIMALS[currency];
      const formattableNumber = new FormattableNumber(amount);
      formattableNumber.moveDecimalSeparator(-decimals);
      const amountParam = isContract ? "uint256" : "value";
      query.set(amountParam, `${formattableNumber.toString()}e${decimals}`);
    }
    if (gasPrice) {
      const formattableNumber = new FormattableNumber(gasPrice);
      formattableNumber.moveDecimalSeparator(-9);
      query.set("gasPrice", `${formattableNumber.toString()}e9`);
    }
    if (gasLimit) {
      query.set("gasLimit", toNonScientificNumberString(gasLimit));
    }
    const params = query.toString() ? `?${query.toString()}` : "";
    return `${protocol}${targetAddress}${chainIdString}${functionString}${params}`;
  }
  function parseEthereumRequestLink(requestLink, isValidAddress = validateEthereumAddress, normalizeAddress = (address) => address) {
    const url = toUrl(requestLink);
    if (!url || !new RegExp(`^(${Object.values(EthereumBlockchainName).join("|")}):$`, "i").test(url.protocol))
      return null;
    const [, targetAddress, rawChainId, rawFunctionName] = url.pathname.match(ETHEREUM_PATH_REGEX) || [];
    if (!targetAddress || !isValidAddress(normalizeAddress(targetAddress)))
      return null;
    const contractInfo = getEthereumContractInfo(targetAddress);
    const [contractChainId, contractCurrency] = contractInfo || [];
    const isContract = !!contractInfo;
    const contractAddress = isContract ? normalizeAddress(targetAddress) : void 0;
    const chainId = rawChainId ? parseInt(rawChainId, 10) : contractChainId || (url.protocol === `${"polygon" /* POLYGON */}:` ? 137 /* POLYGON_MAINNET */ : void 0);
    if (typeof chainId === "number" && (!isUnsignedSafeInteger(chainId) || !Object.values(EthereumChain).includes(chainId) || typeof contractChainId === "number" && chainId !== contractChainId))
      return null;
    const currency = contractCurrency || (chainId ? getEthereumCurrency(chainId) : void 0) || getEthereumCurrency(url.protocol.match(/[^:]+/)[0].toLowerCase());
    const functionName = rawFunctionName ? decodeURIComponent(rawFunctionName) : void 0;
    if (!!functionName !== isContract || functionName && functionName !== "transfer") {
      return null;
    }
    const contractRecipient = url.searchParams.get("address") ? normalizeAddress(url.searchParams.get("address")) : void 0;
    const rawAmount = url.searchParams.get(isContract ? "uint256" : "value");
    const rawGasPrice = url.searchParams.get("gasPrice");
    const rawGasLimit = url.searchParams.get("gasLimit");
    if (!!contractRecipient !== isContract || contractRecipient && !isValidAddress(contractRecipient))
      return null;
    const recipient = contractRecipient || normalizeAddress(targetAddress);
    let amount;
    let gasPrice;
    let gasLimit;
    try {
      amount = rawAmount ? parseUnsignedInteger(rawAmount) : void 0;
      gasPrice = rawGasPrice ? parseUnsignedInteger(rawGasPrice) : void 0;
      const parsedGasLimit = rawGasLimit ? parseUnsignedInteger(rawGasLimit) : void 0;
      if (typeof parsedGasLimit === "bigint")
        return null;
      gasLimit = parsedGasLimit;
    } catch (e) {
      return null;
    }
    return { currency, recipient, amount, gasPrice, gasLimit, chainId, contractAddress };
  }
  function toUrl(link) {
    if (link instanceof URL)
      return link;
    if (!link.includes(":")) {
      link = `https:${link}`;
    }
    try {
      return new URL(link);
    } catch (e) {
      return null;
    }
  }
  function isUnsignedSafeInteger(value) {
    if (typeof value === "number") {
      return Number.isSafeInteger(value) && value >= 0;
    }
    if (typeof value === "bigint") {
      return value >= 0;
    }
    return !value.isNegative();
  }
  function parseUnsignedInteger(value) {
    value = toNonScientificNumberString(value);
    let result = parseFloat(value);
    if (result < 0)
      throw new Error("Value is negative");
    if (!Number.isSafeInteger(result)) {
      result = BigInt(value);
    }
    return result;
  }
  function validateBitcoinAddress(address) {
    return /^[a-z0-9]+$/i.test(address);
  }
  function validateEthereumAddress(address) {
    return /^0x[a-f0-9]{40}$/i.test(address);
  }
  function isNativeEthereumCurrency(currency) {
    return ETHEREUM_SUPPORTED_NATIVE_CURRENCIES.includes(currency);
  }
  function getEthereumBlockchainName(chainIdOrNativeCurrency) {
    switch (chainIdOrNativeCurrency) {
      case 1 /* ETHEREUM_MAINNET */:
      case 11155111 /* ETHEREUM_SEPOLIA_TESTNET */:
      case "eth" /* ETH */:
        return "ethereum" /* ETHEREUM */;
      case 137 /* POLYGON_MAINNET */:
      case 80002 /* POLYGON_AMOY_TESTNET */:
      case "matic" /* MATIC */:
        return "polygon" /* POLYGON */;
      default:
        return null;
    }
  }
  function getEthereumCurrency(chainIdOrBlockchainName) {
    switch (chainIdOrBlockchainName) {
      case 1 /* ETHEREUM_MAINNET */:
      case 11155111 /* ETHEREUM_SEPOLIA_TESTNET */:
      case "ethereum" /* ETHEREUM */:
        return "eth" /* ETH */;
      case 137 /* POLYGON_MAINNET */:
      case 80002 /* POLYGON_AMOY_TESTNET */:
      case "polygon" /* POLYGON */:
        return "matic" /* MATIC */;
      default:
        return null;
    }
  }
  function getEthereumContractAddress(chainId, currency) {
    if (isNativeEthereumCurrency(currency))
      return null;
    const contracts = ETHEREUM_SUPPORTED_CONTRACTS[chainId];
    if (!contracts) {
      throw new Error(`Unsupported chainId: ${chainId}. You need to specify the 'contractAddress' option.`);
    }
    const contractAddress = contracts[currency];
    if (!contractAddress) {
      throw new Error(`Unsupported contract: ${currency} on chain ${chainId}. You need to specify the 'contractAddress' option.`);
    }
    return contractAddress;
  }
  function getEthereumContractInfo(contractAddress) {
    return ETHEREUM_SUPPORTED_CONTRACTS_REVERSE_LOOKUP[contractAddress.toLowerCase()] || null;
  }

  // src/clipboard/Clipboard.ts
  var Clipboard = class {
    static copy(text) {
      if (typeof globalThis.document === "undefined")
        return false;
      const element = document.createElement("textarea");
      element.value = text;
      element.setAttribute("readonly", "");
      element.style.contain = "strict";
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.fontSize = "12pt";
      const selection = document.getSelection();
      const originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.append(element);
      element.select();
      element.selectionStart = 0;
      element.selectionEnd = text.length;
      let isSuccess = false;
      try {
        isSuccess = document.execCommand("copy");
      } catch (e) {
      }
      element.remove();
      if (activeElement) {
        activeElement.focus();
      }
      if (originalRange && !(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
        selection.removeAllRanges();
        selection.addRange(originalRange);
      }
      return isSuccess;
    }
  };
  return __toCommonJS(kit_entry_exports);
})();
