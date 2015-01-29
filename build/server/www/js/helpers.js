// Polyfill console in primitive environments
if (typeof console === 'undefined')
    console = {};
console.log = console.log || function () { };

// Escape HTML special characters
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Toggle element visibility by class and boolish condition
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

// Lerp between two 2D vectors
function lerp(a, b, t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return {
        "x": a.x * (1 - t) + b.x * t,
        "y": a.y * (1 - t) + b.y * t
    };
}

// Convert from world to map coordinates (requires worldsize to be known)
function worldToMap(position) {
    return {
        "x": ((position.x + server.worldsize / 2) / server.worldsize * 1000) | 0,
        "y": (1000 - ((position.z + server.worldsize / 2) / server.worldsize * 1000)) | 0
    };
}

// Convert a damage type to a textual reason
function damageToReason(dmg) {
    switch (dmg) {
        case "Hunger":
            return "{NAME} died of malnutrition";
        case "Thirst":
            return "{NAME} died of dehydration";
        case "Cold":
            return "{NAME} died of hypothermia";
        case "Drowned":
            return "{NAME} died of asphyxiation";
        case "Heat":
            return "{NAME} died of hyperthermia";
        case "Bleeding":
            return "{NAME} died of hemorrhage";
        case "Poison":
            return "{NAME} died of intoxication";
        case "Suicide":
            return "{NAME} committed suicide";
        case "Generic":
            return "{NAME} died of generalization";
        case "Bullet":
            return "{NAME} died of perforation";
        case "Slash":
            return "{NAME} died of dissection";
        case "BluntTrauma":
            return "{NAME} died of contusion";
        case "Fall":
            return "{NAME} died of precipitation";
        case "Radiation":
            return "{NAME} died of radiation";
        case "Bite":
            return "{NAME} died of amputation";
    }
    return "{NAME} died of something";
}

// Pop up a notification
function notify(html) {
    $.notify(html, { position: "bottom left", autoHideDelay: 10000 });
}
