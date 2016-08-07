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

/// <reference path="./types/orzojs.d.ts" />


var numWorkers = 1;
//var verticalPath = 'd:/work/data/corpora/vertical/jerome/small';
var verticalPath = 'd:/work/data/corpora/vertical/jerome/full';
var sgml = require('sgml');
var stopWords = [',', '.', '?', '!', ':', '/', ';', '-', '_', '"', '\'', '|', '(', ')', '}', '{', '%', '§', '@', '#', '=', '+', '*'];

var outf = 'd:/tmp/words-table.txt'

dataChunks(numWorkers, function (idx) {
    return orzo.directoryReader(verticalPath, idx);
});


function isAccepted(lexeme) {
    var w = lexeme.getWord();
    return stopWords.indexOf(w) === -1;
}


function processLine(lexeme, map) {
    if (lexeme instanceof sgml.Position && isAccepted(lexeme)) {
        map(lexeme.getWord());
    }
}


processChunk(function (chunk, map) {
    var line;
    while (chunk.hasNext()) {
        doWith(
            orzo.fileReader(chunk.next(), 'iso-8859-2'), function (fr) {
                while (fr.hasNext()) {
                    line = sgml.parse(fr.next());
                    if (line) {
                        processLine(line, map);
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
    //orzo.printf('map: %s\n', v.join(', '));
    emit(v, 1);
});

reduce(numWorkers, function (key, values) {
    emit(key, values.length);
});

finish(function (result) {
    var i = 0;
    var ans = orzo.hashMap(1000000);
    result.each(function (key, values) {
        ans.put(key, ~~i);
        i += 1;
    });
    orzo.serialize(ans, outf);
});