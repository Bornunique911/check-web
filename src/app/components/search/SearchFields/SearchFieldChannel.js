import React from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import ForwardIcon from '@material-ui/icons/Forward';
import MultiSelectFilter from '../MultiSelectFilter';
import CheckChannels from '../../../CheckChannels';

const messages = defineMessages({
  manual: {
    id: 'searchFieldChannel.manual',
    defaultMessage: 'Manual',
    description: 'Filter option that refers to items created manually',
  },
  browserExtension: {
    id: 'searchFieldChannel.browserExtension',
    defaultMessage: 'Browser extension',
    description: 'Filter option that refers to items created via the browser extension',
  },
  api: {
    id: 'searchFieldChannel.api',
    defaultMessage: 'API',
    description: 'Filter option that refers to items created via the API',
  },
  anyTipline: {
    id: 'searchFieldChannel.anyTipline',
    defaultMessage: 'Any tipline',
    description: 'Filter option that refers to items created via a tipline',
  },
  webForm: {
    id: 'searchFieldChannel.webForm',
    defaultMessage: 'Web Form',
    description: 'Filter option that refers to items created via a web form',
  },
  sharedDatabase: {
    id: 'searchFieldChannel.sharedFeed',
    defaultMessage: 'Shared Feed',
    description: 'Filter option that refers to items created from the shared feed.',
  },
});

const SearchFieldChannelComponent = ({
  query,
  onChange,
  onRemove,
  about,
  readOnly,
  intl,
}) => {
  const { channels } = about;

  const optionLabels = {
    MANUAL: intl.formatMessage(messages.manual),
    FETCH: 'Fetch',
    BROWSER_EXTENSION: intl.formatMessage(messages.browserExtension),
    API: intl.formatMessage(messages.api),
    ZAPIER: 'Zapier',
    WHATSAPP: 'WhatsApp',
    MESSENGER: 'Messenger',
    TWITTER: 'Twitter',
    TELEGRAM: 'Telegram',
    VIBER: 'Viber',
    LINE: 'Line',
    WEB_FORM: intl.formatMessage(messages.webForm),
    SHARED_DATABASE: intl.formatMessage(messages.sharedDatabase),
  };

  let options = Object.keys(channels).filter(key => key !== 'TIPLINE').map(key => ({ label: optionLabels[key], value: `${channels[key]}` }));

  options = options.concat([
    { label: intl.formatMessage(messages.anyTipline), value: 'any_tipline', hasChildren: true },
  ]);

  const tiplines = Object.keys(channels.TIPLINE).map(key => ({ label: optionLabels[key], value: `${channels.TIPLINE[key]}`, parent: 'any_tipline' }));
  options = options.concat(tiplines);

  const handleChange = (channelIds) => {
    let channelIdsWithoutChildren = [...channelIds];
    if (channelIds.includes('any_tipline')) {
      const tiplineIds = tiplines.map(t => t.value);
      channelIdsWithoutChildren = channelIds.filter(channelId => !tiplineIds.includes(channelId));
    }
    onChange(channelIdsWithoutChildren);
  };

  let selectedChannels = [];
  if (/tipline-inbox/.test(window.location.pathname)) {
    selectedChannels = [CheckChannels.ANYTIPLINE];
  }
  if (/imported-fact-checks/.test(window.location.pathname)) {
    selectedChannels = [CheckChannels.FETCH];
  }

  return (
    <FormattedMessage id="SearchFieldChannel.label" defaultMessage="Channel is" description="Prefix label for field to filter by item channel">
      { label => (
        <MultiSelectFilter
          label={label}
          icon={<ForwardIcon />}
          selected={query.channels || selectedChannels}
          options={options}
          onChange={handleChange}
          onRemove={onRemove}
          readOnly={readOnly}
        />
      )}
    </FormattedMessage>
  );
};

const SearchFieldChannel = parentProps => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldChannelQuery {
        about {
          channels
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return (<SearchFieldChannelComponent {...parentProps} {...props} />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return <CircularProgress size={36} />;
    }}
  />
);

SearchFieldChannel.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default injectIntl(SearchFieldChannel);
