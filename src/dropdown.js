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
        this._selectStyle();

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
    },

    _selectStyle: function() {
        this.selectStyle = {
            height: Math.ceil(this.element.outerHeight()),
            width: Math.ceil(this.element.outerWidth()),
            margin: {
                top: Math.ceil(parseFloat(this.element.css("margin-top"))),
                right: Math.ceil(parseFloat(this.element.css("margin-right"))),
                bottom: Math.ceil(parseFloat(this.element.css("margin-bottom"))),
                left: Math.ceil(parseFloat(this.element.css("margin-left")))
            },
            padding: {
                top: Math.ceil(parseFloat(this.element.css("padding-top"))),
                right: Math.ceil(parseFloat(this.element.css("padding-right"))),
                bottom: Math.ceil(parseFloat(this.element.css("padding-bottom"))),
                left: Math.ceil(parseFloat(this.element.css("padding-left")))
            },
            font: {
                size: Math.ceil(parseFloat(this.element.css("font-size")))
            }
        };
    },

    _modifyInputStyle: function() {
        let formatFourPx = function(px) {
            return `${px.top}px ${px.right}px ${px.bottom}px ${px.left}px`;
        };
        this.input
            .css("height", `${this.selectStyle.height}px`)
            .css("width", `${this.selectStyle.width}px`)
            .css("margin", formatFourPx(this.selectStyle.margin))
            .css("padding", formatFourPx(this.selectStyle.padding))
            .css("font-size", `${this.selectStyle.font.size}px`);
    },

    _modifyButtonStyle: function() {
        this.button
            .css("height", `${this.selectStyle.height + 1}px`);
    },

    _createAutocomplete: function() {
        let selected = this.element.children(":selected");
        let value = selected.val() ? selected.text() : "";

        this.input = $("<input>")
            .appendTo(this.wrapper)
            .val(value)
            .attr("title", "")
            .addClass("fj-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
            .autocomplete({
                delay: 0,
                minLength: 0,
                source: this._source.bind(this)
            })
            .tooltip({
                classes: {
                    "ui-tooltip": "ui-state-highlight"
                }
            });
        this._modifyInputStyle();

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

        this.button = $("<a>").attr("tabIndex", -1)
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
        this._modifyButtonStyle();
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
            let ignoreClosest = setting.ignoreClosest;
            if (ignoreClosest && $(selector).closest(ignoreClosest).length > 0) {
                return true;
            }
            $(selector).each(combobox);
        });
    });
});
