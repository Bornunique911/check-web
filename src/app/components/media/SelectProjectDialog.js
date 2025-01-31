/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const messages = defineMessages({
  notInAnyCollection: {
    id: 'destinationProjects.none',
    defaultMessage: 'Not in any collection',
    description: 'Label used for folders that are not in any collection',
  },
  noFolders: {
    id: 'destinationProjects.empty',
    defaultMessage: 'No folders in this collection',
  },
});

function SelectProjectDialog({
  intl,
  open,
  team,
  excludeProjectDbids,
  title,
  extraContent,
  cancelLabel,
  submitLabel,
  submitButtonClassName,
  onCancel,
  onSubmit,
}) {
  // Collections
  const projectGroups = team.project_groups.edges.map(({ node }) => node);

  // Fill in the collection title for each folder, even if "not in any collection"
  const projects = team.projects?.edges
    .map(({ node }) => {
      const projectGroup = projectGroups.find(pg => pg.dbid === node.project_group_id) ||
                           { title: intl.formatMessage(messages.notInAnyCollection) };
      return { ...node, projectGroupTitle: projectGroup.title };
    });

  // Add "empty folders" to empty collections, so they appear in the drop-down as well
  projectGroups.forEach((pg) => {
    if (!projects.find(p => p.project_group_id === pg.dbid)) {
      projects.push({ projectGroupTitle: pg.title, title: intl.formatMessage(messages.noFolders) });
    }
  });

  // Get a default folder
  // The value returned can be undefined if workspace default folder has privacy settings on
  const defaultFolder = projects.filter(({ is_default }) => is_default === true)[0];

  // Lastly, sort options by title and exclude some options and defaultFolder to add it to the top of the list
  const filteredProjects = projects
    .filter(({ dbid }) => !excludeProjectDbids.includes(dbid) && dbid !== defaultFolder?.dbid)
    .sort((a, b) => {
      // First sort by collection
      if (a.projectGroupTitle !== b.projectGroupTitle) {
        return a.projectGroupTitle.localeCompare(b.projectGroupTitle);
      }
      // Then sort alphabetically if they are in the same collection
      return a.title.localeCompare(b.title);
    });

  const filteredProjectsOptions = defaultFolder ? [defaultFolder, ...filteredProjects] : [...filteredProjects];
  const [value, setValue] = React.useState(defaultFolder || null);

  const handleSubmit = React.useCallback(() => {
    setValue(defaultFolder || null);
    onSubmit(value);
  }, [onSubmit, value]);

  const handleChange = React.useCallback((ev, newValue, reason) => {
    switch (reason) {
    case 'select-option': setValue(newValue); break;
    case 'clear': setValue(null); break;
    default: break;
    }
  }, [value]);

  return (
    <Dialog
      onClick={event => event.stopPropagation()}
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        { extraContent ?
          <Box py={2}>
            <Typography variant="body1" component="p" paragraph>
              {extraContent}
            </Typography>
          </Box> : null }
        <Autocomplete
          options={filteredProjectsOptions}
          autoHighlight
          value={value}
          onChange={handleChange}
          getOptionLabel={option => option.title}
          getOptionSelected={(option, val) => val !== null && option.id === val.id}
          getOptionDisabled={option => !option.dbid}
          groupBy={option => option.projectGroupTitle}
          renderInput={params => (
            <TextField
              {...params}
              autoFocus
              name="project-title"
              label={
                <FormattedMessage
                  id="destinationProjects.choose"
                  defaultMessage="Choose a folder"
                  description="Choose a folder input label"
                />
              }
              variant="outlined"
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCancel}>{cancelLabel}</Button>
        <Button
          color="primary"
          className={submitButtonClassName}
          onClick={handleSubmit}
          disabled={!value}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SelectProjectDialog.defaultProps = {
  excludeProjectDbids: [],
};

SelectProjectDialog.propTypes = {
  intl: intlShape.isRequired,
  open: PropTypes.bool.isRequired,
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  excludeProjectDbids: PropTypes.arrayOf(PropTypes.number.isRequired),
  title: PropTypes.node.isRequired, // title (<FormattedMessage>)
  cancelLabel: PropTypes.node.isRequired,
  submitLabel: PropTypes.node.isRequired,
  submitButtonClassName: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
};

const SelectProjectDialogRenderer = (parentProps) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  // Not in a team context
  if (teamSlug === 'check') {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SelectProjectDialogRendererQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            dbid
            name
            projects(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  project_group_id
                  medias_count  # For optimistic updates when adding/moving items
                  search_id  # For optimistic updates when adding/moving items
                  is_default
                }
              }
            }
            project_groups(first: 10000) {
              edges {
                node {
                  dbid
                  title
                }
              }
            }
          }
        }
      `}
      cacheConfig={{ force: true }}
      variables={{
        teamSlug,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return (
            <SelectProjectDialog {...parentProps} {...props} />
          );
        }
        return null;
      }}
    />
  );
};

export default injectIntl(SelectProjectDialogRenderer);

// eslint-disable-next-line import/no-unused-modules
export { SelectProjectDialog as SelectProjectDialogTest };
