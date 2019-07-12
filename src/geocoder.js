import autocomplete from 'autocompleter';

import EventEmitter from 'events';

const VALID_LANGUAGES = ["aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu"];

/**
 * @typedef {GeoJSONFeatureCollection} GeocodingResult
 * @property {GeocodingResultItem[]} features
 */

/**
 * @typedef {GeoJSONFeature} GeocodingResultItem
 */

/**
 * @fires Geocoder#hover
 * @fires Geocoder#select
 */
export class Geocoder extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.key Access key from https://cloud.maptiler.com/
   * @param {string|HTMLInputElement|null} [options.input]
   * @param {number} [options.autocompleteWaitMs]
   * @param {string|string[]} [options.language]
   * @param {number[]} [options.bounds]
   * @param {number[]} [options.proximity]
   */
  constructor(options) {
    super();
    let options_ = options || {};

    this.key_ = options_.key;
    if (!this.key_) {
      throw Error('No key provided.');
    }

    this.autocompleteWaitMs_ = options_.autocompleteWaitMs || 500;

    this.input_ = null;
    if (options_.input) {
      let input_ = options_.input;
      input_ = typeof(input_) == 'string' ? document.getElementById(input_) : input_;

      if (input_) {
        this.setInput_(input_);
      }
    }

    this.language_ = null;
    this.bounds_ = null;
    this.proximity_ = null;
    this.setLanguage(options_.language || null);
    this.setBounds(options_.bounds || null);
    this.setProximity(options_.proximity || null);
  }

  /**
   * @private
   * @param {HTMLInputElement} input
   */
  setInput_(input) {
    this.input_ = input;

    this.input_.classList.add('maptiler-geocoder');
    this.input_.maxLength = 60;

    this.autocomplete_ = autocomplete({
      input: this.input_,
      emptyMsg: 'No results',
      minLength: 2,
      debounceWaitMs: this.autocompleteWaitMs_,
      className: 'maptiler-geocoder-results',
      fetch: (text, update) => {
        this.input_.classList.add('working');
        this.geocode(text)
        .then(json => {
          update(json.features);
          this.input_.classList.remove('working');
        })
        .catch(e => {
          console.error('Geocoding error:', e);
          this.input_.classList.remove('working');
        });
      },
      onSelect: (item) => {
        this.input_.value = '';
        this.emit('select', item);
      },
      render: (item, currentValue) => {
        let name = item.text || item.place_name;
        let context = item.context ? item.context.map(c => c.text).join(', ') : '';

        let nameElement = document.createElement('span');
        nameElement.className = 'item-name';
        nameElement.textContent = name;

        let contextElement = document.createElement('span');
        contextElement.className = 'item-context';
        contextElement.textContent = context;

        let typeElement = document.createElement('span');
        typeElement.className = 'item-type';
        typeElement.textContent = item.place_type;

        const itemElement = document.createElement('div');
        itemElement.append(nameElement, contextElement, typeElement);

        itemElement.addEventListener('mouseover', (e) => {
          this.emit('hover', item);
        });
        return itemElement;
      }
    })
  }

  /**
   * @param {string|string[]|null} language
   */
  setLanguage(language) {
    if (language) {
      if (!Array.isArray(language)) {
        language = [language];
      }

      let invalids = language.filter(l => VALID_LANGUAGES.indexOf(l) == -1);

      if (invalids.length) {
        throw Error(`Invalid language codes: ${invalids.join(', ')}`);
      }
    }

    this.language_ = language;
  }

  /**
   * @param {number[]|null} bbox
   */
  setBounds(bbox) {
    if (bbox) {
      if (bbox.length !== 4) {
        throw Error('Invalid bounds');
      }

      bbox = bbox.map(n => parseFloat(n));
      if (
        isNaN(bbox[0]) || isNaN(bbox[1]) ||
        isNaN(bbox[2]) || isNaN(bbox[3]) ||
        bbox[0] < -180 || bbox[0] > 180 ||
        bbox[1] < -90 || bbox[1] > 90 ||
        bbox[2] < -180 || bbox[2] > 180 ||
        bbox[3] < -90 || bbox[3] > 90 ||
        bbox[0] > bbox[2] || bbox[1] > bbox[3]
      ) {
        throw Error('Invalid bounds');
      }
    }

    this.bounds_ = bbox;
  }

  /**
   * @param {number[]|null} point
   */
  setProximity(point) {
    if (point) {
      if (point.length !== 2) {
        throw Error('Invalid proximity syntax');
      }

      point = point.map(n => parseFloat(n));
      if (
        isNaN(point[0]) || isNaN(point[1]) ||
        point[0] < -180 || point[0] > 180 ||
        point[1] < -90 || point[1] > 90
      ) {
        throw Error('Invalid proximity value');
      }
    }

    this.proximity_ = point;
  }

  /**
   * @param {string} query
   * @returns {string}
   */
  getQueryUrl(query) {
    //TODO: sanitize query + validate
    query = encodeURIComponent(query);

    let url = `https://api.maptiler.com/geocoding/${query}.json?key=${this.key_}`;
    if (this.language_) {
      url += '&language=' + this.language_;
    }
    if (this.bounds_) {
      url += '&bbox=' + this.bounds_.join(',');
    }
    if (this.proximity_) {
      url += '&proximity=' + this.proximity_.join(',');
    }

    return url;
  }

  /**
   * @param {string} query
   * @returns {Promise.<GeocodingResult>}
   */
  geocode(query) {
    return fetch(this.getQueryUrl(query))
    .then(response => response.json())
  }
}
