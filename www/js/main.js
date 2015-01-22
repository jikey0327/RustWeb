var config = {};
var server = {};
var iconSize = 20;
var globalOffset = 0;

function updateStatus(cb) {
    console.log("updating status");
    $.getJSON("/status.json", function (data) {
        server = data;
        $.each(data, function (k, v) {
            if (typeof v !== "string" && typeof v !== "number")
                return;
            $("#" + k).text(v);
        });
        $('#level').prop("title", "Worldsize " + data.worldsize + ", Seed " + data.seed);
        document.title = "RustWeb :: " + server.hostname;
        if (cb) cb();
    }).fail(function (xhr, err) {
        console.log("status update failed: "+err.message);
    });
}

function updateMonuments(cb) {
    console.log("updating monuments");
    var root = $('#monuments');
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
            } else if (/radiation/.test(obj.name)) {
                img = "/img/radiation.png";
                title = "Radiation Zone";
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
        if (cb) cb();
    }).fail(function (xhr, err) {
        console.log("monuments update failed: " + err.message);
    });
}

function updateBuildings(cb) {
    console.log("updating buildings");
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
        if (cb) cb();
    }).fail(function (xhr, err) {
        console.log("buildings update failed: " + err.message);
    });;
}

function worldToMap(position) {
    var x = ((position.x + server.worldsize / 2) / server.worldsize * 1000) | 0,
        y = 1000 - ((position.z + server.worldsize / 2) / server.worldsize * 1000) | 0;
    return {
        "x": globalOffset + x,
        "y": globalOffset + y
    };
}

function connect() {
    if (typeof WebSocket == "undefined") {
        console.log("Sorry, your browser does not support WebSockets. Maybe consider an upgrade.");
        return;
    }
    console.log("connecting...");
    var socket = new WebSocket("ws://" + document.location.hostname + ":" + document.location.port + "/ws");
    socket.onopen = function () {
        console.log("connected");
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
        // console.log("recv", cmd, data);
        if (cmd == "session") {
            $('.signinOpt').hide();
        } else if (cmd == "myloc") {
            var elem = $('#self');
            if (elem.length == 0)
                $('#monuments').append(elem = $('<img class="monument" id="self" src="/img/self.png" alt="" title="This is you!" />'));
            var pos = worldToMap(data);
            console.log("mypos", pos);
            elem.css({
                width: iconSize + "px",
                left: (pos.x - iconSize / 2) + "px",
                top: (pos.y - iconSize / 2) + "px",
                transform: "rotate("+data.r+"deg)"
            });
        }
    }
    socket.onclose = function (e) {
        $('.signinOpt').show();
        console.log("disconnected (trying to reconnect in 20s)");
        setTimeout(function () {
            connect();
        }, 20000);
    }
    socket.onerror = function (e) {
        console.log("error: "+e.error);
    }
}

$(document).ready(function () {

    $('#monuments-checkbox').change(function () {
        $('#monuments').css("display", $('#monuments-checkbox').is(":checked") ? "block" : "none");
    });
    $('#buildings-checkbox').change(function () {
        $('#buildings').css("display", $('#buildings-checkbox').is(":checked") ? "block" : "none");
    });

    console.log("loading config");
    $.getJSON("/config.json", function (data) {
        config = data;
        if (config && config.displayBuildings)
            $(".buildingsOpt").show();

        updateStatus(function () {

            // Actual world positions differ slightly, so let's make a guess...
            globalOffset = server.worldsize / 1000 * 2.5;

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
        console.log("Loading config failed:", err);
    });
});

if (typeof console === 'undefined')
    console = {};
if (!console.log)
    console.log = function () { }
