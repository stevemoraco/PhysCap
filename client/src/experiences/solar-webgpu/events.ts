import {
  MOUSE_MAX_X,
  MOUSE_MIN_X,
  MOUSE_RANGE_MAX,
  MOUSE_RANGE_MIN,
  MOUSE_SMOOTHING,
  TARGET_MAX,
  TARGET_MIN,
  TARGET_OFFSET,
} from './constants.ts';

export class EventHandler {
  private canvas: HTMLCanvasElement;
  private mouseX = 1.0;
  private targetMouseX = 1.0;
  private isMouseDown = false;
  private listeners: Array<{
    target: EventTarget;
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  dispose() {
    for (const { target, type, listener, options } of this.listeners) {
      target.removeEventListener(type, listener as EventListener, options);
    }
    this.listeners = [];
  }

  private addListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    target.addEventListener(type, listener as EventListener, options);
    this.listeners.push({ target, type, listener, options });
  }

  private setupEventListeners() {
    // Mouse events
    this.addListener(this.canvas, 'mouseup', this.handleMouseUp);
    this.addListener(this.canvas, 'mouseleave', this.handleMouseLeave);
    this.addListener(this.canvas, 'mousedown', this.handleMouseDown);
    this.addListener(this.canvas, 'mousemove', this.handleMouseMove);

    // Touch events
    const passiveFalse = { passive: false };
    this.addListener(
      this.canvas,
      'touchstart',
      this.handleTouchStart,
      passiveFalse,
    );
    this.addListener(
      this.canvas,
      'touchmove',
      this.handleTouchMove,
      passiveFalse,
    );
    this.addListener(this.canvas, 'touchend', this.handleTouchEnd, passiveFalse);
  }

  private handleMouseUp = () => {
    this.isMouseDown = false;
  };

  private handleMouseLeave = () => {
    this.isMouseDown = false;
  };

  private handleMouseDown = (event: Event) => {
    const mouseEvent = event as MouseEvent;
    this.handlePointerDown(mouseEvent.clientX);
  };

  private handleMouseMove = (event: Event) => {
    if (!this.isMouseDown) return;
    const mouseEvent = event as MouseEvent;
    this.handlePointerMove(mouseEvent.clientX);
  };

  private handleTouchStart = (event: Event) => {
    event.preventDefault();
    const touchEvent = event as TouchEvent;
    const touch = touchEvent.touches[0];
    if (!touch) return;
    this.handlePointerDown(touch.clientX);
  };

  private handleTouchMove = (event: Event) => {
    event.preventDefault();
    if (!this.isMouseDown) return;
    const touchEvent = event as TouchEvent;
    const touch = touchEvent.touches[0];
    if (!touch) return;
    this.handlePointerMove(touch.clientX);
  };

  private handleTouchEnd = (event: Event) => {
    event.preventDefault();
    this.isMouseDown = false;
  };

  private handlePointerDown(clientX: number) {
    this.isMouseDown = true;
    this.updateTargetMouseX(clientX);
  }

  private handlePointerMove(clientX: number) {
    this.updateTargetMouseX(clientX);
  }

  private updateTargetMouseX(clientX: number) {
    const rect = this.canvas.getBoundingClientRect();
    const normalizedX = (clientX - rect.left) / rect.width;
    const clampedX = Math.max(MOUSE_MIN_X, Math.min(MOUSE_MAX_X, normalizedX));
    this.targetMouseX =
      ((clampedX - MOUSE_RANGE_MIN) / (MOUSE_RANGE_MAX - MOUSE_RANGE_MIN)) *
        (TARGET_MAX - TARGET_MIN) + TARGET_OFFSET;
  }

  update() {
    if (this.isMouseDown) {
      this.mouseX += (this.targetMouseX - this.mouseX) * MOUSE_SMOOTHING;
    }
  }

  get currentMouseX() {
    return this.mouseX;
  }

  get isPointerDown() {
    return this.isMouseDown;
  }
}
