import { Fragment } from 'react';

const BarIcon = ( { activeIcon, iconName, svgStyle, iconColor, preview = false } ) => {
    return (
        <Fragment>
            { iconName === 'shipping-bar-icon-1' && (
                <svg
                    width={ `${ preview ? 32 : 20 }` }
                    height={ `${ preview ? 32 : 20 }` }
                    viewBox='0 0 200 200'
                    className={ `radio-icon ${ iconName }` }
                    style={ svgStyle ? { ...svgStyle } : { height: '100%', overflow: 'hidden', flexShrink: 0, position: 'relative' } }
                >
                    <g>
                        <path
                            fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M44.41,75.95H31.11c-1.75,0-3.16,1.42-3.16,3.16l0,22.72c0,1.75,1.42,3.16,3.16,3.16s3.16-1.42,3.16-3.16v-8.74h8.22   c1.55,0,2.81-1.26,2.81-2.81c0-1.55-1.26-2.81-2.81-2.81h-8.22v-5.91h10.13c1.55,0,2.81-1.26,2.81-2.81   C47.22,77.21,45.96,75.95,44.41,75.95z'
                        />
                        <path
                            fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M72.45,78.51c-0.76-0.82-1.68-1.45-2.77-1.89c-1.08-0.44-2.29-0.67-3.62-0.67H55.45c-1.75,0-3.16,1.42-3.16,3.16v23.07   c0,1.55,1.26,2.81,2.81,2.81h0.71c1.55,0,2.81-1.26,2.81-2.81v-7.84h4.54l4.31,9.05c0.47,0.98,1.45,1.6,2.54,1.6h0.72   c2.09,0,3.45-2.2,2.51-4.06l-3.67-7.34c1.77-0.67,3.1-1.73,3.97-3.2c0.87-1.47,1.31-3.19,1.31-5.16c0-1.39-0.21-2.65-0.62-3.79   C73.8,80.3,73.21,79.33,72.45,78.51z M68.31,86.14c0,0.94-0.27,1.66-0.81,2.14c-0.54,0.49-1.28,0.73-2.23,0.73h-6.66v-7.57h6.66   c0.94,0,1.68,0.24,2.23,0.73c0.54,0.49,0.81,1.2,0.81,2.14V86.14z'
                        />
                        <path
                            fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M97.29,81.57c1.55,0,2.81-1.26,2.81-2.81s-1.26-2.81-2.81-2.81H83.5c-1.75,0-3.16,1.42-3.16,3.16v23.07   c0,1.55,1.26,2.81,2.81,2.81h14.15c1.55,0,2.81-1.26,2.81-2.81s-1.26-2.81-2.81-2.81H86.66v-6.28h8.72c1.55,0,2.81-1.26,2.81-2.81   s-1.26-2.81-2.81-2.81h-8.72v-5.91L97.29,81.57z'
                        />
                        <path
                            fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M122.55,81.57c1.55,0,2.81-1.26,2.81-2.81s-1.26-2.81-2.81-2.81h-13.79c-1.75,0-3.16,1.42-3.16,3.16v23.07   c0,1.55,1.26,2.81,2.81,2.81h14.15c1.55,0,2.81-1.26,2.81-2.81s-1.26-2.81-2.81-2.81h-10.63v-6.28h8.72c1.55,0,2.81-1.26,2.81-2.81   s-1.26-2.81-2.81-2.81h-8.72v-5.91H122.55z'
                        />
                        <path
                            fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M190,90.28l-17.53-14.21c-2.39-1.94-5.41-3.01-8.5-3.01h-17.15v-7.92c0-6.63-5.37-12-12-12H123.8   c2.17-2.89,3.47-6.47,3.47-10.36c0-9.57-7.79-17.36-17.37-17.36c-5.66,0-10.69,2.74-13.86,6.95c-3.17-4.21-8.2-6.95-13.86-6.95   c-9.58,0-17.37,7.79-17.37,17.36c0,3.89,1.3,7.47,3.47,10.36H17c-6.63,0-12,5.37-12,12v79.92c0,6.63,5.37,12,12,12h19.36   c0.01,0.06,0.03,0.12,0.04,0.18c0.09,0.44,0.21,0.87,0.33,1.29c0.04,0.12,0.07,0.24,0.11,0.36c0,0.01,0.01,0.02,0.01,0.03   c0.06,0.19,0.13,0.38,0.2,0.57c0.04,0.12,0.09,0.23,0.14,0.34c0.1,0.26,0.19,0.51,0.3,0.76c0.01,0.03,0.02,0.07,0.04,0.1   c0.1,0.21,0.19,0.42,0.3,0.63c0.03,0.07,0.08,0.13,0.11,0.2c0.13,0.25,0.26,0.49,0.4,0.73c0.11,0.19,0.22,0.37,0.33,0.55   c0.17,0.27,0.34,0.54,0.52,0.79c0.1,0.15,0.2,0.29,0.31,0.43c0.08,0.1,0.16,0.2,0.24,0.3c0.15,0.19,0.3,0.38,0.46,0.57   c0.12,0.14,0.25,0.29,0.37,0.43c0.13,0.14,0.25,0.27,0.38,0.4c0.1,0.1,0.19,0.21,0.3,0.31c0.01,0.01,0.03,0.03,0.04,0.04   c0.35,0.34,0.71,0.67,1.09,0.99c0,0,0,0,0,0c0.94,0.77,1.96,1.44,3.04,2.01c0.13,0.07,0.25,0.14,0.39,0.2   c0.27,0.14,0.54,0.26,0.82,0.38c0.11,0.05,0.23,0.09,0.34,0.14c0.18,0.07,0.36,0.15,0.54,0.21c0.19,0.07,0.38,0.13,0.57,0.2   c0.15,0.05,0.29,0.1,0.44,0.14c0.16,0.05,0.32,0.1,0.5,0.14c0.18,0.05,0.35,0.09,0.52,0.13c0.08,0.02,0.17,0.04,0.26,0.05   c0.16,0.03,0.32,0.06,0.47,0.09c0.15,0.03,0.29,0.06,0.44,0.08c0.16,0.03,0.32,0.05,0.48,0.07c0.09,0.02,0.18,0.02,0.27,0.03   c0.17,0.02,0.34,0.04,0.51,0.06c0.06,0.01,0.12,0.01,0.18,0.01c0.2,0.02,0.39,0.03,0.59,0.04c0.19,0.01,0.39,0.01,0.59,0.01   c0.07,0,0.14,0.01,0.21,0.01c0.07,0,0.15-0.01,0.22-0.01c0.19,0,0.38-0.01,0.57-0.01c0.2-0.01,0.39-0.02,0.59-0.04   c0.06,0,0.11-0.01,0.16-0.01c0.19-0.02,0.38-0.04,0.57-0.06c0.08-0.01,0.15-0.01,0.23-0.03c0.16-0.02,0.32-0.04,0.48-0.07   c0.13-0.02,0.26-0.05,0.39-0.07c0.19-0.04,0.38-0.07,0.57-0.11c0.07-0.02,0.14-0.03,0.2-0.04c0.17-0.04,0.34-0.08,0.52-0.13   c0.15-0.04,0.28-0.08,0.42-0.12c0.22-0.06,0.43-0.13,0.65-0.21c0.15-0.05,0.3-0.1,0.44-0.15c0.14-0.05,0.28-0.11,0.42-0.17   c0.24-0.1,0.48-0.19,0.71-0.3c0.19-0.09,0.38-0.17,0.57-0.26c0.09-0.04,0.18-0.09,0.27-0.14c1.76-0.91,3.34-2.1,4.69-3.52   c0.09-0.1,0.18-0.19,0.27-0.29c0.09-0.11,0.18-0.21,0.28-0.32c0.22-0.25,0.42-0.51,0.63-0.77c0.05-0.07,0.11-0.14,0.17-0.21   c0.08-0.1,0.15-0.21,0.23-0.31c0.23-0.32,0.44-0.65,0.65-0.99c0.09-0.14,0.18-0.29,0.26-0.43c0.15-0.26,0.3-0.53,0.44-0.8   c0.03-0.06,0.06-0.11,0.09-0.17c0.11-0.21,0.2-0.42,0.3-0.63c0.01-0.03,0.02-0.05,0.03-0.08c0.12-0.27,0.22-0.54,0.33-0.82   c0.04-0.1,0.09-0.2,0.12-0.3c0.07-0.19,0.14-0.38,0.2-0.57c0-0.01,0-0.01,0.01-0.02c0.04-0.13,0.08-0.27,0.12-0.4   c0.12-0.41,0.23-0.83,0.32-1.25c0.01-0.07,0.03-0.13,0.05-0.2h78.4c0.04,0.19,0.1,0.38,0.14,0.56c0.06,0.25,0.12,0.5,0.19,0.75   c0.07,0.25,0.15,0.5,0.23,0.75c0.02,0.05,0.03,0.11,0.05,0.16c0.08,0.23,0.16,0.45,0.25,0.67c0.02,0.06,0.05,0.12,0.07,0.18   c0.07,0.16,0.13,0.32,0.21,0.48c0.08,0.18,0.16,0.36,0.24,0.54c0.06,0.14,0.14,0.27,0.21,0.41c0.14,0.28,0.3,0.55,0.45,0.82   c0.08,0.14,0.15,0.27,0.24,0.41c0.06,0.1,0.13,0.19,0.19,0.29c0.14,0.21,0.28,0.42,0.42,0.62c0.1,0.14,0.2,0.29,0.31,0.43   c0.09,0.11,0.18,0.22,0.26,0.33c0.15,0.19,0.31,0.37,0.47,0.56c0.09,0.11,0.18,0.21,0.28,0.32c0.09,0.1,0.18,0.19,0.27,0.28   c0.93,0.98,1.97,1.85,3.1,2.6c0.15,0.1,0.3,0.19,0.44,0.29c0.17,0.11,0.35,0.2,0.53,0.3c0.18,0.1,0.37,0.2,0.55,0.3   c0.16,0.08,0.32,0.16,0.48,0.25c0.18,0.08,0.36,0.16,0.53,0.24c0.18,0.08,0.37,0.16,0.55,0.23c0.16,0.07,0.32,0.14,0.49,0.19   c0.16,0.06,0.33,0.11,0.5,0.17c0.18,0.06,0.37,0.12,0.56,0.18c0.15,0.05,0.3,0.09,0.46,0.13c0.17,0.05,0.35,0.09,0.52,0.13   c0.08,0.02,0.15,0.03,0.23,0.05c0.17,0.04,0.35,0.07,0.53,0.1c0.14,0.03,0.27,0.06,0.41,0.08c0.16,0.03,0.32,0.05,0.48,0.07   c0.08,0.01,0.16,0.02,0.25,0.03c0.18,0.02,0.36,0.04,0.54,0.06c0.06,0.01,0.11,0.01,0.17,0.01c0.2,0.02,0.39,0.03,0.59,0.04   c0.19,0.01,0.38,0.01,0.58,0.01c0.07,0,0.14,0.01,0.21,0.01s0.14-0.01,0.21-0.01c0.19,0,0.39-0.01,0.58-0.01   c0.19-0.01,0.38-0.02,0.56-0.04c0.02,0,0.04,0,0.06-0.01c0.26-0.02,0.51-0.05,0.76-0.08c0.09-0.01,0.18-0.01,0.26-0.03   c0.17-0.02,0.34-0.05,0.51-0.08c0.1-0.01,0.19-0.04,0.28-0.05c0.22-0.04,0.44-0.09,0.65-0.14c0.1-0.02,0.21-0.04,0.3-0.07   c0.2-0.05,0.39-0.11,0.58-0.16c0.25-0.07,0.5-0.14,0.74-0.22c0.17-0.06,0.34-0.11,0.51-0.18c0.11-0.04,0.22-0.09,0.33-0.13   c0.23-0.09,0.47-0.18,0.7-0.28c0.27-0.12,0.53-0.25,0.79-0.38c0.26-0.13,0.51-0.26,0.76-0.4c0.12-0.07,0.24-0.13,0.37-0.21   c0.14-0.08,0.26-0.17,0.39-0.25c0.27-0.17,0.53-0.35,0.79-0.53c0.11-0.08,0.22-0.15,0.32-0.23c0.14-0.11,0.28-0.22,0.42-0.32   c0.6-0.47,1.16-0.98,1.69-1.53c0.13-0.13,0.26-0.27,0.39-0.41c0.1-0.1,0.19-0.22,0.28-0.33c0.16-0.19,0.32-0.38,0.47-0.57   c0.01-0.01,0.02-0.03,0.03-0.04c0.02-0.02,0.04-0.03,0.05-0.06c0.15-0.19,0.29-0.37,0.43-0.57c0.03-0.04,0.05-0.09,0.08-0.13   c0.2-0.28,0.38-0.56,0.56-0.85c0.13-0.21,0.26-0.42,0.39-0.64c0.19-0.33,0.35-0.67,0.52-1.01c0.05-0.1,0.1-0.19,0.15-0.29   c0.06-0.12,0.11-0.24,0.17-0.36c0.03-0.06,0.06-0.13,0.08-0.19c0.07-0.16,0.13-0.31,0.19-0.48c0.07-0.18,0.14-0.37,0.21-0.57   c0.03-0.08,0.05-0.16,0.07-0.25c0.07-0.22,0.14-0.45,0.2-0.67c0.05-0.18,0.11-0.35,0.16-0.53c0.06-0.2,0.1-0.41,0.14-0.62   c0.01-0.05,0.02-0.1,0.03-0.15c0.01-0.04,0.02-0.08,0.03-0.13c0,0,0,0,0,0c6.51-0.96,11.52-6.57,11.52-13.34v-42.8   C195,96.67,193.18,92.85,190,90.28z M60.54,153.56c0,3.87-3.13,7-7,7c-3.87,0-7-3.13-7-7c0-3.86,3.13-7,7-7   C57.41,146.56,60.54,149.7,60.54,153.56z M139.82,150.06H70.7c-0.01-0.07-0.03-0.13-0.05-0.2c-0.09-0.42-0.2-0.83-0.32-1.24   c-0.04-0.13-0.08-0.27-0.12-0.4c0-0.01,0-0.01-0.01-0.02c-0.07-0.22-0.15-0.44-0.23-0.66c-0.07-0.18-0.14-0.35-0.2-0.52   c-0.07-0.16-0.13-0.33-0.2-0.49c-0.08-0.19-0.17-0.38-0.25-0.56c-0.05-0.11-0.12-0.21-0.17-0.31c-0.15-0.29-0.3-0.58-0.47-0.86   c-0.06-0.1-0.11-0.21-0.17-0.32c-0.11-0.17-0.22-0.34-0.33-0.51c-0.08-0.12-0.15-0.23-0.23-0.35c-0.24-0.36-0.5-0.71-0.79-1.05   c-0.67-0.82-1.41-1.58-2.21-2.27c-0.09-0.08-0.17-0.17-0.27-0.24c0,0,0,0,0,0c-0.04-0.03-0.09-0.06-0.13-0.1   c-0.35-0.3-0.72-0.57-1.1-0.82c-0.09-0.06-0.18-0.12-0.27-0.18c-0.19-0.12-0.37-0.25-0.56-0.37c-0.18-0.1-0.37-0.21-0.55-0.31   c-0.12-0.07-0.24-0.13-0.36-0.2c-0.19-0.1-0.38-0.2-0.58-0.3c-0.13-0.06-0.26-0.11-0.39-0.17c-0.24-0.11-0.47-0.21-0.72-0.31   c-0.31-0.12-0.62-0.24-0.94-0.34c-0.24-0.08-0.47-0.15-0.71-0.22c-0.15-0.04-0.3-0.1-0.45-0.14c-0.24-0.06-0.48-0.11-0.72-0.16   c-0.07-0.02-0.15-0.03-0.22-0.05c-0.25-0.05-0.49-0.1-0.75-0.14h-0.04c-0.28-0.04-0.56-0.08-0.85-0.11   c-0.3-0.03-0.59-0.05-0.89-0.07c-0.3-0.02-0.6-0.03-0.9-0.03c-0.3,0-0.6,0.01-0.9,0.03c-0.3,0.02-0.59,0.04-0.89,0.07   c-0.29,0.03-0.57,0.07-0.85,0.11h-0.04c-0.27,0.05-0.53,0.09-0.79,0.15c-0.03,0.01-0.07,0.01-0.1,0.02   c-0.27,0.06-0.53,0.11-0.8,0.18c-0.17,0.04-0.33,0.11-0.5,0.15c-0.21,0.06-0.41,0.12-0.61,0.19c-0.35,0.12-0.7,0.24-1.05,0.38   c-0.2,0.08-0.4,0.17-0.59,0.25c-0.15,0.07-0.32,0.13-0.47,0.2c-0.23,0.12-0.46,0.23-0.68,0.35c-0.05,0.03-0.1,0.05-0.15,0.08   c-0.22,0.13-0.45,0.25-0.67,0.38c-0.23,0.14-0.44,0.28-0.67,0.43c-0.02,0.01-0.04,0.03-0.07,0.04c-0.45,0.3-0.88,0.61-1.29,0.97   c-0.01,0.01-0.02,0.02-0.03,0.03c0,0,0,0-0.01,0c-0.27,0.22-0.52,0.47-0.77,0.71c-0.58,0.54-1.14,1.11-1.64,1.73   c-0.32,0.38-0.62,0.78-0.9,1.2c-0.05,0.07-0.09,0.14-0.14,0.21c-0.13,0.2-0.26,0.39-0.38,0.59c-0.07,0.11-0.13,0.24-0.19,0.36   c-0.15,0.26-0.29,0.52-0.43,0.79c-0.06,0.12-0.13,0.23-0.19,0.35c-0.09,0.2-0.19,0.41-0.27,0.61c-0.06,0.13-0.11,0.25-0.16,0.38   c-0.08,0.19-0.15,0.38-0.23,0.58c-0.08,0.22-0.16,0.44-0.23,0.66c0,0.01-0.01,0.02-0.01,0.03c-0.04,0.12-0.07,0.24-0.11,0.36   c-0.13,0.42-0.24,0.85-0.33,1.28c-0.01,0.06-0.03,0.12-0.04,0.18H18.5c-3.59,0-6.5-2.91-6.5-6.5v-15.77h127.82V150.06z    M139.82,120.79H12V66.64c0-3.59,2.91-6.5,6.5-6.5h114.82c3.59,0,6.5,2.91,6.5,6.5V120.79z M173.28,153.56c0,3.87-3.13,7-7,7   c-3.87,0-7-3.13-7-7c0-3.86,3.13-7,7-7C170.15,146.56,173.28,149.7,173.28,153.56z M188,123.86h-16.44c-0.6,0-1.17,0.15-1.66,0.42   c-0.2,0.11-0.39,0.24-0.56,0.38c-0.09,0.07-0.17,0.15-0.25,0.23c-0.64,0.63-1.03,1.5-1.03,2.47c0,1.93,1.57,3.5,3.5,3.5H188v12.7   c0,2.93-1.95,5.41-4.61,6.22c-0.02-0.11-0.05-0.21-0.08-0.32c-0.08-0.35-0.18-0.7-0.28-1.04c-0.02-0.05-0.03-0.1-0.05-0.15   c-0.1-0.33-0.22-0.65-0.34-0.96c-0.06-0.18-0.14-0.36-0.21-0.54c-0.08-0.17-0.15-0.34-0.23-0.5c-0.07-0.17-0.15-0.33-0.23-0.49   c-0.07-0.16-0.16-0.31-0.24-0.46c-0.03-0.06-0.07-0.13-0.11-0.19c-0.1-0.18-0.19-0.36-0.3-0.54c-0.11-0.18-0.23-0.35-0.34-0.52   c-0.09-0.14-0.18-0.29-0.28-0.43c-0.21-0.3-0.43-0.6-0.66-0.89c-0.11-0.15-0.23-0.29-0.34-0.43c-0.15-0.17-0.3-0.35-0.45-0.52   c-0.15-0.17-0.31-0.33-0.47-0.5c-0.07-0.08-0.15-0.15-0.22-0.22c-0.16-0.16-0.33-0.32-0.5-0.47c-0.19-0.17-0.38-0.34-0.58-0.5   c-0.12-0.1-0.24-0.19-0.36-0.28c-0.31-0.25-0.63-0.5-0.96-0.73c-0.02-0.01-0.04-0.03-0.07-0.04c-0.02-0.02-0.05-0.03-0.07-0.04   c-0.23-0.15-0.46-0.3-0.7-0.44c-0.47-0.29-0.95-0.56-1.45-0.79c-0.2-0.1-0.4-0.18-0.6-0.27c-0.09-0.04-0.18-0.08-0.27-0.12   c-0.46-0.19-0.92-0.37-1.41-0.52c-0.06-0.02-0.12-0.04-0.18-0.06c-0.25-0.08-0.51-0.15-0.77-0.22c-0.56-0.15-1.13-0.27-1.71-0.35   c-0.29-0.04-0.58-0.08-0.87-0.11c-0.3-0.03-0.59-0.05-0.89-0.07c-0.3-0.02-0.6-0.03-0.9-0.03c-0.3,0-0.6,0.01-0.9,0.03   c-0.3,0.02-0.59,0.04-0.89,0.07c-0.29,0.03-0.57,0.07-0.85,0.11h-0.04c-0.26,0.05-0.52,0.09-0.77,0.14   c-0.05,0.01-0.11,0.02-0.16,0.03c-0.25,0.05-0.51,0.11-0.76,0.17c-0.16,0.04-0.32,0.1-0.48,0.15c-0.22,0.06-0.45,0.13-0.67,0.21   c-0.33,0.11-0.66,0.23-0.99,0.36c-0.22,0.09-0.45,0.19-0.67,0.28c-0.14,0.06-0.29,0.11-0.42,0.18c-0.2,0.11-0.41,0.21-0.61,0.32   c-0.1,0.05-0.19,0.1-0.29,0.16c-0.2,0.11-0.4,0.22-0.59,0.34c-0.2,0.13-0.39,0.25-0.59,0.38c-0.07,0.05-0.15,0.1-0.22,0.15   c-0.4,0.27-0.78,0.55-1.14,0.85c-0.04,0.03-0.08,0.05-0.11,0.08c0,0,0,0,0,0c-0.11,0.1-0.22,0.2-0.33,0.3   c-0.39,0.34-0.77,0.69-1.13,1.07c-0.12,0.12-0.24,0.24-0.35,0.37c-0.12,0.14-0.24,0.28-0.36,0.41c-0.11,0.13-0.23,0.27-0.34,0.4   c-0.1,0.13-0.21,0.26-0.31,0.39c-0.12,0.16-0.24,0.33-0.36,0.5c-0.12,0.17-0.24,0.34-0.35,0.51c-0.07,0.11-0.15,0.22-0.22,0.33   c-0.09,0.15-0.18,0.31-0.27,0.46c-0.14,0.24-0.28,0.49-0.41,0.74c-0.08,0.14-0.16,0.29-0.22,0.43c-0.09,0.18-0.17,0.37-0.26,0.56   c-0.07,0.15-0.13,0.3-0.19,0.45c-0.03,0.06-0.05,0.12-0.08,0.19c-0.09,0.22-0.17,0.44-0.25,0.67c-0.02,0.05-0.03,0.11-0.05,0.16   c-0.08,0.25-0.16,0.5-0.23,0.75c-0.07,0.24-0.13,0.49-0.19,0.73c-0.05,0.19-0.11,0.38-0.15,0.57h-2.28v-70h8.28v25.09   c0,7.44,6.06,13.5,13.5,13.5H188V123.86z'
                        />
                    </g>
                </svg>
            ) }

            { iconName === 'shipping-bar-icon-2' && (
                <svg
                    width={ `${ preview ? 32 : 22 }` }
                    height={ `${ preview ? 32 : 22 }` }
                    viewBox='0 0 200 200'
                    className={ `radio-icon ${ iconName }` }
                    style={ svgStyle ? { ...svgStyle } : { height: '100%', overflow: 'hidden', flexShrink: 0, position: 'relative' } }
                >
                    <g>
                        <path
                             fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M100.42,115.62l1.66,0.9l1.66-0.9c11.32-6.09,23.56-17.41,23.98-30.92c0.19-5.92-2.09-10.7-6.26-13.12   c-4.86-2.83-11.79-1.93-19,2.48c-0.23,0.14-0.52,0.14-0.75-0.01c-7.18-4.38-14.17-5.28-19.01-2.47c-4.16,2.42-6.44,7.2-6.25,13.12   C76.88,98.2,89.12,109.53,100.42,115.62z'
                        />
                        <path
                             fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M190,73.17l-17.53-14.21c-2.39-1.94-5.41-3.01-8.5-3.01h-17.64c-1.57-5.71-6.8-9.92-13-9.92H34.94   c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h98.39c3.56,0,6.46,2.88,6.5,6.44v73.49H90.7c-1.62-7.99-8.7-14.03-17.17-14.03   c-8.46,0-15.55,6.04-17.18,14.03H30.94c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h25.44c1.75,7.99,9.3,14.02,17.76,14.02   c8.46,0,15.07-6.03,16.58-14.02h56.1v0h2.29c1.63,7.99,8.71,14.02,17.17,14.02c8.53,0,15.64-6.11,17.2-14.18   c6.5-0.96,11.52-6.56,11.52-13.34V83.66C195,79.57,193.18,75.74,190,73.17z M73.53,143.45c-3.87,0-7-3.13-7-7c0-3.86,3.13-7,7-7   c3.86,0,7,3.14,7,7C80.53,140.32,77.39,143.45,73.53,143.45z M166.28,143.45c-3.86,0-7-3.14-7-7c0-3.87,3.14-7,7-7   c3.87,0,7,3.13,7,7C173.28,140.31,170.15,143.45,166.28,143.45z M183.39,132.67c-1.74-7.85-8.74-13.75-17.11-13.75   c-8.46,0-15.54,6.04-17.17,14.03h-2.29v-70h8.28v25.09c0,7.44,6.06,13.5,13.5,13.5H188v5.21h-16.44c-1.93,0-3.5,1.57-3.5,3.5   s1.57,3.5,3.5,3.5H188v12.7C188,129.38,186.05,131.86,183.39,132.67z'
                        />
                        <path
                             fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M25.77,78.3h37.27c1.93,0,3.5-1.57,3.5-3.5s-1.57-3.5-3.5-3.5H25.77c-1.93,0-3.5,1.57-3.5,3.5S23.84,78.3,25.77,78.3z'
                        />
                        <path
                             fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M67.25,92.99c0-1.93-1.57-3.5-3.5-3.5H8.5c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h55.25   C65.68,96.49,67.25,94.93,67.25,92.99z'
                        />
                        <path
                             fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                            d='M77.73,111.18c0-1.93-1.57-3.5-3.5-3.5H20.98c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h53.25   C76.16,114.68,77.73,113.11,77.73,111.18z'
                        />
                    </g>
                </svg>
            ) }

            { iconName === 'shipping-bar-icon-3' && (
                <svg
                    width={ `${ preview ? 32 : 22 }` }
                    height={ `${ preview ? 32 : 22 }` }
                    viewBox='0 0 200 200'
                    className={ `radio-icon ${ iconName }` }
                    style={ svgStyle ? { ...svgStyle } : { height: '100%', overflow: 'hidden', flexShrink: 0, position: 'relative' } }
                >
                    <path
                        fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                        d='M190,73.17l-17.53-14.21c-2.39-1.94-5.41-3.01-8.5-3.01h-17.64c-1.58-5.71-6.8-9.92-13.01-9.92H34.94  c-1.94,0-3.5,1.56-3.5,3.5c0,1.93,1.56,3.5,3.5,3.5h98.38c3.59,0,6.5,2.91,6.5,6.5v73.42H90.7c-1.62-7.99-8.7-14.03-17.17-14.03  c-8.47,0-15.55,6.04-17.17,14.03H30.94c-1.94,0-3.5,1.57-3.5,3.5c0,1.94,1.56,3.5,3.5,3.5h25.42c1.63,7.99,8.71,14.02,17.17,14.02  c8.46,0,15.54-6.03,17.17-14.02h58.41c1.63,7.99,8.71,14.02,17.17,14.02c8.52,0,15.63-6.11,17.2-14.18  c6.51-0.96,11.52-6.57,11.52-13.34V83.66C195,79.57,193.18,75.74,190,73.17z M73.53,143.45c-3.87,0-7-3.13-7-7c0-3.86,3.13-7,7-7  c3.86,0,7,3.14,7,7C80.53,140.32,77.39,143.45,73.53,143.45z M166.28,143.45c-3.86,0-7-3.14-7-7c0-3.87,3.14-7,7-7  c3.87,0,7,3.13,7,7C173.28,140.31,170.15,143.45,166.28,143.45z M188,106.75h-16.44c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5H188  v12.7c0,2.93-1.95,5.41-4.61,6.22c-1.73-7.85-8.74-13.75-17.11-13.75c-8.46,0-15.54,6.04-17.17,14.03h-2.29v-70h8.28v25.09  c0,7.44,6.06,13.5,13.5,13.5H188V106.75z'
                    />
                    <path
                        fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                        d='M25.77,74.3h106.27c1.93,0,3.5-1.57,3.5-3.5s-1.57-3.5-3.5-3.5H25.77c-1.93,0-3.5,1.57-3.5,3.5S23.84,74.3,25.77,74.3z'
                    />
                    <path
                        fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                        d='M67.25,88.99c0-1.93-1.57-3.5-3.5-3.5H8.5c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h55.25  C65.68,92.49,67.25,90.92,67.25,88.99z'
                    />
                    <path
                        fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                        d='M87.73,107.18c0-1.93-1.57-3.5-3.5-3.5H20.98c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h63.25  C86.16,110.68,87.73,109.11,87.73,107.18z'
                    />
                    <path
                        fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                        d='M128.47,88.99c0-1.93-1.57-3.5-3.5-3.5H89.72c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h35.25  C126.91,92.49,128.47,90.92,128.47,88.99z'
                    />
                    <path
                        fill={ `${ iconColor ? iconColor : ( activeIcon ? '#FFF' : '#073B4C' ) }` }
                        d='M133.29,107.18c0-1.93-1.57-3.5-3.5-3.5h-23.25c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5h23.25  C131.72,110.68,133.29,109.11,133.29,107.18z'
                    />
                </svg>
            ) }
        </Fragment>
    );
}

export default BarIcon;
