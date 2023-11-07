import { ReqorePanel } from '@qoretechnologies/reqore';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import React from 'react';
import shortid from 'shortid';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { Emitter } from '../../hooks/useMoveByDragging';
import Minimap from './minimap';

const eventListener = require('eventlistener');

export const calculateReverseValueWithZoom = (value: number, zoom: number) => {
  return zoom < 1 ? value - (value * (1 - zoom)) / (zoom + 1) : value + value * (zoom - 1) * zoom;
};

export const calculateValueWithZoom = (value: number, zoom: number) => {
  return zoom < 1 ? value + (value * (1 - zoom)) / zoom : value - (value * (zoom - 1)) / zoom;
};

export interface ElementPanState {
  dragging: boolean;
  elHeight: number;
  elWidth: number;
  startX: number;
  startY: number;
  scrollX: number;
  scrollY: number;
  baseScrollX: number;
  baseScrollY: number;
  maxX: number;
  maxY: number;
  showMinimap: boolean;
  showToolbar: boolean;
}

const StyledContainer = styled.div``;

const StyledToolbar: React.FC<IReqorePanelProps> = styled(ReqorePanel)`
  position: absolute !important;
  width: 202px;
  right: 15px;
  top: 15px;
  z-index: 100;
  opacity: 0.3;

  &:hover {
    opacity: 1;
  }

  transition: opacity 0.2s ease-in-out;
`;

let timeout;

export class ElementPan extends React.Component<
  {
    className?: string;
    onPanStart?: (e?: ElementPanState) => void;
    onPan?: (coords?: { x: number; y: number }) => void;
    onPanStop?: (coords?: { x: number; y: number }) => void;
    onDoubleClick: (e?: any) => void;
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
    zoomIn: () => void;
    zoomOut: () => void;
    items?: { y: number; x: number }[];
    t: TTranslator;
    panElementId?: string;
    id;
  },
  ElementPanState
> {
  public el: HTMLDivElement;
  public interval: any;

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
      baseScrollX: 0,
      baseScrollY: 0,
      maxX: 0,
      maxY: 0,
      showMinimap: true,
      showToolbar: true,
      panElementId: shortid.generate(),
    };
    this.onDragMove = this.onDragMove.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.addEdgeMovementListeners = this.addEdgeMovementListeners.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.ref = this.ref.bind(this);
  }

  public calculateValueWithZoom(value: number, zoom: number = this.props.zoom) {
    return calculateValueWithZoom(value, zoom);
  }

  public onDragStart(e) {
    if (e.shiftKey) {
      return;
    }
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

      baseScrollX: this.el.scrollLeft,
      baseScrollY: this.el.scrollTop,

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

    let x = typeof e.clientX === 'undefined' ? e.changedTouches[0].clientX : e.clientX,
      y = typeof e.clientY === 'undefined' ? e.changedTouches[0].clientY : e.clientY;

    // Letting the browser automatically stop on scrollHeight
    // gives weird bugs where some extra pixels are showing.
    // Substracting the height/width of the container from the
    // inner content seems to do the trick.
    let leftScroll = Math.min(
      this.state.maxX - this.state.elWidth,
      this.state.baseScrollX - (x - this.state.startX)
    );
    let topScroll = Math.min(
      this.state.maxY - this.state.elHeight,
      this.state.baseScrollY - (y - this.state.startY)
    );

    // leftScroll = this.calculateValueWithZoom(leftScroll, this.props.zoom);
    // topScroll = this.calculateValueWithZoom(topScroll, this.props.zoom);

    this.el.scrollLeft = leftScroll;
    this.el.scrollTop = topScroll;

    if (this.props.onPan) {
      this.props.onPan({ x: this.el.scrollLeft, y: this.el.scrollTop });
    }

    if (!timeout) {
      this.setState({ scrollX: this.el.scrollLeft, scrollY: this.el.scrollTop });
      timeout = setTimeout(() => {
        timeout = null;
      }, 16);
    }
  }

  public handleMinimapMove = (x, y) => {
    this.el.scrollTop += y;
    this.el.scrollLeft += x;

    this.setState({ scrollX: this.el.scrollLeft, scrollY: this.el.scrollTop });

    if (this.props.onPan) {
      this.props.onPan({ x: this.el.scrollLeft, y: this.el.scrollTop });
    }
  };

  public onDragStop() {
    this.setState({ dragging: false });

    eventListener.remove(window, 'mousemove', this.onDragMove);
    eventListener.remove(window, 'touchmove', this.onDragMove);
    eventListener.remove(window, 'mouseup', this.onDragStop);
    eventListener.remove(window, 'touchend', this.onDragStop);

    this.setState({ scrollX: this.el.scrollLeft, scrollY: this.el.scrollTop });

    if (this.props.onPanStop) {
      this.props.onPanStop({ x: this.el.scrollLeft, y: this.el.scrollTop });
    }
  }

  public onWheel(e) {
    e.stopPropagation();
    // Less then 0 means scrolling up / zoom in
    if (e.deltaY < 0) {
      this.props.zoomIn();
    } else {
      this.props.zoomOut();
    }
  }

  public componentDidMount() {
    this.init();
  }

  public componentWillUnmount() {
    this.removeEdgeMovementListeners();
    document.getElementById(this.props.id).removeEventListener('wheel', this.onWheel);
  }

  public handleMouseMove(e) {
    clearInterval(this.interval);
    this.interval = null;

    const move = () => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = document
        .getElementById(this.props.id)
        .getBoundingClientRect();

      const x = clientX - left;
      const y = clientY - top;

      let scroll = false;
      let scrollLeft = false;
      let scrollTop = false;
      let scrollRight = false;
      let scrollBottom = false;

      let newLeft = this.el.scrollLeft;
      let newTop = this.el.scrollTop;

      if (width - x <= 50 && newLeft !== this.el.scrollWidth - this.el.clientWidth) {
        scroll = true;
        scrollRight = true;
        newLeft += 10;
      } else {
        scrollRight = false;
      }

      if (x <= 50 && newLeft !== 0) {
        scroll = true;
        scrollLeft = true;
        newLeft -= 10;
      } else {
        scrollLeft = false;
      }

      if (y <= 50 && newTop !== 0) {
        scroll = true;
        scrollTop = true;
        newTop -= 10;
      } else {
        scrollTop = false;
      }

      if (height - y <= 50 && newTop !== this.el.scrollHeight - this.el.clientHeight) {
        scroll = true;
        scrollBottom = true;
        newTop += 10;
      } else {
        scrollBottom = false;
      }

      if (scroll) {
        this.el.scrollLeft = newLeft;
        this.el.scrollTop = newTop;

        this.setState({ scrollX: newLeft, scrollY: newTop });
        this.props.onPan({ x: newLeft, y: newTop });

        Emitter.emit('drag-area-move', {
          scrollLeft,
          scrollTop,
          scrollRight,
          scrollBottom,
        });
      }
    };

    move();

    this.interval = setInterval(() => {
      move();
    }, 16);
  }

  public handleMouseLeave(e) {
    clearInterval(this.interval);
    this.interval = null;
    document.getElementById(this.props.id).removeEventListener('mouseleave', this.handleMouseLeave);
  }

  public addEdgeMovementListeners() {
    document.getElementById(this.props.id).removeEventListener('mouseleave', this.handleMouseLeave);
    document.getElementById(this.props.id).addEventListener('mouseleave', this.handleMouseLeave);
    document.getElementById(this.props.id).removeEventListener('mousemove', this.handleMouseMove);
    document.getElementById(this.props.id).addEventListener('mousemove', this.handleMouseMove);
  }

  public removeEdgeMovementListeners() {
    clearInterval(this.interval);
    this.interval = null;
    document.getElementById(this.props.id).removeEventListener('mouseleave', this.handleMouseLeave);
    document.getElementById(this.props.id).removeEventListener('mousemove', this.handleMouseMove);
  }

  public componentDidUpdate(prevProps) {
    if (
      prevProps.wrapperSize.width !== this.props.wrapperSize.width ||
      prevProps.wrapperSize.height !== this.props.wrapperSize.height
    ) {
      if (this.props.enableEdgeMovement) {
        this.addEdgeMovementListeners();
      }
    }

    if (prevProps.enableEdgeMovement !== this.props.enableEdgeMovement) {
      if (this.props.enableEdgeMovement) {
        this.addEdgeMovementListeners();
      } else {
        this.removeEdgeMovementListeners();
      }
    }
  }

  init = () => {
    let state = {};

    if (this.props.startX) {
      this.el.scrollLeft = this.props.startX;
      state.scrollX = this.el.scrollLeft;
    }

    if (this.props.startY) {
      this.el.scrollTop = this.props.startY;
      state.scrollY = this.el.scrollTop;
    }

    if (this.props.onPan) {
      this.props.onPan({ x: this.el.scrollLeft, y: this.el.scrollTop });
    }

    document.getElementById(this.props.id).addEventListener('wheel', this.onWheel);

    this.setState(state);
  };

  public getContainerStyles(): any {
    let style: any = {
      overflow: 'hidden',
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
      this.setState({ showMinimap: true });

      if (this.props.enableEdgeMovement) {
        this.addEdgeMovementListeners();
      }
    }
  }

  public render() {
    const { t } = this.props;
    const { panElementId } = this.state;

    return (
      <StyledContainer
        ref={this.ref}
        className={this.props.className || 'element-pan'}
        style={this.getContainerStyles()}
        onTouchStart={this.props.enableDragging ? this.onDragStart : undefined}
        onMouseDown={this.props.enableDragging ? this.onDragStart : undefined}
        onDoubleClick={this.props.onDoubleClick}
        id={`panElement${panElementId}`}
        bgColor={this.props.bgColor}
      >
        {this.props.children}
        <StyledToolbar draggable id="pan-element-toolbar" size="small" padded={false}>
          <Minimap
            show={this.state.showMinimap}
            items={this.props.items}
            x={this.state.scrollX}
            y={this.state.scrollY}
            zoom={this.props.zoom}
            onDrag={this.handleMinimapMove}
            panElementId={panElementId}
          />
        </StyledToolbar>
      </StyledContainer>
    );
  }
}
