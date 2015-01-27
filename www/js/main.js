var config = {};                // config.json contents
var server = {};                // status.json contents
var iconSize = 20;              // landmark icon size
var session = undefined;        // session data
var locationUpdateRate = 5;     // location interpolations per second
var players = {};               // known players by user id
var locations = {};             // player locations by user id

// Update status content
function updateStatus(cb) {
    console.log("updating status ...");
    $.getJSON("/status.json", function (data) {
        server = data;
        $.each(data, function (k, v) {
            if (typeof v !== "string" && typeof v !== "number")
                return;
            $("#" + k).text(v);
        });
        $('#level').prop("title", "Worldsize " + data.worldsize + ", Seed " + data.seed);
        document.title = "RustWeb :: " + server.hostname;
        if (data.players) {
            players = {};
            $.each(data.players, function (i, p) {
                players[p.id] = p;
                if (!session || p.id != session.id)
                    $('#player-' + p.id).prop("title", p.name);
            });
        }
        console.log("status updated");
        if (cb) cb();
    }).fail(function (xhr, err) {
        console.log("status update failed: "+err.message);
    });
}

// Update monuments content
function updateMonuments(cb) {
    console.log("updating monuments ...");
    var root = $('#landmarks');
    $.getJSON("/monuments.json", function (data) {
        $.each(data, function (i, obj) {
            var img,
                title;
            if (/wolf_monument/.test(obj.name)) {
                img = "/img/wolf.png";
                title = "Wolf Monument";
            } else if (/lighthouse_monument/.test(obj.name)) {
                img = "/img/lighthouse.png";
                title = "Lighthouse";
            } else if (/dish_monument/.test(obj.name)) {
                img = "/img/dish.png";
                title = "Satellite Dish";
            } else if (/cave/.test(obj.name)) {
                img = "/img/cave.png";
                title = "Cave";
            } else if (/radtown/.test(obj.name)) {
                img = "/img/radtown.png";
                title = "Radtown";
            }
            if (img) {
                elem = $('<img class="monument" src="' + img + '" alt="" title="' + title + '" />');
                var pos = worldToMap(obj.position);
                elem.css({
                    width: iconSize + "px",
                    left: (pos.x - iconSize / 2) + "px",
                    top: (pos.y - iconSize / 2) + "px"
                });
                root.append(elem);
            }
        });
        console.log("monuments updated");
        if (cb) cb();
    }).fail(function (xhr, err) {
        console.log("monuments update failed: " + err.message);
    });
}

// Update buildings overlay
function updateBuildings(cb) {
    console.log("updating buildings ...");
    $.getJSON("/buildings.json", function (data) {
        var canvas = document.getElementById("buildings"),
        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var size = server.worldsize / 1000 * 0.4;
        $.each(data, function (i, obj) {
            if (obj.name != "foundation")
                return;
            var pos = worldToMap(obj.position);
            ctx.save();
            ctx.moveTo(pos.x, pos.y);
            ctx.translate(pos.x, pos.y);
            ctx.rotate(obj.rotation / 180 * Math.PI);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(-size / 2 - 0.5, -size / 2 - 0.5, size + 1, size + 1);
            ctx.restore();
        });
        $.each(data, function (i, obj) {
            if (obj.name != "foundation")
                return;
            var pos = worldToMap(obj.position);
            ctx.save();
            ctx.moveTo(pos.x, pos.y);
            ctx.translate(pos.x, pos.y);
            ctx.rotate(obj.rotation / 180 * Math.PI);
            ctx.fillStyle = "#ae8753";
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.restore();
        });
        console.log("buildings updated");
        if (cb) cb();
    }).fail(function (xhr, err) {
        console.log("buildings update failed: " + err.message);
    });;
}

// Update a single player's location data
function updatePlayerLocation(data) {
    var loc, pos = worldToMap(data), rot = data.r;
    if (!locations.hasOwnProperty(data.id)) {
        console.log("creating player " + data.id);
        $('#landmarks').append(elem = $('<img class="monument" alt="" id="player-'+data.id+'" />'));
        elem.prop("src", '/img/' + (userId === data.id ? "self" : "player") + '.png');
        elem.prop("title", userId === data.id ? "This is you!" : players[data.id] ? players[data.id]['name'] : data.id);
        elem.css({
            width: iconSize + "px",
            left: (pos.x - iconSize / 2) + "px",
            top: (pos.y - iconSize / 2) + "px",
            transform: "rotate(" + rot + "deg)"
        });
        loc = locations[data.id] = {};
        loc.pos = [pos, pos];
        loc.rot = [rot, rot];
        loc.elem = elem;
    } else {
        loc = locations[data.id];
        loc.pos = [loc.pos[1], pos];
        loc.rot = [loc.rot[1], rot];
    }
    loc.time = Date.now();
}

// Interpolate player locations `locationUpdateRate` times a second
setInterval(function () {
    var now = Date.now();
    $.each(locations, function (id, loc) {
        var t = (now - loc.time) / 1000;
        if (t > 1) t = 1;
        var pos = lerp(loc.pos[0], loc.pos[1], t);
        loc.elem.css({
            left: (pos.x - iconSize / 2) + "px",
            top: (pos.y - iconSize / 2) + "px",
            transform: "rotate(" + loc.rot[1] + "deg)"
        });
    });
}, 1000/locationUpdateRate);

// Connect to the websocket endpoint and handle messages
function connect() {
    if (typeof WebSocket == "undefined") {
        console.log("Sorry, your browser does not support WebSockets. Maybe consider an upgrade.");
        return;
    }
    console.log("connecting to websocket ...");
    var socket = new WebSocket("ws://" + document.location.hostname + ":" + document.location.port + "/ws");
    socket.onopen = function () {
        console.log("connected to websocket");
    }
    socket.onmessage = function (e) {
        var msg = e.data,
            cmd,
            data;
        var p = msg.indexOf(" ");
        if (p < 0) {
            cmd = msg;
            data = null;
        } else {
            cmd = msg.substring(0, p);
            data = JSON.parse(msg.substring(p + 1));
        }
        switch (cmd) {
            case "hello":
                console.log("greeted by server");
                socket.send("hello");
                break;
            case "session":
                console.log("received session info: "+data._id);
                session = data;
                userId = data.id;
                toggleCss("signedin", true);
                notify("<strong>You</strong> just signed in");
                break;
            case "friend.add":
                console.log("received added friend: " + data.id);
                session.friends.push(data.id);
                break;
            case "friend.del":
                console.log("received deleted friend: " + data.id);
                var p = session.friends.indexOf(data.id);
                if (p >= 0)
                    session.friends.splice(p, 1);
                break;
            case "share.add":
                console.log("received added share: " + data.id);
                session.shares.push(data.id);
                break;
            case "share.del":
                console.log("received deleted share: " + data.id);
                var p = session.shares.indexOf(data.id);
                if (p >= 0)
                    session.shares.splice(p, 1);
                break;
            case "l"/*ocation*/:
                updatePlayerLocation(data);
                break;
            case "player.connect":
                console.log("received player connect: " + data.id);
                notify("<strong>"+escapeHtml(data.name) + "</strong> woke up");
                break;
            case "player.disconnect":
                console.log("received player disconnect: " + data.id);
                $('#player-' + data.id).remove();
                notify("<strong>" + escapeHtml(data.name) + "</strong> felt asleep");
                break;
            case "player.chat":
                console.log("received player spawn: " + data.id);
                notify("<strong>" + escapeHtml(data.name) + "</strong> : <span style=\"color:#fff\">" + escapeHtml(data.message)+"</span>");
                break;
            case "player.spawn":
                console.log("received player spawn: " + data.id);
                notify("<strong>" + escapeHtml(data.name) + "</strong> spawned in the middle of nowhere");
                break;
            case "player.death":
                console.log("received player death: " + data.id);
                notify("<strong>" + escapeHtml(data.name) + "</strong> " + damageToReason(data.lastDamage));
                break;
            default:
                console.log("received unknown command: " + cmd);
                break;
        }
    }
    socket.onclose = function (e) {
        toggleCss("signedin", false);
        console.log("disconnected from websocket (trying to reconnect in 20s)");
        setTimeout(function () {
            connect();
        }, 20000);
    }
    socket.onerror = function (e) {
        console.log("websocket error: "+e.error);
    }
}

$(document).ready(function () {
    console.log("initializing ...");
    toggleCss("signedin", false);

    // Enable toggling of landmarks and buildings
    $('#landmarks-checkbox').change(function () {
        $('#landmarks').css("display", $('#landmarks-checkbox').is(":checked") ? "block" : "none");
    });
    $('#buildings-checkbox').change(function () {
        $('#buildings').css("display", $('#buildings-checkbox').is(":checked") ? "block" : "none");
    });

    console.log("loading config ...");
    $.getJSON("/config.json", function (data) {
        config = data;
        toggleCss("displayMonuments", !!config.displayMonuments);
        toggleCss("displayBuildings", !!config.displayBuildings);
        console.log("config loaded");
        updateStatus(function () {

            // Refresh status every minute
            setInterval(updateStatus, 60000);

            // Update monuments once
            if (config && config.displayMonuments)
                updateMonuments();

            // Update buildings once, then every 5 minutes
            if (config && config.displayBuildings)
                updateBuildings(),
                setInterval(updateBuildings, 60000 * 5);

            // Connect a WebSocket for live updates after Steam signin
            connect();
        });
    }).fail(function (xhr, err) {
        console.log("loading config failed:", err);
    });
});
