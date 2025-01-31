import React from 'react';
import Card from '@material-ui/core/Card';
import styled from 'styled-components';
import MediaExpanded from './MediaExpanded';

import {
  brandSecondary,
} from '../../styles/js/shared';

const StyledMainCard = styled.div`
  .media-detail {
    box-shadow: none;
    border: 1px solid ${brandSecondary};
    border-radius: 8px;
  }
`;

class MediaDetail extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const {
      annotated,
      annotatedType,
      end,
      gaps,
      media,
      onPlayerReady,
      playerRef,
      playing,
      scrubTo,
      seekTo,
      setPlayerState,
      start,
    } = this.props;

    // Build the item URL

    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    let projectId = media.project_id;
    if (/project\/([0-9]+)/.test(path)) {
      projectId = path.match(/project\/([0-9]+)/).pop();
    }
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    let mediaUrl = projectId && media.team && media.dbid > 0
      ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
      : null;
    if (!mediaUrl && media.team && media.dbid > 0) {
      mediaUrl = `/${media.team.slug}/media/${media.dbid}`;
    }

    return (
      <StyledMainCard>
        <Card className="card media-detail">
          <MediaExpanded
            media={this.props.media}
            mediaUrl={mediaUrl}
            {...{
              end,
              gaps,
              onPlayerReady,
              playerRef,
              playing,
              scrubTo,
              seekTo,
              setPlayerState,
              start,
            }}
          />
        </Card>
      </StyledMainCard>
    );
  }
}

export default MediaDetail;
