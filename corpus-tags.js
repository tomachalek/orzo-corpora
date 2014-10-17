/*
 * Copyright (C) 2014 Tomas Machalek
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

// Corpus tag counter/extractor
// ----------------------------
// The script extracts all unique PoS tags in corpus vertical and counts their
// occurrence.
//
// To run it, use following command:
// java -jar /path/to/orzo/jar -m lib corpus-tags.js path/to/corpus/vertical

(function () {
    'use strict';

    var vertical = require('vertical'),
        numMapThreads = 4,
        numReduceThreads = 4,
        outFile = './tags.txt',
        includeCounts = true;


    dataChunks(numMapThreads, function (idx) {
        return orzo.fileChunkReader(env.inputArgs[0], idx);
    });

    applyItems(function (dataChunk, map) {
        while (dataChunk.hasNext()) {
            map(dataChunk.next());
        }
    });

    map(function (data) {
        var rec = vertical.parseLine(data);

        if (vertical.isPosition(rec)) {
            emit(rec.tag, 1);
        }
    });

    reduce(numReduceThreads, function (key, values) {
        emit(key, D(values).sum());
    });

    finish(function (results) {
        doWith(orzo.fileWriter(outFile), function (fw) {
            results.each(true, function (key, res) {
                if (includeCounts) {
                    fw.write(orzo.sprintf('%s, %s\n', key, res[0]));

                } else {
                    fw.write(orzo.sprintf('%s\n', key));
                }
            });
        },
        function (err) {
            orzo.print(err);
        });
    });

}());