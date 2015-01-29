var i18n = {};

var _ = i18n.translate = function (s, placeholders) {
    if (placeholders)
        $.each(placeholders, function (k, v) {
            s = s.replace("{"+k+"}", v);
        });
    return s;
}
