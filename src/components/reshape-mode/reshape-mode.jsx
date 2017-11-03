import React from 'react';
import PropTypes from 'prop-types';
import ToolSelectComponent from '../tool-select-base/tool-select-base.jsx';

import reshapeIcon from './reshape.svg';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
    reshape: {
        defaultMessage: 'Reshape',
        description: 'Label for the reshape tool, which allows changing the points in the lines of the vectors',
        id: 'paint.reshapeMode.reshape'
    }
});

const ReshapeModeComponent = props => (
    <ToolSelectComponent
        imgDescriptor={messages.reshape}
        imgSrc={reshapeIcon}
        isSelected={props.isSelected}
        onMouseDown={props.onMouseDown}
    />
);

ReshapeModeComponent.propTypes = {
    isSelected: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired
};

export default ReshapeModeComponent;
