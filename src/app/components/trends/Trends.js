import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TrendingUp as TrendingUpIcon } from '@material-ui/icons';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';

export default function Trends({ routeParams }) {
  return (
    <Search
      searchUrlPrefix={`/${routeParams.team}/trends`}
      mediaUrlPrefix={`/${routeParams.team}/media`}
      title={<FormattedMessage id="trends.title" defaultMessage="Trends" />}
      icon={<TrendingUpIcon />}
      query={safelyParseJSON(routeParams.query, {})}
      teamSlug={routeParams.team}
      showExpand
    />
  );
}
Trends.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};
