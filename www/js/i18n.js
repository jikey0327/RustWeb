var i18n = {};

// Available languages
i18n.languages = {
    "en": "English"
};

// Current language
i18n.language = "en";

// Translations
i18n.translations = {};

// Translates a string
i18n.translate = function (s, placeholders) {
    if (i18n.translations.hasOwnProperty(s))
        s = i18n.translations[s];
    if (placeholders)
        $.each(placeholders, function (k, v) {
            s = s.replace("{"+k+"}", v);
        });
    return s;
}

// Loads translations for the specified language
i18n.load = function (lang, cb) {
    $.getJSON("/i18n/" + lang + ".json", function (data) {
        i18n.lang = lang;
        i18n.translations = data.translations || {};
        $(".i18n").each(function (i, elem) {
            elem = $(elem);
            elem.html(_($(elem).html()));
            var ph = elem.prop('placeholder');
            if (ph != "")
                elem.prop('placeholder', _(ph));
        });
        if (cb) cb(null);
    }).fail(function (xhr, err) {
        if (cb) cb(err);
    });
}

var _ = i18n.translate;
