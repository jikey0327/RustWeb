// Polyfill console in primitive environments
if (typeof console === 'undefined')
    console = {};
console.log = console.log || function () { };

// Escapes HTML special characters
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Toggles element visibility by class and boolish condition
function toggleCss(name, satisfied) {
    if (satisfied) {
        $('.' + name).show();
        $('.not-' + name).hide();
        $(document.body).addClass("is-" + name);
        $(document.body).removeClass("is-not-" + name);
    } else {
        $('.not-' + name).show();
        $('.' + name).hide();
        $(document.body).addClass("is-not-" + name);
        $(document.body).removeClass("is-" + name);
    }
}

// Lerps between two 2D vectors
function lerp(a, b, t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return {
        "x": a.x * (1 - t) + b.x * t,
        "y": a.y * (1 - t) + b.y * t
    };
}

// Converts from world to map coordinates (requires worldsize to be known)
function worldToMap(position) {
    return {
        "x": ((position.x + server.worldsize / 2) / server.worldsize * 1000),
        "y": (1000 - ((position.z + server.worldsize / 2) / server.worldsize * 1000))
    };
}

// Converts from map to world coodirnates (requires worldsize to be known)
function mapToWorld(position) {
    return {
        "x": (position.x - 500) * (server.worldsize / 1000),
        "z": -(position.y - 500) * (server.worldsize / 1000)
    };
};

// Converts a damage type to a textual reason
function damageToReason(dmg) {
    switch (dmg) {
        case "Hunger":
            return "{NAME} starved to death";
        case "Thirst":
            return "{NAME} died of dehydration";
        case "Cold":
            return "{NAME} froze to death";
        case "Drowned":
            return "{NAME} drowned";
        case "Heat":
            return "{NAME} burned to death";
        case "Bleeding":
            return "{NAME} bled to death";
        case "Poison":
            return "{NAME} died of intoxication";
        case "Suicide":
            return "{NAME} committed suicide";
        case "Bullet":
            return "{NAME} was shot";
        case "Slash":
            return "{NAME} was slashed";
        case "BluntTrauma":
            return "{NAME} died of a blunt trauma";
        case "Fall":
            return "{NAME} fell to death";
        case "Radiation":
            return "{NAME} died of radiation";
        case "Bite":
            return "{NAME} was bitten to death";
    }
    return "{NAME} died";
}

// Pops up a notification
function notify(html) {
    $.notify(html, { position: "bottom left", autoHideDelay: 10000 });
}
