const fs = require("fs");

let saved = []; // <--- THIS IS YOUR [ ] ARRAY

function saveState(state) {
    saved.push(state); // add new state to array
    fs.writeFileSync("save.json", JSON.stringify(saved, null, 2));
}

function clearState() {
    saved = []; // empty array
    if (fs.existsSync("save.json")) {
        fs.unlinkSync("save.json");
    }
}

module.exports = { saveState, clearState };
