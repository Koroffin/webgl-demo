export class Slider {
    static DEFAULT_WIDTH = 500;
    static HANDLER_RADIUS = 10;
    minValue: number;
    maxValue: number;
    steps: number;
    value: number;
    wrapper?: HTMLDivElement;
    fn?: (value: number) => void;
    constructor(title: string, initialValue: number, minValue: number = -1, maxValue: number = 1, steps: number = 20, containerSelector: string = "#sliders") {
        this.maxValue = maxValue;
        this.minValue = minValue;
        this.steps = steps;
        this.value = initialValue;

        const container = document.querySelector(containerSelector);

        if (!container) {
            return;
        }

        if (!(container instanceof HTMLDivElement)) {
            return;
        }

        this.render(title, container)
    }
    bind(fn: (value: number) => void) {
        this.fn = fn;
    }
    render(titleString: string, container: HTMLDivElement) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("slider");

        const title = document.createElement("div");
        title.classList.add("title");
        title.innerText = titleString;

        const bar = document.createElement("div");
        bar.classList.add("bar");

        const progress = document.createElement("div");
        progress.classList.add("progress");
        progress.style.width = `${this.handlerPosition}px`;

        const handler = document.createElement("div");
        handler.classList.add("handler");
        handler.style.left = `${this.handlerPosition - Slider.HANDLER_RADIUS}px`;
        handler.addEventListener("mousedown", this.startMoving)

        const handlerValue = document.createElement("div");
        handlerValue.classList.add("handler_value");
        handlerValue.innerText = `${this.value}`;

        handler.append(handlerValue);
        bar.append(handler, progress);
        wrapper.append(title, bar);

        container.append(wrapper);

        this.wrapper = wrapper;
    }
    get handlerPosition() {
        return Slider.DEFAULT_WIDTH * (this.value - this.minValue) / (this.maxValue - this.minValue);
    }
    startMoving = (evt: MouseEvent) => {
        const { wrapper } = this;

        if (!wrapper) {
            return;
        }

        const handler = wrapper.querySelector(".handler");

        if (!handler) {
            return;
        }

        if (!(handler instanceof HTMLDivElement)) {
            return;
        }

        const handlerValue = handler.querySelector(".handler_value");

        if (!handlerValue) {
            return;
        }
        if (!(handlerValue instanceof HTMLDivElement)) {
            return;
        }

        handlerValue.classList.add("show");

        const progress = wrapper.querySelector(".progress");

        if (!progress) {
            return;
        }
        if (!(progress instanceof HTMLDivElement)) {
            return;
        }

        const { left: wrapperLeft } = wrapper.getBoundingClientRect();
        const { left: handlerInitialLeft } = handler.getBoundingClientRect();
        const { pageX } = evt;

        const delta = pageX - handlerInitialLeft;

        const mousemove = (evt: MouseEvent) => {
            const { pageX } = evt;
            const x = pageX - wrapperLeft - delta;

            if (x < -Slider.HANDLER_RADIUS) {
                return;
            }
            if (x > Slider.DEFAULT_WIDTH - Slider.HANDLER_RADIUS) {
                return;
            }

            handler.style.left = `${x}px`;
            this.value = this.minValue + (x + Slider.HANDLER_RADIUS) * (this.maxValue - this.minValue) / Slider.DEFAULT_WIDTH;
            handlerValue.innerText = `${this.value}`;

            progress.style.width = `${x + Slider.HANDLER_RADIUS}px`;

            this.fn?.(this.value);
        }

        const mouseup = () => {
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("mouseup", mouseup);
            handlerValue.classList.remove("show");
        }

        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);        
    }
}