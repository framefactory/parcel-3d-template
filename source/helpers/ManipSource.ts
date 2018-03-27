/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

export type ManipEventType = "down" | "move" | "up" | "cancel" | "wheel";

////////////////////////////////////////////////////////////////////////////////

export interface ManipEvent
{
    source: "mouse" | "touch";
    target: EventTarget;
    currentTarget: EventTarget;
    manip: ManipSource;
    type: ManipEventType;
    isActive: boolean;

    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    movementX: number;
    movementY: number;
    centerX: number;
    centerY: number;

    button: number;
    buttons: number;
    wheel: number;

    changedTouches: TouchList;
    targetTouches: TouchList;
    touches: TouchList;
    pinchDistance: number;
    pinchFactor: number;

    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}

export interface ManipListener
{
    onManipBegin: (event: ManipEvent) => boolean;
    onManipEnd: (event: ManipEvent) => void;
    onManipUpdate: (event: ManipEvent) => void;
    onManipEvent: (event: ManipEvent) => void;
}

export interface ManipTraits
{
    touchable?: boolean;
    draggable?: boolean;
    scrollable?: boolean;
    stopPropagation?: boolean;
    preventDefault?: boolean;
}

////////////////////////////////////////////////////////////////////////////////

export default class ManipSource
{
    protected element: HTMLElement;
    protected traits: ManipTraits;
    protected listener: ManipListener;

    protected activationEvent: ManipEvent;
    protected lastEvent: ManipEvent;
    protected pinchDistance: number;
    protected isActive: boolean;
    protected isCaptured: boolean;

    constructor(element: HTMLElement, traits?: ManipTraits)
    {
        traits = traits || {};
        traits.preventDefault = traits.preventDefault === undefined ? true : traits.preventDefault;

        this.element = element;
        this.traits = traits;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onTouchCancel = this.onTouchCancel.bind(this);

        this.onContextMenu = this.onContextMenu.bind(this);

        this.addEventListeners(element, false);
    }

    detach()
    {
        this.stopCapture();
        this.removeEventListeners(this.element, false);
    }

    setListener(listener: ManipListener)
    {
        this.listener = listener;
    }

    protected startCapture()
    {
        if (!this.isCaptured) {
            this.removeEventListeners(this.element, false);
            this.addEventListeners(document, true);

            this.isCaptured = true;
        }
    }

    protected stopCapture()
    {
        if (this.isCaptured) {
            this.removeEventListeners(document, true);
            this.addEventListeners(this.element, false);
        }

        this.isCaptured = false;
    }

    protected onManipBegin(event: ManipEvent): boolean
    {
        //console.log("onManipBegin", event);

        if (this.listener) {
            return this.listener.onManipBegin(event);
        }

        return true;
    }

    protected onManipUpdate(event: ManipEvent)
    {
        //console.log("onManipUpdate", event);

        if (this.listener) {
            this.listener.onManipUpdate(event);
        }
    }

    protected onManipEnd(event: ManipEvent)
    {
        //console.log("onManipEnd", event);

        if (this.listener) {
            this.listener.onManipEnd(event);
        }
    }

    protected onManipEvent(event: ManipEvent)
    {
        //console.log("onManipEvent", event);

        if (this.listener) {
            this.listener.onManipEvent(event);
        }
    }

    protected onMouseDown(event: MouseEvent)
    {
        this.setPropagation(event);
        const manipEvent = this.manipFromMouseEvent(event, "down");

        if (this.isActive) {
            this.onManipUpdate(manipEvent);
        }
        else {
            this.isActive = this.onManipBegin(manipEvent);

            if (this.isActive) {
                this.activationEvent = manipEvent;
                if (this.traits.draggable) {
                    this.startCapture();
                }
            }
        }

        this.lastEvent = manipEvent;
    }

    protected onMouseMove(event: MouseEvent)
    {
        this.setPropagation(event);
        const manipEvent = this.manipFromMouseEvent(event, "move");

        this.onManipUpdate(manipEvent);

        this.lastEvent = manipEvent;
    }

    protected onMouseUp(event: MouseEvent)
    {
        this.setPropagation(event);
        const manipEvent = this.manipFromMouseEvent(event, "up");

        if (this.isActive && manipEvent.buttons == 0) {
            this.onManipEnd(manipEvent);
            this.isActive = false;
            this.stopCapture();
            this.activationEvent = null;
        }
        else {
            this.onManipUpdate(manipEvent);
        }

        this.lastEvent = manipEvent;
    }

    protected onMouseWheel(event: WheelEvent)
    {
        this.setPropagation(event);
        const manipEvent = this.manipFromMouseEvent(event, "wheel");
        this.onManipEvent(manipEvent);
    }

    protected onTouchStart(event: TouchEvent)
    {
        this.setPropagation(event);
        event.preventDefault(); // prevent generation of additional mouse events
        const manipEvent = this.manipFromTouchEvent(event, "down");

        if (this.isActive) {
            this.onManipUpdate(manipEvent);
        }
        else {
            this.isActive = this.onManipBegin(manipEvent);

            if (this.isActive) {
                this.activationEvent = manipEvent;
                if (this.traits.draggable) {
                    this.startCapture();
                }
            }
        }

        this.lastEvent = manipEvent;
    }

    protected onTouchMove(event: TouchEvent)
    {
        this.setPropagation(event);
        event.preventDefault(); // prevent generation of additional mouse events
        const manipEvent = this.manipFromTouchEvent(event, "move");

        this.onManipUpdate(manipEvent);

        this.lastEvent = manipEvent;
    }

    protected onTouchEnd(event: TouchEvent)
    {
        this.setPropagation(event);
        event.preventDefault(); // prevent generation of additional mouse events
        const manipEvent = this.manipFromTouchEvent(event, "up");

        if (this.isActive && manipEvent.touches.length == 0) {
            this.onManipEnd(manipEvent);
            this.isActive = false;
            this.stopCapture();
            this.pinchDistance = 0;
            this.activationEvent = null;
            this.lastEvent = null;
        }
        else {
            this.onManipUpdate(manipEvent);
        }

        this.lastEvent = manipEvent;
    }

    protected onTouchCancel(event: TouchEvent)
    {
        this.setPropagation(event);
        event.preventDefault(); // prevent generation of additional mouse events
        const manipEvent = this.manipFromTouchEvent(event, "cancel");

        if (this.isActive && manipEvent.touches.length == 0) {
            this.onManipEnd(manipEvent);
            this.isActive = false;
            this.stopCapture();
            this.pinchDistance = 0;
            this.activationEvent = null;
            this.lastEvent = null;
        }
        else {
            this.onManipUpdate(manipEvent);
        }

        this.lastEvent = manipEvent;
    }

    protected onContextMenu(event: MouseEvent)
    {
        this.setPropagation(event);
    }

    protected setPropagation(event: MouseEvent | TouchEvent)
    {
        if (this.traits.stopPropagation === true) {
            event.stopPropagation();
        }

        if (this.traits.preventDefault === true) {
            event.preventDefault();
        }
    }

    protected manipFromMouseEvent(event: MouseEvent | WheelEvent, type: ManipEventType): ManipEvent
    {
        let wheelEvent = event as WheelEvent;

        return {
            source: "mouse",
            target: event.target,
            currentTarget: event.currentTarget,
            manip: this,
            type: type,
            isActive: this.isActive,

            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            movementX: event.movementX || (this.lastEvent ? event.screenX - this.lastEvent.screenX : 0),
            movementY: event.movementY || (this.lastEvent ? event.screenY - this.lastEvent.screenY : 0),
            centerX: event.screenX,
            centerY: event.screenY,

            button: event.button,
            buttons: event.buttons,
            wheel: type === "wheel" ? (wheelEvent.wheelDelta || wheelEvent.deltaY) : 0,

            changedTouches: null,
            targetTouches: null,
            touches: null,
            pinchDistance: 0,
            pinchFactor: 0,

            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        };
    }

    protected manipFromTouchEvent(event: TouchEvent, type: ManipEventType): ManipEvent
    {
        const manipEvent: ManipEvent = {
            source: "touch",
            target: event.target,
            currentTarget: event.currentTarget,
            manip: this,
            type: type,
            isActive: this.isActive,

            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            offsetX: 0,
            offsetY: 0,
            movementX: 0,
            movementY: 0,
            centerX: 0,
            centerY: 0,

            button: 0,
            buttons: 0,
            wheel: 0,

            changedTouches: event.changedTouches,
            targetTouches: event.targetTouches,
            touches: event.touches,
            pinchDistance: 0,
            pinchFactor: 0,

            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        };

        const touches = event.touches;
        const count = touches.length;

        if (count > 0) {

            manipEvent.screenX = touches[0].screenX;
            manipEvent.screenY = touches[0].screenY;
            manipEvent.clientX = touches[0].clientX;
            manipEvent.clientY = touches[0].clientY;

            if (this.lastEvent) {
                manipEvent.movementX = manipEvent.screenX - this.lastEvent.screenX;
                manipEvent.movementY = manipEvent.screenY - this.lastEvent.screenY;
            }

            for (let i = 0; i < count; ++i) {
                const touch = touches[i];
                manipEvent.centerX += touch.screenX;
                manipEvent.centerY += touch.screenY;
            }

            manipEvent.centerX /= count;
            manipEvent.centerY /= count;

            if (count === 2) {
                const dx = touches[1].screenX - touches[0].screenX;
                const dy = touches[1].screenY - touches[0].screenY;
                const d = Math.sqrt(dx * dx + dy * dy);
                manipEvent.pinchDistance = d;
                if (this.pinchDistance === 0) {
                    this.pinchDistance = d;
                }

                manipEvent.pinchFactor = d / this.pinchDistance;
            }
        }

        return manipEvent;
    }

    private addEventListeners(target: HTMLElement | HTMLDocument, capture: boolean)
    {
        target.addEventListener("mousedown", this.onMouseDown, capture);
        target.addEventListener("mousemove", this.onMouseMove, capture);
        target.addEventListener("mouseup", this.onMouseUp, capture);
        target.addEventListener("contextmenu", this.onContextMenu, capture);

        if (this.traits.touchable) {
            target.addEventListener("touchstart", this.onTouchStart, capture);
            target.addEventListener("touchmove", this.onTouchMove, capture);
            target.addEventListener("touchend", this.onTouchEnd, capture);
            target.addEventListener("touchcancel", this.onTouchCancel, capture);
        }

        if (this.traits.scrollable) {
            target.addEventListener("wheel", this.onMouseWheel, capture);
        }
    }

    private removeEventListeners(target: HTMLElement | HTMLDocument, capture: boolean)
    {
        target.removeEventListener("mousedown", this.onMouseDown, capture);
        target.removeEventListener("mousemove", this.onMouseMove, capture);
        target.removeEventListener("mouseup", this.onMouseUp, capture);
        target.removeEventListener("contextmenu", this.onContextMenu, capture);

        if (this.traits.touchable) {
            target.removeEventListener("touchstart", this.onTouchStart, capture);
            target.removeEventListener("touchmove", this.onTouchMove, capture);
            target.removeEventListener("touchend", this.onTouchEnd, capture);
            target.removeEventListener("touchcancel", this.onTouchCancel, capture);
        }

        if (this.traits.scrollable) {
            target.removeEventListener("wheel", this.onMouseWheel, capture);
        }
    }
}