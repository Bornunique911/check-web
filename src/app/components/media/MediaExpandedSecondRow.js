/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import MediaTypeDisplayName from './MediaTypeDisplayName';
import { parseStringUnixTimestamp } from '../../helpers';
import TimeBefore from '../TimeBefore';
import {
  units,
  Row,
} from '../../styles/js/shared';

const StyledHeaderTextSecondary = styled.div`
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 400;
  white-space: nowrap;
  margin-bottom: ${units(2)};
`;

const MediaExpandedSecondRow = ({ projectMedia }) => (
  <div>
    <StyledHeaderTextSecondary>
      <Row flexWrap style={{ fontWeight: '500' }}>
        <span><MediaTypeDisplayName mediaType={projectMedia.media.type} /></span>
        <span style={{ margin: `0 ${units(1)}` }}> - </span>
        <span>
          <FormattedMessage
            id="mediaExpanded.firstSeen"
            defaultMessage="First submitted: "
            description="Header for the date when the Check item (aka media) was first received (added to) by the workspace"
          />
          <TimeBefore date={parseStringUnixTimestamp(projectMedia.created_at)} />
        </span>
        { projectMedia.team.smooch_bot ?
          <span>
            <span style={{ margin: `0 ${units(1)}` }}> - </span>
            <span>
              <FormattedMessage
                id="mediaExpanded.lastSeen"
                defaultMessage="Last submitted: "
                description="Header for the date when the Check item (aka media) was last received by the the workspace"
              />
              <TimeBefore date={parseStringUnixTimestamp(projectMedia.last_seen)} />
            </span>
            <span style={{ margin: `0 ${units(1)}` }}> - </span>
            <span>
              <FormattedMessage
                id="mediaExpanded.requests"
                defaultMessage="{count, plural, one {# request} other {# requests}}"
                values={{
                  count: projectMedia.requests_count,
                }}
              />
            </span>
          </span> : null }
      </Row>
    </StyledHeaderTextSecondary>
  </div>
);

MediaExpandedSecondRow.propTypes = {
  projectMedia: PropTypes.shape({
    team: PropTypes.shape({
      smooch_bot: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    media: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }),
    created_at: PropTypes.string.isRequired,
    last_seen: PropTypes.string.isRequired,
    requests_count: PropTypes.number.isRequired,
  }).isRequired,
};

export default MediaExpandedSecondRow;
