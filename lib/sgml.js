/*
 * Copyright (C) 2014 Tomas Machalek <tomas.machalek@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A library to parse corpus vertical files as used by Manatee corpus engine
 * (http://nlp.fi.muni.cz/trac/noske)
 */

(function (module) {
    'use strict';

    /**
     * A type representing a line containing a structure (= sgml element)
     *
     * @param {string} name
     * @param {{}} attributes
     * @constructor
     */
    function Structure(name, attributes) {
        this.name = name;
        this._attributes = attributes;
    }

    Structure.prototype.toString = function () {
        return '[object Structure]';
    };

    /**
     * Read or write an attribute
     *
     * @param {string} name
     * @param {string} [value]
     * @returns {string|undefined}
     */
    Structure.prototype.attr = function (name, value) {
        if (value === undefined) {
            return this._attributes[name];

        } else {
            this._attributes[name] = value;
        }
    };


    /**
     * Parses tag's attributes split into a list of strings
     * (e.g. "key1=value1 key2 =value2 key3= value3")
     *
     * @param {array} items of the form "key\s*=\s*value"
     * @returns {{}} dict of parsed attributes
     */
    function parseAttrs(items) {
        var ans = {},
            pattern = /([^=]+)\s*=\s*"([^"]*)"/;

        items.forEach(function (v) {
            var srch = pattern.exec(v);

            if (srch) {
                ans[srch[1]] = srch[2];
            }
        });
        return ans;
    }

    var lib = {};

    /**
     * Parses vertical's structure (e.g. <doc id="foo" date="2014-04-01">)
     *
     * @param {string} s
     * @returns {Structure|null}
     */
    lib.parse = function (s) {
        var srchTag,
            tagName = null,
            items,
            attrs = {};

        srchTag = /^<([^>]+?)\/?>$/.exec(s);
        if (srchTag) {
            if (srchTag[1].substr(0, 1) === '/') {
                tagName = null;

            } else {
                items = srchTag[1].split(/\s+/);
                tagName = items[0];
                attrs = parseAttrs(items.slice(1));
            }
        }

        if (tagName) {
            return new Structure(tagName, attrs);
        }
        return null;
    }

    module.exports = lib;


}(this.module));