import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DescriptionIcon from '@material-ui/icons/Description';
import FolderIcon from '@material-ui/icons/Folder';
import RuleIcon from '@material-ui/icons//Rule';
import LabelIcon from '@material-ui/icons/Label';
import LanguageIcon from '@material-ui/icons/Language';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PersonIcon from '@material-ui/icons/Person';
import NoteAltOutlinedIcon from '@material-ui/icons/NoteAltOutlined';
import ReportIcon from '@material-ui/icons/PlaylistAddCheck';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import ForwardIcon from '@material-ui/icons/Forward';
import ErrorIcon from '@material-ui/icons/Error';
import MarkunreadIcon from '@material-ui/icons/Markunread';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import CorporateFareIcon from '@material-ui/icons/CorporateFare';
import NumberIcon from '../../icons/NumberIcon';

const StyledButton = withStyles({
  root: {
    height: '36px',
  },
})(Button);

const AddFilterMenu = ({
  team,
  addedFields,
  hideOptions,
  showOptions,
  onSelect,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSelect = (field) => {
    setAnchorEl(null);
    onSelect(field);
  };

  let options = [{
    id: 'add-filter-menu__folder',
    key: 'projects',
    icon: <FolderIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.folder"
        defaultMessage="Folder"
        description="Menu option to enable searching items by folder"
      />
    ),
  },
  {
    id: 'add-filter-menu__claim',
    key: 'has_claim',
    icon: <RuleIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.claim"
        defaultMessage="Claim"
        description="Menu option to enable searching items by claim"
      />
    ),
  },
  {
    id: 'add-filter-menu__project-group-id',
    key: 'project_group_id',
    icon: <FolderSpecialIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.collection"
        defaultMessage="Collection"
        description="Menu option to enable searching items by collection"
      />
    ),
  },
  {
    id: 'add-filter-menu__time-range',
    key: 'range',
    icon: <DateRangeIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.timeRange"
        defaultMessage="Date range"
        description="Menu option to enable searching items by date range"
      />
    ),
  },
  {
    id: 'add-filter-menu__tags',
    key: 'tags',
    icon: <LocalOfferIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.tag"
        defaultMessage="Tag"
        description="Menu option to enable searching items by tags"
      />
    ),
  },
  {
    id: 'add-filter-menu__media-type',
    key: 'show',
    icon: <DescriptionIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.mediaType"
        defaultMessage="Media type"
        description="Menu option to enable searching items by media type"
      />
    ),
  },
  {
    id: 'add-filter-menu__read',
    key: 'read',
    icon: <MarkunreadIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.itemRead"
        defaultMessage="Item read/unread"
        description="Menu option to enable searching items by item read/unread"
      />
    ),
  },
  {
    id: 'add-filter-menu__status',
    key: 'verification_status',
    icon: <LabelIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.itemStatus"
        defaultMessage="Item status"
        description="Menu option to enable searching items by item status"
      />
    ),
  },
  {
    id: 'add-filter-menu__report-status',
    key: 'report_status',
    icon: <ReportIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.reportStatus"
        defaultMessage="Report status"
        description="Menu option to enable searching items by report status"
      />
    ),
  },
  {
    id: 'add-filter-menu__published-by',
    key: 'published_by',
    icon: <HowToRegIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.publishedBy"
        defaultMessage="Published by"
        description="Menu option to enable searching items by report published by"
      />
    ),
  },
  {
    id: 'add-filter-menu__annotated-by',
    key: 'annotated_by',
    icon: <PersonIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.annotatedBy"
        defaultMessage="Annotated by"
        description="Menu option to enable searching items by annotated by"
      />
    ),
  },
  {
    id: 'add-filter-menu__created-by',
    key: 'users',
    icon: <PersonIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.createdBy"
        defaultMessage="Created by"
        description="Menu option to enable searching items by author"
      />
    ),
  },
  {
    id: 'add-filter-menu__channel',
    key: 'channels',
    icon: <ForwardIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.channel"
        defaultMessage="Channel"
        description="Menu option to enable searching items by channel"
      />
    ),
  },
  {
    id: 'add-filter-menu__tipline-request',
    key: 'archived',
    icon: <ErrorIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.tiplineRequest"
        defaultMessage="Tipline request"
        description="Menu option to enable searching items by confirmed/unconfirmed items"
      />
    ),
  },
  {
    id: 'add-filter-menu__similar-medias',
    key: 'linked_items_count',
    icon: <NumberIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.similarMedias"
        defaultMessage="Number of matched media"
        description="Menu option to enable searching items by matched medias"
      />
    ),
  },
  ];
  if (team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) {
    options.push({
      id: 'add-filter-menu__suggested-medias',
      key: 'suggestions_count',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.suggestedMedias"
          defaultMessage="Number of suggested media"
          description="Menu option to enable searching items by suggested medias"
        />
      ),
    });
  }
  options.push({
    id: 'add-filter-menu__tipline-requests',
    key: 'demand',
    icon: <NumberIcon />,
    label: (
      <FormattedMessage
        id="addFilterMenu.tiplineRequests"
        defaultMessage="Number of requests"
        description="Menu option to enable searching items by tipline requests"
      />
    ),
  });
  options = options.concat([
    {
      id: 'add-filter-menu__language',
      key: 'language',
      icon: <LanguageIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.language"
          defaultMessage="Language"
          description="Menu option to enable searching items by language"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-assigned-to',
      key: 'assigned_to',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.assignedTo"
          defaultMessage="Assignment"
          description="Menu option to enable searching items by assigned users"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-source',
      key: 'sources',
      icon: <SettingsInputAntennaIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.source"
          defaultMessage="Source"
          description="Menu option to enable searching items by source"
        />
      ),
    },
    {
      id: 'add-filter-menu__team-tasks',
      key: 'team_tasks',
      icon: <NoteAltOutlinedIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.annotation"
          defaultMessage="Annotation"
          description="Menu option to enable searching items by annotation fields"
        />
      ),
    },
    {
      id: 'add-filter-menu__workspace',
      key: 'cluster_teams',
      icon: <CorporateFareIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.Workspace"
          defaultMessage="Organization"
          description="Menu option to enable searching items by workspace"
        />
      ),
    },
    {
      id: 'add-filter-menu__cluster-published-reports',
      key: 'cluster_published_reports',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.publishedBy"
          defaultMessage="Published by"
          description="Menu option to enable searching items by report published by"
        />
      ),
    },
    {
      id: 'add-filter-menu__feed-fact-checked-by',
      key: 'feed_fact_checked_by',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.feedFactCheckedBy"
          defaultMessage="Fact-checked by"
          description="Menu option to enable searching feed items by whether they were fact-checked"
        />
      ),
    },
  ]);

  return (
    <React.Fragment>
      <StyledButton
        id="add-filter-menu__open-button"
        startIcon={<AddIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        size="small"
      >
        <FormattedMessage
          id="addFilterMenu.addFilter"
          defaultMessage="Add filter"
          description="Button that opens menu with filter field options"
        />
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <FormattedMessage
            id="addFilterMenu.filterBy"
            defaultMessage="Filter by"
            description="Header to menu of filter field types"
          />
        </MenuItem>
        { options.map(o => (hideOptions.includes(o.key) || (showOptions.length > 0 && !showOptions.includes(o.key))) ? null : (
          <MenuItem
            id={o.id}
            key={o.key}
            onClick={() => handleSelect(o.key)}
            disabled={addedFields.includes(o.key)}
          >
            <ListItemIcon>
              {o.icon}
            </ListItemIcon>
            {o.label}
          </MenuItem>
        )) }
      </Menu>
    </React.Fragment>
  );
};

AddFilterMenu.defaultProps = {
  addedFields: [],
  hideOptions: [],
  showOptions: [],
  team: {},
};

AddFilterMenu.propTypes = {
  addedFields: PropTypes.arrayOf(PropTypes.string),
  hideOptions: PropTypes.arrayOf(PropTypes.string),
  showOptions: PropTypes.arrayOf(PropTypes.string),
  team: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
};

export default AddFilterMenu;
