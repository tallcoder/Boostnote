import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './NewNoteButton.styl'
import _ from 'lodash'
import modal from 'browser/main/lib/modal'
import NewNoteModal from 'browser/main/modals/NewNoteModal'
import eventEmitter from 'browser/main/lib/eventEmitter'
import i18n from 'browser/lib/i18n'

const { remote } = require('electron')
const { dialog } = remote

const OSX = window.process.platform === 'darwin'

class NewNoteButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }

    this.newNoteHandler = () => {
      this.handleNewNoteButtonClick()
    }
  }

  componentDidMount () {
    eventEmitter.on('top:new-note', this.newNoteHandler)
  }

  componentWillUnmount () {
    eventEmitter.off('top:new-note', this.newNoteHandler)
  }

  handleNewNoteButtonClick (e) {
    const { location, dispatch } = this.props
    const { storage, folder } = this.resolveTargetFolder()

    modal.open(NewNoteModal, {
      storage: storage.key,
      folder: folder.key,
      dispatch,
      location
    })
  }

  resolveTargetFolder () {
    const { data, params } = this.props
    let storage = data.storageMap.get(params.storageKey)

    // Find first storage
    if (storage == null) {
      for (const kv of data.storageMap) {
        storage = kv[1]
        break
      }
    }

    if (storage == null) this.showMessageBox('No storage to create a note')
    const folder = _.find(storage.folders, {key: params.folderKey}) || storage.folders[0]
    if (folder == null) this.showMessageBox('No folder to create a note')

    return {
      storage,
      folder
    }
  }

  showMessageBox (message) {
    dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'warning',
      message: message,
      buttons: ['OK']
    })
  }

  render () {
    const { config, style } = this.props
    return (
      <div className='NewNoteButton'
        styleName={config.isSideNavFolded ? 'root--expanded' : 'root'}
        style={style}
      >
        <div styleName='control'>
          <button styleName='control-newNoteButton'
            onClick={(e) => this.handleNewNoteButtonClick(e)}>
            <img styleName='iconTag' src='../resources/icon/icon-newnote.svg' />
            <span styleName='control-newNoteButton-tooltip'>
              {i18n.__('Make a note')} {OSX ? '⌘' : i18n.__('Ctrl')} + N
            </span>
          </button>
        </div>
      </div>
    )
  }
}

NewNoteButton.propTypes = {
  dispatch: PropTypes.func,
  config: PropTypes.shape({
    isSideNavFolded: PropTypes.bool
  })
}

export default CSSModules(NewNoteButton, styles)
