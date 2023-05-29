import { ReqorePanel } from '@qoretechnologies/reqore';
import { IReqorePanelAction } from '@qoretechnologies/reqore/dist/components/Panel';
import React from 'react';
import shortid from 'shortid';
import styled from 'styled-components';
import { TTranslator } from '../../App';
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

const StyledToolbar = styled(ReqorePanel)`
  position: absolute !important;
  width: 202px;
  right: 15px;
  top: 15px;
  z-index: 10;
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
    setZoom: (number: number) => void;
    items?: { y: number; x: number }[];
    t: TTranslator;
    panElementId?: string;
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
      baseScrollX: 0,
      baseScrollY: 0,
      maxX: 0,
      maxY: 0,
      showMinimap: true,
      showToolbar: true,
      panElementId: shortid.generate(),
    };
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.ref = this.ref.bind(this);
  }

  public calculateValueWithZoom(value: number, zoom: number = this.props.zoom) {
    return calculateValueWithZoom(value, zoom);
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

    if (!this.state.dragging) {
      return;
    }

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
    // Less then 0 means scrolling up / zoom in
    if (e.deltaY < 0) {
      this.props.setZoom(this.props.zoom + 0.1 > 1.5 ? 1.5 : this.props.zoom + 0.1);
    } else {
      this.props.setZoom(this.props.zoom - 0.1 < 0.5 ? 0.5 : this.props.zoom - 0.1);
    }
  }

  public componentDidMount() {
    this.init();
  }

  public componentWillUnmount() {
    window.removeEventListener('wheel', this.onWheel);
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

    window.addEventListener('wheel', this.onWheel);

    this.setState(state);
  };

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
      this.setState({ showMinimap: true });
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
        id={`panElement${panElementId}`}
        bgColor={this.props.bgColor}
      >
        {this.props.children}
        <StyledToolbar
          draggable
          id="pan-element-toolbar"
          size="small"
          padded={false}
          badge={this.props.zoom}
          actions={[
            {
              icon: 'PriceTag2Line',
              tooltip: 'Show state & path IDs',
              id: 'show-state-ids',
              active: this.props.showStateIds,
              onClick: () => this.props.setShowStateIds(!this.props.showStateIds),
            } as IReqorePanelAction,
          ]}
          collapsible
        >
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
