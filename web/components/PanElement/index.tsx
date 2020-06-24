import React from 'react';
import { Button } from '@blueprintjs/core';
const eventListener = require('eventlistener');

export interface ElementPanState {
    dragging: boolean;
    elHeight: number;
    elWidth: number;
    startX: number;
    startY: number;
    scrollX: number;
    scrollY: number;
    maxX: number;
    maxY: number;
}

export class ElementPan extends React.Component<
    {
        className?: string;
        onPanStart?: (e?: ElementPanState) => void;
        onPan?: (coords?: { x: number; y: number }) => void;
        onPanStop?: (coords?: { x: number; y: number }) => void;
        enableDragging?: boolean;
        startX?: number;
        startY?: number;
        width?: number;
        height?: number;
        refElem?: (el: HTMLDivElement) => void;
        style?: {
            [key: string]: any;
        };
        zoom: number;
    },
    ElementPanState
> {
    public el: HTMLDivElement;

    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            elHeight: 0,
            elWidth: 0,
            startX: 0,
            startY: 0,
            scrollX: 0,
            scrollY: 0,
            maxX: 0,
            maxY: 0,
        };
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragStop = this.onDragStop.bind(this);
        this.ref = this.ref.bind(this);
    }

    public onDragStart(e) {
        // We want to be able to pan around inside the container even when the
        // mouse is on the outside of the element (as long as the mouse button
        // is still being pressed) - this is why we're attaching to the window
        eventListener.add(window, 'mousemove', this.onDragMove);
        eventListener.add(window, 'touchmove', this.onDragMove);
        eventListener.add(window, 'mouseup', this.onDragStop);
        eventListener.add(window, 'touchend', this.onDragStop);

        // If we have multiple child nodes, use the scroll[Height/Width]
        // If we have no child-nodes, use bounds to find size of inner content
        var bounds,
            target = e.currentTarget || e.target;
        if (target.childNodes.length > 1) {
            bounds = { width: target.scrollWidth, height: target.scrollHeight };
        } else {
            bounds = e.target.getBoundingClientRect();
        }

        // Find start position of drag based on touch/mouse coordinates
        var startX = typeof e.clientX === 'undefined' ? e.changedTouches[0].clientX : e.clientX,
            startY = typeof e.clientY === 'undefined' ? e.changedTouches[0].clientY : e.clientY;

        var state = {
            dragging: true,

            elHeight: this.el.clientHeight,
            elWidth: this.el.clientWidth,

            startX: startX,
            startY: startY,

            scrollX: this.el.scrollLeft,
            scrollY: this.el.scrollTop,

            maxX: bounds.width,
            maxY: bounds.height,
        };

        this.setState(state);

        if (this.props.onPanStart) {
            this.props.onPanStart(state);
        }
    }

    public onDragMove(e) {
        e.preventDefault();

        if (!this.state.dragging) {
            return;
        }

        var x = typeof e.clientX === 'undefined' ? e.changedTouches[0].clientX : e.clientX,
            y = typeof e.clientY === 'undefined' ? e.changedTouches[0].clientY : e.clientY;

        // Letting the browser automatically stop on scrollHeight
        // gives weird bugs where some extra pixels are showing.
        // Substracting the height/width of the container from the
        // inner content seems to do the trick.
        this.el.scrollLeft = Math.min(
            this.state.maxX - this.state.elWidth,
            this.state.scrollX - (x - this.state.startX)
        );

        this.el.scrollTop = Math.min(
            this.state.maxY - this.state.elHeight,
            this.state.scrollY - (y - this.state.startY)
        );

        if (this.props.onPan) {
            this.props.onPan({ x: this.el.scrollLeft, y: this.el.scrollTop });
        }
    }

    public onDragStop() {
        this.setState({ dragging: false });

        eventListener.remove(window, 'mousemove', this.onDragMove);
        eventListener.remove(window, 'touchmove', this.onDragMove);
        eventListener.remove(window, 'mouseup', this.onDragStop);
        eventListener.remove(window, 'touchend', this.onDragStop);

        if (this.props.onPanStop) {
            this.props.onPanStop({ x: this.el.scrollLeft, y: this.el.scrollTop });
        }
    }

    public componentDidMount() {
        this.init();
    }

    init = () => {
        if (this.props.startX) {
            this.el.scrollLeft = this.props.startX;
        }

        if (this.props.startY) {
            this.el.scrollTop = this.props.startY;
        }
    }

    public getContainerStyles(): any {
        let style: any = {
            overflow: 'hidden',
            cursor: this.props.enableDragging ? 'move' : 'initial',
        };

        if (this.props.width) {
            style.width = this.props.width;
        }

        if (this.props.height) {
            style.height = this.props.height;
        }

        if (this.props.style) {
            style = { ...style, ...this.props.style };
        }

        return style;
    }

    public ref(el: HTMLDivElement) {
        if (el) {
            if (this.props.refElem) this.props.refElem(el);
            this.el = el;
        }
    }

    public render() {
        return (
            <div
                ref={this.ref}
                className={this.props.className || 'element-pan'}
                style={this.getContainerStyles()}
                onTouchStart={this.props.enableDragging && this.onDragStart}
                onMouseDown={this.props.enableDragging && this.onDragStart}
            >
                <Button style={{ position: 'absolute', right: '15px', top: '15px', zIndex: 500 }} icon='zoom-to-fit' onClick={this.init} /> 
                {this.props.children}
            </div>
        );
    }
}
