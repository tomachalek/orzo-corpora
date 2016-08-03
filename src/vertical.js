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

    var sgml = require('sgml');

    /**
     * A type representing a line containing text position (= a single word plus
     * additional information)
     *
     * @param {string} word
     * @param {string} lemma
     * @param {string} tag
     * @constructor
     */
    function Position(word, lemma, tag) {
        this.word = word;
        this.lemma = lemma;
        this.tag = tag;
    }

    Position.prototype.toString = function () {
        return '[object Position]';
    };

    var lib = {};

    /**
     * Parses a line of a vertical file.1
     *
     * @param {string} s
     * @returns {{word: *, lemma: *, tag: *}}
     */
    lib.parseLine = function (s) {
        var ans;

        if (/\s*</.exec(s)) {
            ans = sgml.parse(s);

        } else {
            ans = s.trim().split(/\s+/);
            ans = new Position(ans[0], ans[1], ans[2]);
        }
        return ans;
    };

    /**
     * Tests whether the passed argument is of Position type.
     *
     *
     * @param obj
     * @returns {boolean}
     */
    lib.isPosition = function (obj) {
        return obj !== null && obj.toString() === '[object Position]';
    };

    /**
     * Tests whether the passed argument is of Structure type
     *
     * @param obj
     * @returns {boolean}
     */
    lib.isStructure = function (obj) {
        return obj !== null && obj.toString() === '[object Structure]';
    };

    module.exports = lib;

}(this.module));