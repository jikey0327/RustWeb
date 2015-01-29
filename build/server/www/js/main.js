var config = {};                // config.json contents
var server = {};                // status.json contents
var iconSize = 20;              // landmark icon size
var session = undefined;        // session data
var locationUpdateRate = 5;     // location interpolations per second
var players = {};               // known players by user id
var allies = [];                // allies list
var recent = [];                // recent players list
var locations = {};             // player locations

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
        $('#level').prop("title", _("Worldsize")+" "+data.worldsize + ", "+_("Seed")+" "+data.seed);
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
    $.getJSON("/monuments.json", function (data) {
        $.each(data, function (i, obj) {
            var img,
                title;
            if (/wolf_monument/.test(obj.name)) {
                img = "/img/wolf.png";
                title = _("Wolf Monument");
            } else if (/lighthouse_monument/.test(obj.name)) {
                img = "/img/lighthouse.png";
                title = _("Lighthouse");
            } else if (/dish_monument/.test(obj.name)) {
                img = "/img/dish.png";
                title = _("Satellite Dish");
            } else if (/cave/.test(obj.name)) {
                img = "/img/cave.png";
                title = _("Cave");
            } else if (/radtown/.test(obj.name)) {
                img = "/img/radtown.png";
                title = _("Radtown");
            }
            if (img) {
                elem = $('<img class="monument" src="' + img + '" alt="" title="' + title + '" />');
                var pos = worldToMap(obj.position);
                elem.css({
                    width: iconSize + "px",
                    left: (pos.x - iconSize / 2) + "px",
                    top: (pos.y - iconSize / 2) + "px"
                });
                $landmarks.append(elem);
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
        $landmarks.append(elem = $('<img class="player" alt="" id="player-'+data.id+'" />'));
        elem.prop("src", '/img/' + (userId === data.id ? "self" : isShare(data.id) ? "ally" : "player") + '.png');
        elem.prop("title", userId === data.id ? _("This is you!") : players[data.id] ? players[data.id]['name'] : data.id);
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

// Finds the ally element for the specified user id
function findAlly(id) {
    for (var i = 0; i < allies.length; ++i) {
        if (allies[i].id == id)
            return allies[i];
    }
    return null;
}

// Tests if the given user id is a friend
function isFriend(id) {
    if (!session)
        return false;
    for (var i = 0; i < session.friends.length; ++i) {
        if (session.friends[i].id == id)
            return true;
    }
    return false;
}

// Tests if the given user id is a share
function isShare(id) {
    if (!session)
        return false;
    for (var i = 0; i < session.shares.length; ++i) {
        if (session.shares[i].id == id)
            return true;
    }
    return false;
}

// Adds a friend
function addFriend(id, name) {
    var ally = findAlly(id);
    if (!connect.socket || isFriend(id) || id == session.id)
        return;
    if (!confirm(_('Do you really want to SHARE your location with "{NAME}"?', { "NAME": name })))
        return;
    console.log("requesting add of friend " + id);
    connect.socket.send("friend.add " + JSON.stringify({ "id": id }));
}

// Removes a friend
function removeFriend(id, name) {
    var ally = findAlly(id);
    if (!connect.socket || !isFriend(id))
        return;
    if (!confirm(_('Do you really want to NO LONGER SHARE your location with "{NAME}"?', { "NAME": name })))
        return;
    console.log("requesting delete of friend " + id);
    connect.socket.send("friend.del " + JSON.stringify({"id": id }));
}

// Updates the allies list
function updateAllies() {
    if (!session)
        return;
    var done = [];
    for (var i = 0; i < allies.length;) {
        if (!isFriend(allies[i].id) && !isShare(allies[i].id)) {
            console.log("clearing ally: " + allies[i].id);
            $('#ally-' + allies[i].id).remove();
            allies.splice(i, 1);
        } else ++i;
    }
    var all = session.friends.slice();
    Array.prototype.push.apply(all, session.shares);
    $.each(all, function (i, data) {
        if (done.indexOf(data.id) >= 0)
            return;
        var ally = findAlly(data.id);
        if (ally == null) {
            console.log("creating ally: " + data.id);
            ally = {};
            ally.id = data.id;
            ally.name = data.name;
            allies.push(ally);
            ally.elem = $('<a id="ally-' + ally.id + '" class="player" />');
            ally.elem.text(ally.name);
            ally.elem.click(function () {
                if (isFriend(ally.id))
                    removeFriend(ally.id, ally.name);
                else
                    addFriend(ally.id, ally.name);
                return false;
            });
            var beforeElem = null;
            for (var i in allies) {
                if (!allies.hasOwnProperty(i))
                    continue;
                if (allies[i].name.toLowerCase() > ally.name.toLowerCase()) {
                    beforeElem = allies[i].elem;
                    break;
                }
            }
            if (beforeElem != null)
                ally.elem.insertBefore(beforeElem);
            else
                $allieslist.append(ally.elem);
        }
        (ally.isFriend = isFriend(data.id))
            ? ally.elem.addClass("friend") : ally.elem.removeClass("friend");
        (ally.isShare = isShare(data.id))
            ? ally.elem.addClass("share") : ally.elem.removeClass("share");
        (ally.isMutual = ally.isFriend && ally.isShare)
            ? ally.elem.addClass("mutual") : ally.elem.removeClass("mutual");
        done.push(data.id);
    });
}

// Finds the recent player element for the specified user id
function findRecent(id) {
    for (var i = 0; i < recent.length; ++i) {
        if (recent[i].id == id)
            return recent[i];
    }
    return null;
}

// Adds or updates a recent player
function addRecent(id, name) {
    var player = findRecent(id);
    if (player == null) {
        player = {};
        player.id = id;
        player.name = name;
        recent.push(player);
    }
    if (!player.elem) {
        player.elem = $('<a id="recent-' + player.id + '" class="player "/>');
        player.elem.text(player.name);
        player.elem.click(function () {
            addFriend(player.id, player.name);
            return false;
        });
        $recentlist.append(player.elem);
    }
    return player;
}

// Update recent players list
function updateRecent() {
    console.log("updating recent players ...");
    $.getJSON("/recent.json", function (data) {
        $.each(data, function (i, data) {
            addRecent(data.id, data.name);
        });
        console.log("updated recent players");
    }).fail(function (xhr, err) {
        console.log("recent players update failed: " + err.message);
    });;
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
}, 1000 / locationUpdateRate);

var labelsX = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L","M","N","O","P","Q","R","S","T"],
    labelsY = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12","13","14","15","16","17","18","19","20"];

// Updates the grid canvas
function updateGrid() {
    var canvas = document.getElementById("grid");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    /* ctx.moveTo(999.5, 0.5);
    ctx.lineTo(999.5, 999.5);
    ctx.lineTo(0.5, 999.5); */
    for (var x = 50; x < 1000; x += 50) {
        ctx.moveTo(x-0.5, 0.5);
        ctx.lineTo(x-0.5, 999.5);
        ctx.moveTo(0.5, x-0.5);
        ctx.lineTo(999.5, x-0.5);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    var textSize = 20;
    ctx.font = textSize+'px sans-serif';
    for (var x = 0, i = 0; x < 1000; x += 50, i++) {
        var yLabel = labelsY[i],
            xLabel = labelsX[i],
            fm = ctx.measureText(yLabel);
        ctx.fillText(yLabel, 1000+(50-fm.width)/2, x + textSize + 11.5);
        fm = ctx.measureText(xLabel);
        ctx.fillText(xLabel, x+(50-fm.width)/2, 1000 + textSize + 11);
    }
    ctx.restore();
}

// Connect to the websocket endpoint and handle messages
function connect() {
    if (typeof WebSocket == "undefined") {
        alert(_("Sorry, your browser does not support WebSockets. Please consider upgrade to use RustWeb!"));
        return;
    }
    console.log("connecting to websocket ...");
    var socket = connect.socket = new WebSocket("ws://" + document.location.hostname + ":" + document.location.port + "/ws");
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
        // console.log("recv "+cmd+" -> "+JSON.stringify(data));
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
                notify(_("{YOU} just signed in", { "YOU": "<strong>"+_("You")+"</strong>" }));
                updateAllies();
                updateRecent();
                break;
            case "friend.add":
                console.log("received added friend: " + data.id);
                session.friends.push(data);
                updateAllies();
                notify(_("{YOU} now share your location with {NAME}", { "YOU": "<strong>"+_("You")+"</strong>", "NAME": "<strong>"+escapeHtml(data.name)+"</strong>" }));
                break;
            case "friend.del":
                console.log("received deleted friend: " + data.id);
                for (var i = 0; i < session.friends.length; ++i) {
                    if (session.friends[i].id == data.id) {
                        session.friends.splice(i, 1);
                        updateAllies();
                        notify(_("{YOU} no longer share your location with {NAME}", { "YOU": "<strong>" + _("You") + "</strong>", "NAME": "<strong>" + escapeHtml(data.name) + "</strong>" }));
                        break;
                    }
                }
                break;
            case "share.add":
                console.log("received added share: " + data.id);
                session.shares.push(data);
                updateAllies();
                notify("{NAME} now shares their location with you".replace("{NAME}", "<strong>" + escapeHtml(data.name) + "</strong>"));
                var loc = locations[data.id];
                if (loc)
                    loc.elem.prop("src", "/img/ally.png");
                break;
            case "share.del":
                console.log("received deleted share: " + data.id);
                for (var i = 0; i < session.shares.length; ++i) {
                    if (session.shares[i].id == data.id) {
                        session.shares.splice(i, 1);
                        updateAllies();
                        var loc = locations[data.id];
                        if (loc) {
                            loc.elem.remove();
                            delete locations[data.id];
                        }
                        notify("{NAME} no longer shares their location with you".replace("{NAME}", "<strong>"+escapeHtml(data.name)+"</strong>"));
                        break;
                    }
                }
                break;
            case "l"/*ocation*/:
                updatePlayerLocation(data);
                break;
            case "player.connect":
                console.log("received player connect: " + data.id);
                notify(_("{NAME} woke up", { "NAME": "<strong>" + escapeHtml(data.name) + "</strong>" }));
                var recentPlayer = addRecent(data.id, data.name);
                $recentlist.prepend(recentPlayer.elem.detach());
                break;
            case "player.disconnect":
                console.log("received player disconnect: " + data.id);
                $('#player-' + data.id).remove();
                notify(_("{NAME} felt asleep", { "NAME": "<strong>" + escapeHtml(data.name) + "</strong>" }));
                break;
            case "player.chat":
                console.log("received player spawn: " + data.id);
                notify(_("{NAME} says:", { "NAME": "<strong>" + escapeHtml(data.name) + "</strong>" }) + " " + escapeHtml(data.message));
                break;
            case "player.spawn":
                console.log("received player spawn: " + data.id);
                notify(_("{NAME} spawned in the middle of nowhere", { "NAME": "<strong>" + escapeHtml(data.name) + "</strong>" }));
                break;
            case "player.death":
                console.log("received player death: " + data.id);
                notify(damageToReason(data.lastDamage).replace("{NAME}", "<strong>"+escapeHtml(data.name)+"</strong>"));
                break;
            default:
                console.log("received unknown command: " + cmd);
                break;
        }
    }
    socket.onclose = function (e) {
        console.log("disconnected from websocket (trying to reconnect in 20s)");
        setTimeout(function () {
            connect();
        }, 20000);
        toggleCss("signedin", false);
        delete connect.socket;
        cleanup();
    }
    socket.onerror = function (e) {
        console.log("websocket error: "+e.error);
    }
}

// Cleans up on signoff
function cleanup() {
    $.each(allies, function (i, ally) {
        ally.elem.remove();
    });
    $.each(recent, function (i, player) {
        player.elem.remove();
    });
    $.each(locations, function (id, loc) {
        loc.elem.remove();
    });
    session = null;
    allies = [];
    recent = [];
    locations = {};
}

// Element references to reduce lookups
var $friends = $('#friends');
var $allieslist = $('#allieslist');
var $recentlist = $('#recentlist');
var $buildings = $('#buildings');
var $landmarks = $('#landmarks');
var $grid = $('#grid');

$(document).ready(function () {
    console.log("initializing ...");
    toggleCss("signedin", false);
    updateGrid();

    // Enable toggling of landmarks and buildings
    var landmarksCheckbox = $('#landmarks-checkbox');
    landmarksCheckbox.change(function () {
        $landmarks.css("display", landmarksCheckbox.is(":checked") ? "block" : "none");
    });
    var buildingsCheckbox = $('#buildings-checkbox');
    buildingsCheckbox.change(function () {
        $buildings.css("display", buildingsCheckbox.is(":checked") ? "block" : "none");
    });
    var gridCheckbox = $('#grid-checkbox');
    gridCheckbox.change(function () {
        $grid.css("display", gridCheckbox.is(":checked") ? "block" : "none");
    });

    // Disable propagation of scroll events over allies lists
    $('#friends').bind("mousewheel DOMMouseScroll", function (evt) {
        evt.preventDefault();
        // return false;
    });
    /* $('#allieslist, #recentlist').bind("mousewheel DOMMouseScroll", function (evt) {
        return true;
    }); */

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

            // Connect a WebSocket for live updates
            connect();
        });
    }).fail(function (xhr, err) {
        console.log("loading config failed:", err);
    });
    onResize();
});

function onResize() {
    var height = $(window).height();
    var max = (height - 250) / 2;
    $allieslist.css('max-height', max+'px');
    $recentlist.css('max-height', max+'px');
}
$(window).resize(onResize);
