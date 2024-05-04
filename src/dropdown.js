import $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete.js";
import "jquery-ui/ui/widgets/button.js";
import "jquery-ui/ui/widgets/menu.js";
import "jquery-ui/ui/widgets/tooltip.js";
import "jquery-ui/themes/base/autocomplete.css";
import "jquery-ui/themes/base/button.css";
import "jquery-ui/themes/base/core.css";
import "jquery-ui/themes/base/menu.css";
import "jquery-ui/themes/base/theme.css";
import "jquery-ui/themes/base/tooltip.css";
import "./dropdown.css"

"use strict";
$.widget("custom.combobox", {
    _create: function() {
        this.wrapper = $("<span>")
            .addClass("fj-combobox")
            .insertAfter(this.element);

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
    },

    _createAutocomplete: function() {
        let selected = this.element.children(":selected");
        let value = selected.val() ? selected.text() : "";
        let $select = this.element;

        this.input = $("<input>")
            .appendTo(this.wrapper)
            .val(value)
            .attr("title", "")
            .addClass("fj-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
            .autocomplete({
                delay: 0,
                minLength: 0,
                source: this._source.bind(this),
                change: function(event, ui) {
                    $select.change();
                }
            })
            .tooltip({
                classes: {
                    "ui-tooltip": "ui-state-highlight"
                }
            });

        this._on(this.input, {
            autocompleteselect: function(event, ui) {
                ui.item.option.selected = true;
                this._trigger("select", event, {
                    item: ui.item.option
                });
            },

            autocompletechange: "_removeIfInvalid"
        });
    },

    _createShowAllButton: function() {
        let input = this.input
        let wasOpen = false;

        $("<a>").attr("tabIndex", -1)
            .appendTo(this.wrapper)
            .button({
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            })
            .removeClass("ui-corner-all")
            .addClass("fj-combobox-toggle ui-corner-right")
            .on("mousedown", function() {
                wasOpen = input.autocomplete("widget").is(":visible");
            })
            .on("click", function() {
                input.trigger("focus");

                // Close if already visible
                if (wasOpen) {
                    return;
                }

                // Pass empty string as value to search for, displaying all results
                input.autocomplete("search", "");
            });
    },

    _source: function(request, response) {
        let matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term),"i");
        response(this.element.children("option").map(function() {
            var text = $(this).text();
            if (this.value && (!request.term || matcher.test(text)))
                return {
                    label: text,
                    value: text,
                    option: this
                };
        }));
    },

    _removeIfInvalid: function(event, ui) {

        // Selected an item, nothing to do
        if (ui.item) {
            return;
        }

        // Search for a match (case-insensitive)
        let value = this.input.val();
        let valueLowerCase = value.toLowerCase();
        let valid = false;
        this.element.children("option").each(function() {
            if ($(this).text().toLowerCase() === valueLowerCase) {
                this.selected = valid = true;
                return false;
            }
        });

        // Found a match, nothing to do
        if (valid) {
            return;
        }

        // Remove invalid value
        this.input.val("")
            .attr("title", `無効な値です：${value}`)
            .tooltip("open");
        this.element.val("");
        this._delay(function() {
            this.input.tooltip("close").attr("title", "");
        }, 2500);
        this.input.autocomplete("instance").term = "";
    },

    _destroy: function() {
        this.wrapper.remove();
        this.element.show();
    }
});

let combobox = function() {
    if (this.multiple) {
        return true;
    }
    $(this).combobox();
};

$(function() {
    chrome.storage.local.get(["settings"], function(items) {
        let settings = items.settings;
        if (!settings || settings.length === 0) {
            settings = [
                {
                    url: ".*"
                }
            ];
        }
        settings.forEach((setting) => {
            if (!location.href.match(new RegExp(setting.url))) {
                return true;
            }
            let selector = setting.selector;
            if (!selector || selector === "") {
                selector = "select";
            }
            $(selector).each(combobox);
        });
    });
});
