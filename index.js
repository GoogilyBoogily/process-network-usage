"use strict";

var nethogsProcess, spawn;

spawn = require("child_process").spawn;
nethogsProcess = spawn("nethogs", ["-t"]);

console.log("name/PID/UID       sent    recieve");
console.log("----------------------------------");

nethogsProcess.stdout.setEncoding("utf8");
nethogsProcess.stdout.on("data", (data) => {
    var dataCleaned, lines;

    dataCleaned = data.toString();
    lines = dataCleaned.split(/(\r?\n)/g);

    // /usr/local/crashplan/jre/bin/java/2425/0        144.771 3.0293
    // <name>/<PID>/<UID>     <sentValue>      <recieveValue>

    for (var i = 0; i < lines.length; i++) {
        var parsed;

        // Process the line, noting it might be incomplete.

        if (!shouldIgnore(lines[i])) {
            parsed = parseNethogsOutput(lines[i].trim());
            console.log(lines[i].trim());
            console.log(parsed);
        }
    }
});
nethogsProcess.stderr.on("data", (data) => {
    if (!data.toString().startsWith("Waiting for first packet to arrive")) {
        console.log(`stderr: ${data}`);
    }
});
nethogsProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
});
nethogsProcess.on("error", (err) => {
    console.log("Failed to start child process.");
});


function shouldIgnore(line) {
    if (!line.trim()) {
        return true;
    } else if (line.startsWith("Refreshing:")) {
        return true;
    } else if (line.startsWith("Adding local address:")) {
        return true;
    } else if (line.startsWith("Ethernet link detected")) {
        return true;
    }

    return false;
}


function parseNethogsOutput(data) {
    var parsed, parsedObj, parseRegEx;

    parseRegEx = /([\/\-\s\w\.]+)\/(\d+)\/(\d+)\t([\d\.]+)\t([\d\.]+)/g
    parsed = parseRegEx.exec(data);
    parsedObj = {
        name: parsed[1],
        pid: parsed[2],
        uid: parsed[3],
        sentValue: parsed[4],
        recieveValue: parsed[5],
        timestamp: Math.floor(Date.now() / 1000)
    };

    return parsedObj;
}

