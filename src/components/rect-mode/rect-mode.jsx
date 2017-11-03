import React from 'react';
import PropTypes from 'prop-types';
import ToolSelectComponent from '../tool-select-base/tool-select-base.jsx';

import rectIcon from './rectangle.svg';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
    rect: {
        defaultMessage: 'Rectangle',
        description: 'Label for the rectangle tool',
        id: 'paint.rectMode.rect'
    }
});

const RectModeComponent = props => (
    <ToolSelectComponent
        imgDescriptor={messages.rect}
        imgSrc={rectIcon}
        isSelected={props.isSelected}
        onMouseDown={props.onMouseDown}
    />
);

RectModeComponent.propTypes = {
    isSelected: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired
};

export default RectModeComponent;
