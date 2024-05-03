(function(window) {
    "use strict";
    window.addEventListener("load", (event) => {
        chrome.storage.local.get(["settings"], (value) => {
            if (value.settings) {
                document.getElementById("settings").value = JSON.stringify(value.settings, null, "  ");
            }
        });
        document.getElementById("save").addEventListener("click", (event) => {
            try {
                let settings = JSON.parse(document.getElementById("settings").value);
                settings.forEach((setting, idx) => {
                    if (typeof setting.url !== "string") {
                        throw new Error(`urlが正しくありません index: ${idx}, setting: ${JSON.stringify(setting)}`);
                    }
                    if (typeof setting.selector !== "string" && typeof setting.selector !== "undefined") {
                        throw new Error(`selectorが正しくありません index: ${idx}, setting: ${JSON.stringify(setting)}`);
                    }
                });
                chrome.storage.local.set({ "settings": settings });
            } catch (e) {
                console.error(e);
            }
        });
    });
})(window);
[{"url":"https?://localhost(:\\d+)/.*","selector":" ",handler:"function(element){return true;}"}]