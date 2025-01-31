/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import styled from 'styled-components';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import { withPusher, pusherShape } from '../../pusher';
import SearchKeyword from './SearchKeyword';
import SearchFields from './SearchFields';
import Toolbar from './Toolbar';
import ParsedText from '../ParsedText';
import BulkActions from '../media/BulkActions';
import MediasLoading from '../media/MediasLoading';
import ProjectBlankState from '../project/ProjectBlankState';
import { black87, black54, headline, units, Row, textSecondary } from '../../styles/js/shared';
import SearchResultsTable from './SearchResultsTable';
import SearchRoute from '../../relay/SearchRoute';
import { pageSize } from '../../urlHelpers';

const StyledListHeader = styled.div`
  margin: ${units(2)};

  .search__list-header-filter-row {
    justify-content: space-between;
    display: flex;
    align-items: flex-start;
  }

  .project__title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 500px;
  }

  .project__description {
    max-width: 30%;
    padding-top: ${units(0.5)};
    height: ${units(4)};
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledSearchResultsWrapper = styled.div`
  .search__results-heading {
    color: ${black87};
    font-size: larger;
    font-weight: bolder;
    text-align: center;
    display: flex;
    align-items: center;

    .search__nav {
      padding: 0 ${units(1)};
      display: flex;
      cursor: pointer;
      color: ${black87};

      &:first-child {
        padding-left: 0;
      }
    }

    .search__button-disabled {
      color: ${black54};
      cursor: default;
    }
  }
`;

const Styles = theme => ({
  similarSwitch: {
    marginLeft: theme.spacing(0),
  },
  inactiveColor: {
    color: 'rgb(238, 238, 238)',
  },
});

/**
 * Delete `esoffset`, `timestamp`, and maybe `projects`, `project_group_id` and `channels` -- whenever
 * they can be inferred from the URL or defaults.
 *
 * This is useful for building simple-as-possible URLs.
 */
function simplifyQuery(query, project, projectGroup) {
  const ret = { ...query };
  delete ret.esoffset;
  delete ret.timestamp;
  if (
    ret.projects &&
    (ret.projects.length === 1 && project && ret.projects[0] === project.dbid)
  ) {
    delete ret.projects;
  }
  if (
    ret.project_group_id &&
    (ret.project_group_id.length === 1 && projectGroup && ret.project_group_id[0] === projectGroup.dbid)
  ) {
    delete ret.project_group_id;
  }
  if (ret.keyword && !ret.keyword.trim()) {
    delete ret.keyword;
  }
  if (/\/(tipline-inbox|imported-reports)+/.test(window.location.pathname)) {
    delete ret.channels;
  }
  return ret;
}

/* eslint jsx-a11y/click-events-have-key-events: 0 */
function SearchResultsComponent({
  pusher,
  clientSessionId,
  query: defaultQuery,
  search,
  project,
  projectGroup,
  feedTeam,
  searchUrlPrefix,
  mediaUrlPrefix,
  showExpand,
  relay,
  title,
  icon,
  listActions,
  listDescription,
  classes,
  page,
  resultType,
  hideFields,
  readOnlyFields,
  savedSearch,
  extra,
}) {
  const defaultViewMode = window.storage?.getValue('viewMode') || 'shorter'; // or "longer"
  let pusherChannel = null;
  const [selectedProjectMediaIds, setSelectedProjectMediaIds] = React.useState([]);
  const [query, setQuery] = React.useState(defaultQuery);
  const [showSimilar] = React.useState(Boolean(query.show_similar));
  const [viewMode, setViewMode] = React.useState(defaultViewMode);

  const handleChangeViewMode = (mode) => {
    setViewMode(mode);
    window.storage.set('viewMode', mode);
  };

  React.useEffect(() => {
    const projectId = project ? project.dbid : 0;
    relay.setVariables({ projectId });
  }, []); // run only once, on load

  const onUnselectAll = () => {
    setSelectedProjectMediaIds([]);
  };

  const getBeginIndex = () => parseInt(query.esoffset /* may be invalid */, 10) || 0;

  const getEndIndex = () => getBeginIndex() + search.medias.edges.length;

  const unsubscribe = () => {
    if (pusherChannel) {
      pusher.unsubscribe(pusherChannel);
      pusherChannel = null;
    }
  };

  const resubscribe = () => {
    if (pusherChannel !== search.pusher_channel) {
      unsubscribe();
    }

    if (search.pusher_channel) {
      const channel = search.pusher_channel;
      pusherChannel = channel;

      pusher.subscribe(channel).bind('bulk_update_end', 'Search', (data, run) => {
        if (run) {
          relay.forceFetch();
          return true;
        }
        return {
          id: `search-${channel}`,
          callback: relay.forceFetch,
        };
      });

      pusher.subscribe(channel).bind('media_updated', 'Search', (data, run) => {
        if (clientSessionId !== data.actor_session_id) {
          if (run) {
            relay.forceFetch();
            return true;
          }
          return {
            id: `search-${channel}`,
            callback: relay.forceFetch,
          };
        }
        return false;
      });
    }
  };

  const handleChangeSelectedIds = (newSelectedProjectMediaIds) => {
    setSelectedProjectMediaIds(newSelectedProjectMediaIds);
  };

  const navigateToQuery = (newQuery) => {
    const path = Object.keys(newQuery).length > 0
      ? `${searchUrlPrefix}/${encodeURIComponent(JSON.stringify(newQuery))}`
      : searchUrlPrefix;
    browserHistory.push(path);
  };

  const handleChangeSortParams = (sortParams) => {
    const newQuery = { ...query };
    if (sortParams === null) {
      delete newQuery.sort;
      delete newQuery.sort_type;
    } else {
      newQuery.sort = sortParams.key;
      newQuery.sort_type = sortParams.ascending ? 'ASC' : 'DESC';
    }
    const cleanQuery = simplifyQuery(newQuery, project, projectGroup);
    navigateToQuery(cleanQuery);
  };

  /*
  clear means that the user cleared the search after searching by keywords
  and no other sort filter is applied
  if other filter is applied, the new query should keep the previous sort parameter
  */
  const handleChangeQuery = (newQuery) => {
    const cleanQuery = simplifyQuery(newQuery, project, projectGroup);
    if (query.sort) {
      cleanQuery.sort = query.sort;
    }
    if (query.sort_type) {
      cleanQuery.sort_type = query.sort_type;
    }
    if (newQuery.sort === 'clear') {
      delete cleanQuery.sort;
      delete cleanQuery.sort_type;
    }
    navigateToQuery(cleanQuery);
  };

  const handleShowSimilarSwitch = () => {
    const newQuery = { ...query };
    newQuery.show_similar = !showSimilar;
    const cleanQuery = simplifyQuery(newQuery, project, projectGroup);
    navigateToQuery(cleanQuery);
  };

  const buildSearchUrlAtOffset = (offset) => {
    const cleanQuery = simplifyQuery(query, project, projectGroup);
    if (offset > 0) {
      cleanQuery.esoffset = offset;
    }

    if (Object.keys(cleanQuery).length > 0) {
      return `${searchUrlPrefix}/${encodeURIComponent(JSON.stringify(cleanQuery))}`;
    }
    return searchUrlPrefix;
  };

  const getNextPageLocation = () => {
    if (getEndIndex() >= search.number_of_results) {
      return null;
    }
    return buildSearchUrlAtOffset(getBeginIndex() + pageSize);
  };

  const getPreviousPageLocation = () => {
    if (getBeginIndex() <= 0) {
      return null;
    }
    return buildSearchUrlAtOffset(getBeginIndex() - pageSize);
  };

  const cleanupQuery = (oldQuery) => {
    const cleanQuery = { ...oldQuery };
    if (oldQuery.team_tasks) {
      cleanQuery.team_tasks = oldQuery.team_tasks.filter(tt => (
        tt.id && tt.response && tt.task_type
      ));
      if (!cleanQuery.team_tasks.length) {
        delete cleanQuery.team_tasks;
      }
    }
    if (oldQuery.range) {
      const datesObj =
        oldQuery.range.created_at ||
        oldQuery.range.updated_at ||
        oldQuery.range.media_published_at ||
        oldQuery.range.report_published_at || {};
      if ((!datesObj.start_time && !datesObj.end_time) && (datesObj.condition !== 'less_than')) {
        delete cleanQuery.range;
      }
      if (datesObj.condition === 'less_than' && datesObj.period === 0) {
        delete cleanQuery.range;
      }
    }
    Object.keys(oldQuery).forEach((key) => {
      if (Array.isArray(cleanQuery[key]) && (cleanQuery[key].length === 0)) {
        delete cleanQuery[key];
      }
    });
    return cleanQuery;
  };

  /*
  when clicking on the "clear search" button, we call the handleSubmit passing the newQuery.
  If does not have the newQuery param get the query from props
  */
  const handleSubmit = (e, newQuery) => {
    const cleanQuery = cleanupQuery(newQuery || query);
    handleChangeQuery(cleanQuery);
  };

  /**
   * Build a URL for the 'ProjectMedia' page.
   *
   * The URL will have a `listIndex` (so the ProjectMedia page can paginate). It
   * will also include `listPath` and `listQuery` ... _unless_ those parameters
   * are redundant. (For instance, if the query is
   * `{ timestamp, esoffset, projects: [projectId] }` then the result can be `{}`
   * because enough data is in `mediaUrlPrefix` to infer the properties.
   */
  const buildProjectMediaUrl = (projectMedia) => {
    if (!projectMedia.dbid) {
      return null;
    }

    const cleanQuery = simplifyQuery(query, project, projectGroup);
    const itemIndexInPage = search.medias.edges.findIndex(edge => edge.node === projectMedia);
    const listIndex = getBeginIndex() + itemIndexInPage;
    const urlParams = new URLSearchParams();
    if (searchUrlPrefix.match('(/trash|/tipline-inbox|/imported-fact-checks|/tipline-inbox|/suggested-matches|/spam|(/feed/[0-9]+/(shared|feed)))$')) {
      // Usually, `listPath` can be inferred from the route params. With `trash` it can't,
      // so we'll give it to the receiving page. (See <MediaPage>.)
      urlParams.set('listPath', searchUrlPrefix);
    }

    if (Object.keys(cleanQuery).length > 0) {
      urlParams.set('listQuery', JSON.stringify(cleanQuery));
    }
    urlParams.set('listIndex', String(listIndex));

    let urlPrefix = mediaUrlPrefix;
    // If it's not an absolute path, prepend the team slug
    if (!/^\//.test(urlPrefix) && projectMedia.team && projectMedia.team.slug) {
      urlPrefix = `/${projectMedia.team.slug}/${urlPrefix}`;
    }

    let result = `${urlPrefix}/${projectMedia.dbid}?${urlParams.toString()}`;
    if (resultType === 'feed') {
      result = `${mediaUrlPrefix}/cluster/${projectMedia.cluster?.dbid}?${urlParams.toString()}`;
    }

    return result;
  };

  React.useEffect(() => {
    resubscribe();

    return function cleanup() {
      unsubscribe();
    };
  });

  const projectMedias = search.medias
    ? search.medias.edges.map(({ node }) => node)
    : [];

  const count = search.number_of_results;
  const { team } = search;
  const isIdInSearchResults = wantedId => projectMedias.some(({ id }) => id === wantedId);
  const filteredSelectedProjectMediaIds = selectedProjectMediaIds.filter(isIdInSearchResults);

  const sortParams = query.sort ? {
    key: query.sort,
    ascending: query.sort_type !== 'DESC',
  } : {
    key: 'recent_added',
    ascending: false,
  };

  const selectedProjectMedia = [];

  projectMedias.forEach((pm) => {
    if (filteredSelectedProjectMediaIds.indexOf(pm.id) !== -1) {
      selectedProjectMedia.push(pm);
    }
  });

  let content = null;

  if (count === 0) {
    content = (
      <ProjectBlankState
        message={
          <FormattedMessage
            id="projectBlankState.blank"
            defaultMessage="There are no items here."
          />
        }
      />
    );
  } else {
    content = (
      <SearchResultsTable
        projectMedias={projectMedias}
        team={team}
        selectedIds={filteredSelectedProjectMediaIds}
        sortParams={sortParams}
        onChangeSelectedIds={handleChangeSelectedIds}
        onChangeSortParams={handleChangeSortParams}
        buildProjectMediaUrl={buildProjectMediaUrl}
        resultType={resultType}
        viewMode={viewMode}
        count={count}
      />
    );
  }

  return (
    <React.Fragment>
      <StyledListHeader>
        <Row className="search__list-header-filter-row">
          <div
            className="project__title"
            title={title?.props?.defaultMessage || title}
            style={{
              font: headline,
              color: textSecondary,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            { icon ? <Box display="flex" alignItems="center" mr={2}>{icon}</Box> : null }
            <span className="project__title-text">
              {title}
            </span>
            {listActions}
          </div>
          <SearchKeyword
            query={query}
            setQuery={setQuery}
            project={project}
            hideFields={hideFields}
            title={title}
            team={team}
            showExpand={showExpand}
            cleanupQuery={cleanupQuery}
            handleSubmit={handleSubmit}
          />
        </Row>
        <Row className="project__description">
          {listDescription && listDescription.trim().length ?
            <ParsedText text={listDescription} />
            : null}
        </Row>
      </StyledListHeader>
      { extra ? <Box mb={2} ml={2}>{extra(query)}</Box> : null }
      <Box m={2}>
        <SearchFields
          query={query}
          setQuery={setQuery}
          onChange={handleChangeQuery}
          project={project}
          projectGroup={projectGroup}
          feedTeam={feedTeam}
          savedSearch={savedSearch}
          hideFields={hideFields}
          readOnlyFields={readOnlyFields}
          title={title}
          team={team}
          page={page}
          handleSubmit={handleSubmit}
        />
      </Box>
      <StyledSearchResultsWrapper className="search__results results">
        <Toolbar
          resultType={resultType}
          team={team}
          viewMode={viewMode}
          onChangeViewMode={handleChangeViewMode}
          similarAction={team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled && page !== 'feed' ?
            <FormControlLabel
              classes={{ labelPlacementStart: classes.similarSwitch }}
              control={
                <Switch
                  className="search-show-similar__switch"
                  classes={{ colorSecondary: classes.inactiveColor }}
                  checked={showSimilar}
                  onClick={handleShowSimilarSwitch}
                  color="secondary"
                />
              }
              label={
                <FormattedMessage
                  id="search.showSimilar"
                  defaultMessage="Show matched media"
                  description="Allow user to show/hide secondary items"
                />
              }
              labelPlacement="end"
            />
            : null}
          actions={projectMedias.length && selectedProjectMedia.length ?
            <BulkActions
              team={team}
              page={page}
              project={project}
              selectedProjectMedia={selectedProjectMedia}
              selectedMedia={filteredSelectedProjectMediaIds}
              onUnselectAll={onUnselectAll}
            /> : null}
          title={count ?
            <span className="search__results-heading">
              <Tooltip title={
                <FormattedMessage id="search.previousPage" defaultMessage="Previous page" />
              }
              >
                {getPreviousPageLocation() ? (
                  <Link
                    className="search__previous-page search__nav"
                    to={getPreviousPageLocation()}
                  >
                    <PrevIcon />
                  </Link>
                ) : (
                  <span className="search__previous-page search__nav search__button-disabled">
                    <PrevIcon />
                  </span>
                )}
              </Tooltip>
              <span className="search__count">
                <FormattedMessage
                  id="searchResults.itemsCount"
                  defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
                  values={{
                    from: getBeginIndex() + 1,
                    to: getEndIndex(),
                    count,
                  }}
                />
                {filteredSelectedProjectMediaIds.length ?
                  <span>&nbsp;
                    <FormattedMessage
                      id="searchResults.withSelection"
                      defaultMessage="{selectedCount, plural, one {(# selected)} other {(# selected)}}"
                      description="Label for number of selected items"
                      values={{
                        selectedCount: filteredSelectedProjectMediaIds.length,
                      }}
                    />
                  </span> : null
                }
              </span>
              <Tooltip title={
                <FormattedMessage id="search.nextPage" defaultMessage="Next page" />
              }
              >
                {getNextPageLocation() ? (
                  <Link className="search__next-page search__nav" to={getNextPageLocation()}>
                    <NextIcon />
                  </Link>
                ) : (
                  <span className="search__next-page search__nav search__button-disabled">
                    <NextIcon />
                  </span>
                )}
              </Tooltip>
            </span> : null
          }
          project={project}
          page={page}
          search={search}
        />
        {content}
      </StyledSearchResultsWrapper>
    </React.Fragment>
  );
}

SearchResultsComponent.defaultProps = {
  project: null,
  projectGroup: null,
  showExpand: false,
  icon: null,
  listDescription: undefined,
  listActions: undefined,
  classes: {},
  page: undefined, // FIXME find a cleaner way to render Trash differently
  resultType: 'default',
  hideFields: [],
  readOnlyFields: [],
  savedSearch: null,
  feedTeam: null,
  extra: null,
};

SearchResultsComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  search: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    medias: PropTypes.shape({ edges: PropTypes.array.isRequired }).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    dbid: PropTypes.number.isRequired,
  }), // may be null
  projectGroup: PropTypes.shape({
    id: PropTypes.string.isRequired, // TODO fill in props
    dbid: PropTypes.number.isRequired,
  }), // may be null
  feedTeam: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filters: PropTypes.object,
    feedFilters: PropTypes.object,
  }), // may be null
  searchUrlPrefix: PropTypes.string.isRequired,
  mediaUrlPrefix: PropTypes.string.isRequired,
  showExpand: PropTypes.bool,
  relay: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired,
  icon: PropTypes.node,
  listActions: PropTypes.node, // or undefined
  listDescription: PropTypes.string, // or undefined
  classes: PropTypes.object,
  page: PropTypes.oneOf(['trash', 'collection', 'list', 'folder', 'feed']), // FIXME find a cleaner way to render Trash differently
  resultType: PropTypes.string, // 'default' or 'feed', for now
  hideFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  readOnlyFields: PropTypes.arrayOf(PropTypes.string.isRequired), // or undefined
  savedSearch: PropTypes.object, // or null
  extra: PropTypes.node, // or null
};

const SearchResultsContainer = Relay.createContainer(withStyles(Styles)(withPusher(SearchResultsComponent)), {
  initialVariables: {
    projectId: 0,
    pageSize,
  },
  fragments: {
    search: () => Relay.QL`
      fragment on CheckSearch {
        id,
        pusher_channel,
        team {
          ${BulkActions.getFragment('team')}
          ${SearchKeyword.getFragment('team')}
          ${SearchFields.getFragment('team')}
          id
          slug
          search_id,
          permissions,
          search { id, number_of_results },
          check_search_trash { id, number_of_results },
          check_search_spam { id, number_of_results },
          verification_statuses,
          list_columns,
          medias_count,
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
          },
          alegre_bot: team_bot_installation(bot_identifier: "alegre") {
            id
            alegre_settings
          }
        }
        medias(first: $pageSize) {
          edges {
            node {
              id
              dbid
              picture
              show_warning_cover
              title
              description
              is_read
              is_main
              is_secondary
              is_suggested
              is_confirmed
              report_status # Needed by BulkActionsStatus
              requests_count
              list_columns_values
              feed_columns_values
              last_seen
              source_id
              cluster {
                dbid
                size
                team_names
                fact_checked_by_team_names
                requests_count
                first_item_at
                last_item_at
              }
              project {
                dbid
                id
              }
              team {
                slug
                verification_statuses
              }
            }
          }
        },
        number_of_results
      }
    `,
  },
});

/**
 * Build JSON-stringified query string that replicates check-api's warts.
 *
 * TL;DR when given `{projects: [projectId]}` or `{}` as input, return an
 * equivalent query that looks like the one `check-api` assumes.
 *
 * A long explanation follows -- [adamhooper, 2020-05-22] it took me hours to
 * figure this out.
 *
 * A CheckSearch has an `id`, to mimic GraphQL: check-api is designed to
 * encourage the client to store a CheckSearch in its `Relay.Store` (even though
 * CheckSearch is not stored anywhere on the server).
 *
 * What happens when the client alters a list? Well, that should change the
 * search results ... so check-api's UpdateProjectMediaPayload includes
 * `check_search_project`, `check_search_team` and `check_search_trash` based
 * on **check-api's guesses** of what the client-side IDs are.
 *
 * Check-api can't know the client-side IDs. So it guesses that they look like
 * `b64('CheckSearch/{"parent":{"type":"project","id":32},"projects":[32]}`)`.
 * The ordering must be exact. Luckily, MRI Ruby (check-api server side) happens
 * to JSON-encode Hash literals in deterministic order; and so does ES2015.
 *
 * This solution could never handle filters or sorting. (The search ID is based
 * on *all* parameters -- including filters/sorts.) So this is quasi-GraphQL.
 * TODO design `team.project_medias` and `project.project_medias`, filterable
 * GraphQL Connections, and nix `CheckSearch` (and these IDs).
 *
 * One other spot for confusion is in the GraphQL property,
 * `CheckSearch.pusher_channel`. Avoid it, because it's null if there are sorts
 * or filters -- and if you're reading the `pusher_channel` you can correctly
 * determine the pusher channel, client-side.
 */
function encodeQueryToMimicTheWayCheckApiGeneratesIds(query, teamSlug) {
  const nKeys = Object.keys(query).length;
  if (nKeys === 0) {
    return `{"parent":{"type":"team","slug":${JSON.stringify(teamSlug)}}}`;
  }
  if (nKeys === 1 && query.projects && query.projects.length === 1) {
    // JSON.stringify is pedantic -- the ID is a Number to begin with
    const id = JSON.stringify(query.projects[0]);
    return `{"parent":{"type":"project","id":${id}},"projects":[${id}]}`;
  }
  // In all but these two cases, generate a separate query.
  return JSON.stringify(query);
}

export default function SearchResults({ query, teamSlug, ...props }) {
  const jsonEncodedQuery = encodeQueryToMimicTheWayCheckApiGeneratesIds(query, teamSlug);
  let projectId = 0;
  const { projects } = query;
  if (projects && projects.length === 1) {
    [projectId] = projects;
  }
  const route = React.useMemo(() => new SearchRoute({
    jsonEncodedQuery,
    projectId,
  }), [jsonEncodedQuery]);

  return (
    <Relay.RootContainer
      Component={SearchResultsContainer}
      route={route}
      forceFetch
      renderFetched={data => (
        <SearchResultsContainer {...props} query={query} search={data.search} />
      )}
      renderLoading={() => <MediasLoading />}
    />
  );
}

SearchResults.propTypes = {
  query: PropTypes.object.isRequired,
  teamSlug: PropTypes.string.isRequired,
  extra: PropTypes.node,
};

SearchResults.defaultProps = {
  extra: null,
};
