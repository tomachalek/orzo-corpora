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
 * A library to parse EUROPARL corpus TXT files
 */

(function (module, exports) {
    'use strict';

    var sgml = require('sgml'),
        text = require('text');

    var lib = {};

    /**
     * Parses a line of EUROPARL corpus
     *
     * @param {string} s
     * @returns {{word: *, lemma: *, tag: *}}
     */
    lib.parseLine = function (s) {
        var ans;

        if (/\s*</.exec(s)) {
            ans = sgml.parse(s);

        } else {
            ans = text.parseText(s);
        }
        return ans;
    };

    /**
     * Tests whether the passed argument is of Structure type
     *
     * @param {*} obj
     * @returns {boolean}
     */
    lib.isStructure = function (obj) {
        return obj !== null && obj.toString() === '[object Structure]';
    };

    module.exports = lib;

}(this.module, this.exports));