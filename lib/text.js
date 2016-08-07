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
 * General text processing related functionality
 */

(function (module) {
    'use strict';

    var lib = {};

    module.exports = lib;

    /**
     *
     * @param {string} text
     * @param {bool} [caseSensitive] if false then all letters are converted into lowercase
     * @constructor
     */
    function Sentence(text, caseSensitive) {
        var self = this,
            words = text.trim().split(/[\s\.,:;!\?'\-\(\)\|]+/);

        if (caseSensitive) {
            this._words = words;

        } else {
            self._words = words.map(function (w) { return w.toLowerCase(); });
        }
    }

    /**
     *
     * @returns {Array<string>}
     */
    Sentence.prototype.words = function () {
        return this._words;
    };

    /**
     *
     * @returns {string}
     */
    Sentence.prototype.toString = function () {
        return '[object Sentence]';
    };

    /**
     *
     * @returns {string}
     */
    Sentence.prototype.asText = function () {
        return this._words.join(' ');
    };

    /**
     * Finds a word matching passed pattern. If a string is
     * passed then only exact match (i.e. no substring) is
     * accepted.
     *
     * @param {RegExp|string} pattern
     * @returns {Array<string>}
     */
    Sentence.prototype.find = function (pattern) {
        var ans = [];

        if (typeof pattern === 'string') {
            pattern = new RegExp('^' + pattern + '$');
        }

        this._words.forEach(function (w, i) {
            if (pattern.exec(w)) {
                ans.push([w, i]);
            }
        });
        return ans;
    };

    /**
     * Returns selected context of a word
     *
     * @param {number} pos where to start (KWIC)
     * @param {number} rangeLeft
     * @param {number} [rangeRight] if omitted then rangeLeft value is used
     * @returns {Array<string>}
     */
    Sentence.prototype.context = function (pos, rangeLeft, rangeRight) {
        var ans = [],
            i;

        if (rangeRight === undefined) {
            rangeRight = rangeLeft;
        }

        for (i = Math.max(0, pos - rangeLeft); i < Math.min(this._words.length, pos + rangeRight + 1); i += 1) {
            ans.push(this._words[i]);
        }
        return ans;
    };

    /**
     * Tests whether the passed argument is of Sentence type.
     *
     * @param {*} obj
     * @returns {boolean}
     */
    lib.isSentence = function (obj) {
        return obj !== null && obj.toString() === '[object Sentence]';
    };

    lib.Sentence = Sentence;

    /**
     * Parses bunch of sentences (~ paragraph) into a list of Sentence
     * instances.
     *
     * @param {string} p
     * @returns {Array<Sentence>}
     */
    lib.parseText = function (p) {
        var sentences = [];

        p = p.replace(/["']/g, ' ');
        p.trim().split(/[\.\!\?]\s*(?=[A-ZÁČĎÉĚÍŇÓŠŤÚŽ])/).forEach(function (s) {
            var sent = s.trim();

            if (sent) {
                sentences.push(new Sentence(s));
            }
        });
        return sentences;
    };

}(this.module));