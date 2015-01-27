// Escape HTML special characters
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Toggle element visibility by class and boolish condition
function toggleCss(name, satisfied) {
    if (satisfied) {
        $('.' + name).show();
        $('.not-' + name).hide();
    } else {
        $('.' + name).hide();
        $('.not-' + name).show();
    }
}

// Lerp between two 2D vectors
function lerp(a, b, t) {
    return {
        "x": a.x * (1 - t) + b.x * t,
        "y": a.y * (1 - t) + b.y * t
    };
}

// Convert from world to map coordinates (requires worldsize to be known)
function worldToMap(position) {
    var x = ((position.x + server.worldsize / 2) / server.worldsize * 1000) | 0,
        y = 1000 - ((position.z + server.worldsize / 2) / server.worldsize * 1000) | 0;
    return {
        "x": x,
        "y": y
    };
}

// Convert a damage type to a textual reason
function damageToReason(dmg) {
    switch (dmg) {
        case "Hunger":
            reason = "died of malnutrition";
            break;
        case "Thirst":
            reason = "died of dehydration";
            break;
        case "Cold":
            reason = "died of hypothermia";
            break;
        case "Drowned":
            reason = "died of asphyxiation";
            break;
        case "Heat":
            reason = "died of hyperthermia";
            break;
        case "Bleeding":
            reason = "died of hemorrhage";
            break;
        case "Poison":
            reason = "died of intoxication";
            break;
        case "Suicide":
            reason = "committed suicide";
            break;
        case "Generic":
            reason = "died of generalization";
            break;
        case "Bullet":
            reason = "died of perforation";
            break;
        case "Slash":
            reason = "died of dissection";
            break;
        case "BluntTrauma":
            reason = "died of contusion";
            break;
        case "Fall":
            reason = "died of precipitation";
            break;
        case "Radiation":
            reason = "died of radiation";
            break;
        case "Bite":
            reason = "died of amputation";
            break;
        default:
            reason = "died of something";
    }
    return reason;
}

// Polyfill console in primitive environments
if (typeof console === 'undefined')
    console = {};
console.log = console.log || function () { };

// Pops up a notification
function notify(html) {
    $.notify(html, { position: "bottom left", autoHideDelay: 10000 });
}
