import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';

import PaperCanvas from '../containers/paper-canvas.jsx';

import BrushMode from '../containers/brush-mode.jsx';
import EraserMode from '../containers/eraser-mode.jsx';
import ReshapeMode from '../containers/reshape-mode.jsx';
import SelectMode from '../containers/select-mode.jsx';
import LineMode from '../containers/line-mode.jsx';
import PenMode from '../containers/pen-mode.jsx';
import RectMode from '../containers/rect-mode.jsx';
import RoundedRectMode from '../containers/rounded-rect-mode.jsx';
import OvalMode from '../containers/oval-mode.jsx';

import FillColorIndicatorComponent from '../containers/fill-color-indicator.jsx';
import StrokeColorIndicatorComponent from '../containers/stroke-color-indicator.jsx';
import StrokeWidthIndicatorComponent from '../containers/stroke-width-indicator.jsx';

import {FormattedMessage, defineMessages, injectIntl, intlShape} from 'react-intl';
import BufferedInputHOC from './forms/buffered-input-hoc.jsx';
import Label from './forms/label.jsx';
import Input from './forms/input.jsx';

import styles from './paint-editor.css';

const BufferedInput = BufferedInputHOC(Input);
const messages = defineMessages({
    costume: {
        id: 'paint.paintEditor.costume',
        description: 'Label for the name of a sound',
        defaultMessage: 'Costume'
    },
    undo: {
        id: 'paint.paintEditor.undo',
        description: 'Label for undo',
        defaultMessage: 'Undo'
    },
    redo: {
        id: 'paint.paintEditor.redo',
        description: 'Label for redo',
        defaultMessage: 'Redo'
    },
    front: {
        id: 'paint.paintEditor.front',
        description: 'Label for front',
        defaultMessage: 'Front'
    },
    back: {
        id: 'paint.paintEditor.back',
        description: 'Label for back',
        defaultMessage: 'Back'
    },
    group: {
        id: 'paint.paintEditor.group',
        description: 'Label for group',
        defaultMessage: 'Group'
    },
    ungroup: {
        id: 'paint.paintEditor.ungroup',
        description: 'Label for ungroup',
        defaultMessage: 'Ungroup'
    },
    modeTools: {
        id: 'paint.paintEditor.modeTools',
        description: 'Label for modeTools',
        defaultMessage: 'Mode Tools'
    },
});

class PaintEditorComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setCanvas'
        ]);
        this.state = {};
    }
    setCanvas (canvas) {
        this.setState({canvas: canvas});
    }
    render () {
        return (
            <div className={styles.editorContainer}>
                {/* First row */}
                <div className={styles.row}>
                    {/* Name field */}
                    <div className={styles.inputGroup}>
                        <Label text={this.props.intl.formatMessage(messages.costume)}>
                            <BufferedInput
                                type="text"
                                value="meow"
                            />
                        </Label>
                    </div>

                    {/* Undo/Redo */}
                    <div className={styles.inputGroup}>
                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.button}
                                onClick={this.props.onUndo}
                            >
                                {/* Undo */}
                                <FormattedMessage {...messages.undo} />
                            </button>
                            <button
                                className={styles.button}
                                onClick={this.props.onRedo}
                            >
                                {/* Rego */}
                                <FormattedMessage {...messages.redo} />
                            </button>
                        </div>
                    </div>

                    {/* To be Front/back */}
                    <div className={styles.inputGroup}>
                        <button
                            className={styles.button}
                        >
                            {/* Front */}
                            <FormattedMessage {...messages.front} />
                        </button>
                        <button
                            className={styles.button}
                        >
                            {/* Back */}
                            <FormattedMessage {...messages.back} />
                        </button>
                    </div>

                    {/* To be Group/Ungroup */}
                    <div className={styles.inputGroup}>
                        <button
                            className={styles.button}
                        >
                            {/* Group */}
                            <FormattedMessage {...messages.group} />
                        </button>
                        <button
                            className={styles.button}
                        >
                            {/* Ungroup */}
                            <FormattedMessage {...messages.ungroup} />
                        </button>
                    </div>
                </div>

                {/* Second Row */}
                <div className={styles.row}>
                    {/* fill */}
                    <FillColorIndicatorComponent
                        onUpdateSvg={this.props.onUpdateSvg}
                    />
                    {/* stroke */}
                    <StrokeColorIndicatorComponent
                        onUpdateSvg={this.props.onUpdateSvg}
                    />
                    {/* stroke width */}
                    <StrokeWidthIndicatorComponent
                        onUpdateSvg={this.props.onUpdateSvg}
                    />

                    <div className={styles.inputGroup}>
                        {/* Mode tools */}
                        <FormattedMessage {...messages.modeTools} />
                    </div>
                </div>

                <div className={styles.topAlignRow}>
                    {/* Modes */}
                    {this.state.canvas ? (
                        <div className={styles.modeSelector}>
                            <BrushMode
                                canvas={this.state.canvas}
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <EraserMode
                                canvas={this.state.canvas}
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <PenMode
                                canvas={this.state.canvas}
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <LineMode
                                canvas={this.state.canvas}
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <SelectMode
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <ReshapeMode
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <OvalMode
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <RectMode
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                            <RoundedRectMode
                                onUpdateSvg={this.props.onUpdateSvg}
                            />
                        </div>
                    ) : null}

                    {/* Canvas */}
                    <div className={styles.canvasContainer}>
                        <PaperCanvas
                            canvasRef={this.setCanvas}
                            rotationCenterX={this.props.rotationCenterX}
                            rotationCenterY={this.props.rotationCenterY}
                            svg={this.props.svg}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

PaintEditorComponent.propTypes = {
    intl: intlShape,
    onRedo: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onUpdateSvg: PropTypes.func.isRequired,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    svg: PropTypes.string
};

export default injectIntl(PaintEditorComponent);
