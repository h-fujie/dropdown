(function(window) {
    "use strict";
    let Utils = {
        next: function(element, newElement) {
            element.parentNode.insertBefore(newElement, element.nextElementSibling);
        },
        style: function(element, pseudoElt) {
            return window.getComputedStyle(element, pseudoElt);
        },
        element: function(html) {
            let el = document.createElement("span");
            el.innerHTML = html;
            return el.firstElementChild;
        },
        formatFourPx: function(px) {
            return `${px.top}px ${px.right}px ${px.bottom}px ${px.left}px`;
        },
        indexOf: function(elements, element) {
            return Array.from(elements).indexOf(element);
        }
    };
    let Dropdown = function(select) {
        this.select = select;
        this.items = Array.from(select.children, option => {
            return {
                value: option.value,
                label: option.innerText
            };
        });
        let style = Utils.style(select);
        this.selectStyle = {
            height: select.clientHeight,
            width: select.clientWidth,
            margin: {
                top: Number(style.marginTop.replace(/px$/, "")),
                right: Number(style.marginRight.replace(/px$/, "")),
                bottom: Number(style.marginBottom.replace(/px$/, "")),
                left: Number(style.marginLeft.replace(/px$/, "")),
            },
            padding: {
                top: Number(style.paddingTop.replace(/px$/, "")),
                right: Number(style.paddingRight.replace(/px$/, "")),
                bottom: Number(style.paddingBottom.replace(/px$/, "")),
                left: Number(style.paddingLeft.replace(/px$/, "")),
            },
            border: {
                width: Number(style.borderWidth.replace(/px$/, ""))
            },
            font: {
                size: Number(style.fontSize.replace(/px$/, ""))
            }
        };
        this.inputStyle = {
            height: this.selectStyle.height,
            width: this.selectStyle.width
                    - this.selectStyle.height
                    - this.selectStyle.padding.right
                    - this.selectStyle.padding.left,
            margin: this.selectStyle.margin,
            padding: {
                top: 0,
                right: this.selectStyle.padding.right + this.selectStyle.height,
                bottom: 0,
                left: this.selectStyle.padding.left
            },
            font: this.selectStyle.font
        };
        this.buttonStyle = {
            height: this.selectStyle.height,
            width: this.selectStyle.height,
            left: - (this.selectStyle.padding.right + this.selectStyle.height)
        };
        this.optionsStyle = {
            top: this.selectStyle.height + this.selectStyle.margin.top + 2 * this.selectStyle.border.width,
            left: this.selectStyle.margin.left
        };
        this.optionStyle = {
            width: this.selectStyle.width - this.selectStyle.padding.right - this.selectStyle.padding.left,
            font: this.selectStyle.font
        };
    };
    Dropdown.prototype = {
        render: function() {
            if (this.select.multiple) {
                console.log("ID '%s' is not single select.", this.select.id);
                return false;
            }
            let wrapper = this.renderWrapper();

            let input = this.renderInput();
            wrapper.append(input);

            let button = this.renderButton();
            wrapper.append(button);

            let options = this.renderOptions();
            wrapper.append(options);

            Utils.next(this.select, wrapper);
            this.el = {
                wrapper: wrapper,
                input: input,
                button: button,
                options: options
            };

            window.addEventListener("click", (event) => {
                if (event.target.closest(".fj-wrapper") !== wrapper) {
                    this.value(this.el.input.value);
                    this.close();
                }
            });
            return this;
        },
        renderWrapper: function() {
            let wrapper = Utils.element("<span class='fj-wrapper'></span>");
            wrapper.addEventListener("keydown", (event) => {
                switch (event.code) {
                    case "ArrowUp":
                        this.cursor(-1);
                        break;
                    case "ArrowDown":
                        this.cursor(1);
                        break;
                    case "Enter":
                    case "Tab":
                        if (event.isComposing) {
                            this.rerenderOptions();
                        } else {
                            let focus = this.el.options.querySelectorAll(".focus");
                            this.value(focus.length === 0 ? this.el.input.value : focus[0].innerText);
                            this.close();
                        }
                        break;
                    default:
                        break;
                }
            });
            wrapper.addEventListener("keyup", (event) => {
                switch (event.code) {
                    case "ArrowUp":
                    case "ArrowDown":
                    case "Enter":
                    case "Tab":
                        break;
                    default:
                        this.rerenderOptions();
                        break;
                }
            });
            return wrapper;
        },
        renderInput: function() {
            let input = Utils.element("<input class='fj-input' type='text'/>");
            input.style.height = this.inputStyle.height + "px";
            input.style.width = this.inputStyle.width + "px";
            input.style.margin = Utils.formatFourPx(this.inputStyle.margin);
            input.style.padding = Utils.formatFourPx(this.inputStyle.padding);
            input.style.fontSize = this.inputStyle.font.size + "px";
            input.addEventListener("keydown", (event) => {
                if (event.code === "ArrowUp" || event.code === "ArrowDown") {
                    this.open();
                }
            });
            return input;
        },
        renderButton: function() {
            let button = Utils.element("<a class='fj-expansion' href='#'>&nbsp;</a>");
            button.style.height = this.buttonStyle.height + "px";
            button.style.width = this.buttonStyle.width + "px";
            button.style.left = this.buttonStyle.left + "px";
            button.addEventListener("click", (event) => {
                this.isOpen() ? this.close() : this.open();
            });
            return button;
        },
        renderOptions: function() {
            let options = Utils.element("<ul class='fj-options'></ul>");
            options.style.display = "none";
            options.style.top = this.optionsStyle.top + "px";
            options.style.left = this.optionsStyle.left + "px";
            return options;
        },
        rerenderOptions: function() {
            let items = this.items.filter((item) => item.label.indexOf(this.el.input.value) > -1);
            let options = this.el.options.cloneNode(false);
            for (let idx = 0; idx < items.length; idx++) {
                options.append(this.renderOption(items[idx]));
            }
            this.el.wrapper.replaceChild(options, this.el.options);
            this.el.options = options;
            return options;
        },
        renderOption: function(item) {
            let option = Utils.element("<li></li>");
            option.dataset.value = item.value;
            option.innerText = item.label;
            option.style.width = this.optionStyle.width + "px";
            option.style.fontSize = this.optionStyle.font.size + "px";
            option.addEventListener("mouseover", (event) => {
                this.el.options.querySelectorAll("li").forEach((option) => option.classList.remove("focus"));
                event.target.classList.add("focus");
            });
            option.addEventListener("click", (event) => {
                this.value(event.target.innerText);
                this.close();
            });
            return option;
        },
        open: function() {
            if (!this.isOpen()) {
                this.rerenderOptions();
                this.el.options.style.display = "block";
            }
            return this;
        },
        close: function() {
            if (this.isOpen()) {
                this.el.options.querySelectorAll("li").forEach((option) => option.classList.remove("focus"));
                this.el.options.style.display = "none";
            }
            return this;
        },
        isOpen: function() {
            return this.el.options.style.display === "block";
        },
        cursor: function(cursor) {
            let options = this.el.options;
            if (!this.isOpen()) {
                return this;
            }
            let focused = options.querySelectorAll(".focus");
            if (focused.length === 0) {
                options.children[cursor > 0 ? 0 : options.children.length - 1].classList.add("focus");
                return this;
            }
            let newIndex = Utils.indexOf(options.children, focused[0]) + cursor;
            focused[0].classList.remove("focus");
            if (newIndex < 0 || newIndex > options.children.length - 1) {
                this.el.input.focus();
                return this;
            }
            options.children[newIndex].classList.add("focus");
            return this;
        },
        value: function(value) {
            if (arguments.length === 0) {
                return this.select.value;
            }
            let item = this.items.find((item) => item.label === value);
            if (!item) {
                this.select.value = "";
                this.el.input.value = "";
                console.warn(`無効な値です：${value}`);
                return false;
            }
            this.select.value = item.value;
            this.el.input.value = item.label;
            return this;
        }
    }
    window.FJ = {
        dropdown: function(settings) {
            if (!settings || settings.length === 0) {
                settings = [
                    {
                        page: ".*",
                        selector: "select"
                    }
                ]
            }
            settings.forEach((setting) => {
                if (!location.href.match(new RegExp(setting.page))) {
                    console.log("Page '%s' is not matched.", setting.page);
                    return false;
                }
                document.querySelectorAll(setting.selector).forEach(FJ.render);
            });
        },
        render: function(select) {
            let dropdown = new Dropdown(select);
            dropdown.render();
        }
    };
})(window);