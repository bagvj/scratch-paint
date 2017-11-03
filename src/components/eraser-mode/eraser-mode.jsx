import React from 'react';
import PropTypes from 'prop-types';
import ToolSelectComponent from '../tool-select-base/tool-select-base.jsx';

import eraserIcon from './eraser.svg';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
    eraser: {
        defaultMessage: 'Eraser',
        description: 'Label for the eraser tool',
        id: 'paint.eraserMode.eraser'
    }
});

const EraserModeComponent = props => (
    <ToolSelectComponent
        imgDescriptor={messages.eraser}
        imgSrc={eraserIcon}
        isSelected={props.isSelected}
        onMouseDown={props.onMouseDown}
    />
);

EraserModeComponent.propTypes = {
    isSelected: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired
};

export default EraserModeComponent;
