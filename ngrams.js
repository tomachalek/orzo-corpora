/*
 * Copyright (C) 2016 Tomas Machalek <tomas.machalek@gmail.com>
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

/*
 * An orzo.js script to generate 1&2-grams
 */

/// <reference path="./types/orzojs.d.ts" />

var sgml = require('sgml');

// -------------------- CONFIG BEGIN -----------------------------------

var numWorkers = 1;
//var verticalPath = 'd:/work/data/corpora/vertical/jerome/small';
var verticalPath = 'd:/work/data/corpora/vertical/jerome/full';
var limit = 100000000; // just for debugging purposes
var ngramSize = 2;
var corpusEncoding = 'iso-8859-2';
var stopWords = [',', '.', '?', '!', ':', '/', ';', '-', '_', '"', '\'', '|', '(', ')', '}', '{', '%', '§', '@', '#', '=', '+', '*'];
var alpha = [
    'a', 'á', 'b', 'c', 'č', 'd', 'ď', 'e', 'é', 'ě',
    'f', 'g', 'h', 'i', 'í', 'j', 'k', 'l', 'm', 'n',
    'ň', 'o', 'ó', 'p', 'q', 'r', 'ř', 's', 'š', 't',
    'ť', 'u', 'ú', 'ů', 'v', 'w', 'x', 'y', 'ý', 'z',
    'ž'
];

var proc = alpha.slice(7, 12);
var outfN1 = 'd:/tmp/ngram1.txt';
var outfN2 = 'd:/tmp/ngram2.txt';


// --------------------- CONFIG END ------------------------------------


dataChunks(numWorkers, function (idx) {
    return orzo.directoryReader(verticalPath, idx);
});


function isAcceptedWord(lexeme) {
    return lexeme instanceof sgml.Position &&
            stopWords.indexOf(lexeme.getWord()) === -1;
}


function processLine(lexeme, stack, ngram, map) {
    if (lexeme instanceof sgml.Tag) {
        stack.push(lexeme);
        if (lexeme.name === 's') {
            ngram.splice();
        }

    } else if (isAccepted(lexeme)) {
        ngram.push(lexeme.getWord());
        if (ngram.length > ngramSize) {
            ngram.shift();
        }
        if (0 <= ngram[0] <= 50000) {
            map(ngram);
        }

    } else if (lexeme instanceof sgml.EndTag) {
        stack.pop(lexeme);
    }
}


processChunk(function (chunk, map) {
    var stack = [];
    var line;

    while (chunk.hasNext()) {
        doWith(
            orzo.fileReader(chunk.next(), corpusEncoding), function (fr) {
                var ngram = [];
                var i = 0;
                while (fr.hasNext()) {
                    line = sgml.parse(fr.next());
                    if (line) {
                        processLine(line, stack, ngram, map);
                    }
                    i += 1;
                    if (i >= limit) {
                        break;
                    }
                }
            },
            function (err) {
                orzo.printf('ERROR: %s', err);
            }
        );
    }
});


map(function (v) {
    emit(v[0], v[1]);
});

reduce(numWorkers, function (key, values) {
    emit(key, orzo.uniq(values));
});


finish(function (result) {
    doWith(
        [orzo.fileWriter(outfN1), orzo.fileWriter(outfN2)],
        function (fw1, fw2) {
            var offset = 0;
            result.sorted.each(function (key, values) {
                offset += values[0].size();
                fw1.writeln(orzo.sprintf('%s %s', key, ~~offset));
                values[0].forEach(function (item) {
                    fw2.writeln(item);
                });

            });
        },
        function (err) {
            orzo.printf('ERROR generating result: %s\n', err);
        }
    );
});