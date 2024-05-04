import $ from "jquery";
import "./options.css";

"use strict";
$(function() {
    chrome.storage.local.get(["settings"], (value) => {
        if (value.settings) {
            $("#settings").val(JSON.stringify(value.settings, null, "  "));
        }
    });
    $("#save").on("click", (event) => {
        try {
            let strSettings = $("#settings").val();
            let settings = strSettings.trim() !== "" ? JSON.parse(strSettings) : [];
            if (!Array.isArray(settings)) {
                throw new SyntaxError("'settings' is not array.");
            }
            if (settings.length === 0) {
                chrome.storage.local.remove(["settings"]);
                return true;
            }
            settings.forEach((setting, idx) => {
                if (typeof setting.url !== "string") {
                    throw new TypeError(`urlが正しくありません index: ${idx}, setting: ${JSON.stringify(setting)}`);
                }
                if (typeof setting.selector !== "string" && typeof setting.selector !== "undefined") {
                    throw new TypeError(`selectorが正しくありません index: ${idx}, setting: ${JSON.stringify(setting)}`);
                }
            });
            chrome.storage.local.set({ "settings": settings });
        } catch (e) {
            $("#message").text("[!]入力した書式が正しくありません");
            console.error(e.message);
        }
    });
});
