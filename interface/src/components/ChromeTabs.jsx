import React, { Component } from "react";
import Measure from 'react-measure';

class ChromeTabs extends Component {
  state = {
    dimensions: {
      width: -1,
      height: -1
    },
    tabWidth: 240
  }
  render() {
    const { width, height } = this.state.dimensions
    return (
      <div className="chrome-tabs">
        <Measure
          bounds
          onResize={(contentRect) => {
            this.setState({ dimensions: contentRect.bounds })
            let w = contentRect.bounds.width / this.props.tabs.length
            if (w > 240) w = 240
            this.setState({ tabWidth: w })
          }}>
          {({measureRef}) =>
            <div
              className="chrome-tabs-content"
              ref={measureRef} >
              {this.props.tabs && this.props.tabs.map((tab, i) => {
                return tab.window ? (
                  <ChromeTab
                    key={i}
                    order={i}
                    title={tab.window.title}
                    favicon={tab.window.favicon}
                    active={tab.window.active}
                    width={this.state.tabWidth} />
                ) : ''
              })}
            </div>
          }
        </Measure>
        <div className="chrome-tabs-bottom-bar" />
      </div>
    );
  }
}

class ChromeTab extends Component {
  render() {
    return(
      <div
        className={`chrome-tab${this.props.active ? ' chrome-tab-current' : ''}`}
        style={{
          width: this.props.width,
          transform: this.props.order ? `translate(${(this.props.width * this.props.order) - (this.props.order * 14)}px, 0)` : ''
        }}
        title={this.props.title}>
        <div className="chrome-tab-background">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <symbol id="topleft" viewBox="0 0 214 29">
                <path d="M14.3 0.1L214 0.1 214 29 0 29C0 29 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z" />
              </symbol>
              <symbol id="topright" viewBox="0 0 214 29">
                <use xlinkHref="#topleft" />
              </symbol>
              <clippath id="crop">
                <rect className="mask" width="100%" height="100%" x={0} />
              </clippath>
            </defs>
            <svg width="50%" height="100%" transform="scale(-1, 1)">
              <use
                xlinkHref="#topleft"
                width={214}
                height={29}
                className="chrome-tab-background"
              />
              <use
                xlinkHref="#topleft"
                width={214}
                height={29}
                className="chrome-tab-shadow"
              />
            </svg>
            <g transform="scale(-1, 1)">
              <svg width="50%" height="100%" x="-100%" y={0}>
                <use
                  xlinkHref="#topright"
                  width={214}
                  height={29}
                  className="chrome-tab-background"
                />
                <use
                  xlinkHref="#topright"
                  width={214}
                  height={29}
                  className="chrome-tab-shadow"
                />
              </svg>
            </g>
          </svg>
        </div>
        <div
          className="chrome-tab-favicon"
          style={{
            backgroundImage: this.props.favicon ? `url(${JSON.stringify(this.props.favicon)})` : ''
          }}
        />
        <div className="chrome-tab-title">{this.props.title}</div>
        <div className="chrome-tab-close" title="" />
      </div>
    )
  }
}

export default ChromeTabs;