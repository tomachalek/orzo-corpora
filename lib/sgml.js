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
    function Tag(name, attributes) {
        this.name = name;
        this._attributes = attributes;

        this.getAttr = function (name) {
            return this._attributes[name];
        }

        this.getAttrNames = function () {
            return Object.keys(this._attributes);
        }
    }

    function EndTag(name) {
        this.name = name;
        this.toString = function () {
            return '</' + this.name + '>';
        }
    }

    function Position(values) {
        this.values = values;

        this.getWord = function () {
            return this.values[0].toLowerCase();
        }

        this.toString = function () {
            return this.values.join(' ');
        }
    }

    function endsWith(s, x) {
        return s.length >= x.length && s.indexOf(x) === s.length - x.length;
    }

    function startsWith(s, x) {
        return s.length >= x.length && s.indexOf(x) === 0;
    }

    function isStartTag(s) {
        return startsWith(s, '<') && !startsWith(s, '</') && !endsWith(s, '/>');
    }

    function isEndTag(s) {
        return startsWith(s, '</') && endsWith(s, '>');
    }

    function isSelfClosingTag(s) {
        return startsWith(s, '<') && endsWith(s, '/>');
    }

    function parseAttrs(items) {
        var ans = {};
        var pattern = /([^=]+)\s*=\s*"([^"]*)"/;

        items.forEach(function (v) {
            var srch = pattern.exec(v);
            if (srch) {
                ans[srch[1]] = srch[2];
            }
        });
        return ans;
    }

    function parseTag(s) {
        var srchTag = /^<([^>]+?)\/?>$/.exec(s);
        var tagName;
        var attrs;
        var items;

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
            return new Tag(tagName, attrs);
        }
        return null;
    }

    function parseEndTag(s) {
        var srch = /^<\/([^>]+)>/.exec(s);
        if (srch) {
            return new EndTag(srch[1]);
        }
        return null;
    }

    var lib = {};
    lib.Tag = Tag;
    lib.Position = Position;
    lib.EndTag = EndTag;

    /**
     * Parses vertical's structure (e.g. <doc id="foo" date="2014-04-01">)
     *
     * @param {string} s
     * @returns {Structure|null}
     */
    lib.parse = function (s) {
        if (s.indexOf('<') !== 0) {
            return new Position(s.split(/\s+/));

        } else if (isStartTag(s)) {
            return parseTag(s);

        } else if (isEndTag(s)) {
            return parseEndTag(s);

        } else if (isSelfClosingTag(s)) {
            return null;

        } else {
            return null;
        }
    }

    module.exports = lib;


}(this.module));