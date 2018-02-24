import ModuleTypings from '../../../definitions/module'
import jss from 'jss'
import color from 'color'
import preset from 'jss-preset-default'

jss.setup(preset())

export default (Module: ModuleTypings["Module"]) => {
  const floatingStyles = !(typeof Module.params === 'string' || typeof Module.params === 'function') ? {
    borderRadius: 6,
    height: 300,
    width: 700,
    maxWidth: '100vw',
    maxHeight: '80vh',
    zIndex: 9999999,
    position: 'fixed',
    bottom: 15,
    right: 15,
    boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
  } : {
    height: '100%',
    width: '100%',
    position: 'relative'
  }

  const styles = {
    'container': {
      ...floatingStyles,
      background: '#272822',
      display: 'flex',
      overflow: 'hidden',
      '& pre': {
        margin: 0,
        overflowX: 'initial !important'
      },
      '& .react-json-view': {
        '& .copy-to-clipboard-container': {
          position: 'absolute'
        }
      }
    },
    'close': {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 1,
      cursor: 'pointer',
      height: '40px',
      width: '40px',
      padding: '10px',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)'
      }
    },
    'closeFill': {
      fill: 'transparent',
    },
    'closeButton': {
      fill: '#fff'
    },
    'column': {
      width: '50%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: [
        '0px 3px 2px 0px #1a1b17'
      ]
    },
    'columnHeader': {
      color: '#fff',
      margin: 0,
      zIndex: 1,
      padding: '10px 0',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      fontSize: '17px',
      textAlign: 'center',
      boxSizing: 'border-box',
      height: 40,
      boxShadow: [
        '0 3px 9px 3px #272822'
      ],
      flexShrink: 0,
      background: 'rgba(255,255,255,0.1)',
    },
    'columnContent': {
      overflow: 'scroll',
      flexGrow: 1,
      marginLeft: '10px',
      marginRight: '5px',
      paddingTop: '10px',
      '&::-webkit-scrollbar': {
        width: 15,
        background: '#272822',
        '&:disabled': {
          width: 0,
          height: 0
        }
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#4b4c47',
        border: '2px solid #272822',
        borderTop: '14px solid #272822',
        borderBottom: '4px solid #272822',
        '&:hover': {
          backgroundColor: '#6a6b66'
        },
        '&:horizontal': {
          borderTop: '4px solid #272822',
        }
      },
      '&::-webkit-scrollbar-corner': {
        backgroundColor: 'transparent'
      }
    }
  }

  return jss.createStyleSheet(styles).attach().classes
}