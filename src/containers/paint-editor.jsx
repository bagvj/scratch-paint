import paper from '@scratch/paper';
import PropTypes from 'prop-types';
import React from 'react';
import PaintEditorComponent from '../components/paint-editor/paint-editor.jsx';

import {changeMode} from '../reducers/modes';
import {undo, redo, undoSnapshot} from '../reducers/undo';
import {clearSelectedItems, setSelectedItems} from '../reducers/selected-items';
import {deactivateEyeDropper} from '../reducers/eye-dropper';
import {setTextEditTarget} from '../reducers/text-edit-target';
import {updateViewBounds} from '../reducers/view-bounds';

import {hideGuideLayers, showGuideLayers} from '../helper/layer';
import {performUndo, performRedo, performSnapshot, shouldShowUndo, shouldShowRedo} from '../helper/undo';
import {bringToFront, sendBackward, sendToBack, bringForward} from '../helper/order';
import {groupSelection, ungroupSelection} from '../helper/group';
import {getSelectedLeafItems} from '../helper/selection';
import {resetZoom, zoomOnSelection} from '../helper/view';
import EyeDropperTool from '../helper/tools/eye-dropper';

import Modes from '../lib/modes';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

class PaintEditor extends React.Component {
    static get ZOOM_INCREMENT () {
        return 0.5;
    }
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUpdateSvg',
            'handleUndo',
            'handleRedo',
            'handleSendBackward',
            'handleSendForward',
            'handleSendToBack',
            'handleSendToFront',
            'handleGroup',
            'handleUngroup',
            'handleZoomIn',
            'handleZoomOut',
            'handleZoomReset',
            'canRedo',
            'canUndo',
            'onMouseDown',
            'setCanvas',
            'setTextArea',
            'startEyeDroppingLoop',
            'stopEyeDroppingLoop'
        ]);
        this.state = {
            canvas: null,
            colorInfo: null
        };
    }
    componentDidMount () {
        document.addEventListener('keydown', event => {
            // Don't activate keyboard shortcuts during text editing
            if (!this.props.textEditing) {
                this.props.onKeyPress(event);
            }
        });
        // document listeners used to detect if a mouse is down outside of the
        // canvas, and should therefore stop the eye dropper
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('touchstart', this.onMouseDown);
    }
    componentDidUpdate (prevProps) {
        if (this.props.isEyeDropping && !prevProps.isEyeDropping) {
            this.startEyeDroppingLoop();
        } else if (!this.props.isEyeDropping && prevProps.isEyeDropping) {
            this.stopEyeDroppingLoop();
        }
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.props.onKeyPress);
        this.stopEyeDroppingLoop();
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('touchstart', this.onMouseDown);
    }
    handleUpdateSvg (skipSnapshot) {
        // Store the zoom/pan and restore it after snapshotting
        // TODO Only doing this because snapshotting at zoom/pan makes export wrong
        const oldZoom = paper.project.view.zoom;
        const oldCenter = paper.project.view.center.clone();
        resetZoom();

        const guideLayers = hideGuideLayers();

        const bounds = paper.project.activeLayer.bounds;
        this.props.onUpdateSvg(
            paper.project.exportSVG({
                asString: true,
                bounds: 'content',
                matrix: new paper.Matrix().translate(-bounds.x, -bounds.y)
            }),
            paper.project.view.center.x - bounds.x,
            paper.project.view.center.y - bounds.y);

        showGuideLayers(guideLayers);

        if (!skipSnapshot) {
            performSnapshot(this.props.undoSnapshot);
        }

        // Restore old zoom
        paper.project.view.zoom = oldZoom;
        paper.project.view.center = oldCenter;
    }
    handleUndo () {
        performUndo(this.props.undoState, this.props.onUndo, this.props.setSelectedItems, this.handleUpdateSvg);
    }
    handleRedo () {
        performRedo(this.props.undoState, this.props.onRedo, this.props.setSelectedItems, this.handleUpdateSvg);
    }
    handleGroup () {
        groupSelection(this.props.clearSelectedItems, this.props.setSelectedItems, this.handleUpdateSvg);
    }
    handleUngroup () {
        ungroupSelection(this.props.clearSelectedItems, this.props.setSelectedItems, this.handleUpdateSvg);
    }
    handleSendBackward () {
        sendBackward(this.handleUpdateSvg);
    }
    handleSendForward () {
        bringForward(this.handleUpdateSvg);
    }
    handleSendToBack () {
        sendToBack(this.handleUpdateSvg);
    }
    handleSendToFront () {
        bringToFront(this.handleUpdateSvg);
    }
    canUndo () {
        return shouldShowUndo(this.props.undoState);
    }
    canRedo () {
        return shouldShowRedo(this.props.undoState);
    }
    handleZoomIn () {
        zoomOnSelection(PaintEditor.ZOOM_INCREMENT);
        this.props.updateViewBounds(paper.view.matrix);
    }
    handleZoomOut () {
        zoomOnSelection(-PaintEditor.ZOOM_INCREMENT);
        this.props.updateViewBounds(paper.view.matrix);
    }
    handleZoomReset () {
        resetZoom();
        this.props.updateViewBounds(paper.view.matrix);
    }
    setCanvas (canvas) {
        this.setState({canvas: canvas});
        this.canvas = canvas;
    }
    setTextArea (element) {
        this.setState({textArea: element});
    }
    onMouseDown (event) {
        if (event.target === paper.view.element &&
                document.activeElement instanceof HTMLInputElement) {
            document.activeElement.blur();
        }

        if (event.target !== paper.view.element && event.target !== this.state.textArea) {
            // Exit text edit mode if you click anywhere outside of canvas
            this.props.removeTextEditTarget();
        }

        if (this.props.isEyeDropping) {
            const colorString = this.eyeDropper.colorString;
            const callback = this.props.changeColorToEyeDropper;

            this.eyeDropper.remove();
            if (!this.eyeDropper.hideLoupe) {
                // If not hide loupe, that means the click is inside the canvas,
                // so apply the new color
                callback(colorString);
            }
            this.props.previousTool.activate();
            this.props.onDeactivateEyeDropper();
            this.stopEyeDroppingLoop();
            this.setState({colorInfo: null});
        }
    }
    startEyeDroppingLoop () {
        this.eyeDropper = new EyeDropperTool(
            this.canvas,
            paper.project.view.bounds.width,
            paper.project.view.bounds.height,
            paper.project.view.pixelRatio,
            paper.view.zoom,
            paper.project.view.bounds.x,
            paper.project.view.bounds.y
        );
        this.eyeDropper.pickX = -1;
        this.eyeDropper.pickY = -1;
        this.eyeDropper.activate();
        
        this.intervalId = setInterval(() => {
            const colorInfo = this.eyeDropper.getColorInfo(
                this.eyeDropper.pickX,
                this.eyeDropper.pickY,
                this.eyeDropper.hideLoupe
            );
            if (!colorInfo) return;
            if (
                this.state.colorInfo === null ||
                this.state.colorInfo.x !== colorInfo.x ||
                this.state.colorInfo.y !== colorInfo.y
            ) {
                this.setState({
                    colorInfo: colorInfo
                });
            }
        }, 30);
    }
    stopEyeDroppingLoop () {
        clearInterval(this.intervalId);
    }
    render () {
        return (
            <PaintEditorComponent
                canRedo={this.canRedo}
                canUndo={this.canUndo}
                canvas={this.state.canvas}
                colorInfo={this.state.colorInfo}
                isEyeDropping={this.props.isEyeDropping}
                name={this.props.name}
                rotationCenterX={this.props.rotationCenterX}
                rotationCenterY={this.props.rotationCenterY}
                setCanvas={this.setCanvas}
                setTextArea={this.setTextArea}
                svg={this.props.svg}
                svgId={this.props.svgId}
                textArea={this.state.textArea}
                onGroup={this.handleGroup}
                onRedo={this.handleRedo}
                onSendBackward={this.handleSendBackward}
                onSendForward={this.handleSendForward}
                onSendToBack={this.handleSendToBack}
                onSendToFront={this.handleSendToFront}
                onUndo={this.handleUndo}
                onUngroup={this.handleUngroup}
                onUpdateName={this.props.onUpdateName}
                onUpdateSvg={this.handleUpdateSvg}
                onZoomIn={this.handleZoomIn}
                onZoomOut={this.handleZoomOut}
                onZoomReset={this.handleZoomReset}
            />
        );
    }
}

PaintEditor.propTypes = {
    changeColorToEyeDropper: PropTypes.func,
    clearSelectedItems: PropTypes.func.isRequired,
    isEyeDropping: PropTypes.bool,
    name: PropTypes.string,
    onDeactivateEyeDropper: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onUpdateName: PropTypes.func.isRequired,
    onUpdateSvg: PropTypes.func.isRequired,
    previousTool: PropTypes.shape({ // paper.Tool
        activate: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired
    }),
    removeTextEditTarget: PropTypes.func.isRequired,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    setSelectedItems: PropTypes.func.isRequired,
    svg: PropTypes.string,
    svgId: PropTypes.string,
    textEditing: PropTypes.bool.isRequired,
    undoSnapshot: PropTypes.func.isRequired,
    undoState: PropTypes.shape({
        stack: PropTypes.arrayOf(PropTypes.object).isRequired,
        pointer: PropTypes.number.isRequired
    }),
    updateViewBounds: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    changeColorToEyeDropper: state.scratchPaint.color.eyeDropper.callback,
    clipboardItems: state.scratchPaint.clipboard.items,
    isEyeDropping: state.scratchPaint.color.eyeDropper.active,
    pasteOffset: state.scratchPaint.clipboard.pasteOffset,
    previousTool: state.scratchPaint.color.eyeDropper.previousTool,
    selectedItems: state.scratchPaint.selectedItems,
    textEditing: state.scratchPaint.textEditTarget !== null,
    undoState: state.scratchPaint.undo
});
const mapDispatchToProps = dispatch => ({
    onKeyPress: event => {
        if (event.key === 'e') {
            dispatch(changeMode(Modes.ERASER));
        } else if (event.key === 'b') {
            dispatch(changeMode(Modes.BRUSH));
        } else if (event.key === 'l') {
            dispatch(changeMode(Modes.LINE));
        } else if (event.key === 's') {
            dispatch(changeMode(Modes.SELECT));
        } else if (event.key === 'w') {
            dispatch(changeMode(Modes.RESHAPE));
        } else if (event.key === 'f') {
            dispatch(changeMode(Modes.FILL));
        } else if (event.key === 't') {
            dispatch(changeMode(Modes.TEXT));
        } else if (event.key === 'c') {
            dispatch(changeMode(Modes.OVAL));
        } else if (event.key === 'r') {
            dispatch(changeMode(Modes.RECT));
        }
    },
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    removeTextEditTarget: () => {
        dispatch(setTextEditTarget());
    },
    setSelectedItems: () => {
        dispatch(setSelectedItems(getSelectedLeafItems()));
    },
    onDeactivateEyeDropper: () => {
        // set redux values to default for eye dropper reducer
        dispatch(deactivateEyeDropper());
    },
    onUndo: () => {
        dispatch(undo());
    },
    onRedo: () => {
        dispatch(redo());
    },
    undoSnapshot: snapshot => {
        dispatch(undoSnapshot(snapshot));
    },
    updateViewBounds: matrix => {
        dispatch(updateViewBounds(matrix));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaintEditor);
