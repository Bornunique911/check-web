import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';

import SettingsHeader from '../SettingsHeader';
import DeleteStatusDialog from './DeleteStatusDialog';
import EditStatusDialog from './EditStatusDialog';
import StatusListItem from './StatusListItem';
import TranslateStatuses from './TranslateStatuses';
import LanguageSwitcher from '../../LanguageSwitcher';
import { stringHelper } from '../../../customHelpers';
import { getErrorMessage } from '../../../helpers';
import { ContentColumn, units } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';
import { languageName } from '../../../LanguageRegistry';

const useToolbarStyles = makeStyles(() => ({
  button: {
    whiteSpace: 'nowrap',
  },
}));

const StyledBlurb = styled.div`
  margin-top: ${units(4)};
`;

const StatusesComponent = ({ team, setFlashMessage }) => {
  const statuses = [...team.verification_statuses.statuses];
  const defaultStatusId = team.verification_statuses.default;
  const defaultLanguage = team.get_language || 'en';
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [addingNewStatus, setAddingNewStatus] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [showDeleteStatusDialogFor, setShowDeleteStatusDialogFor] = React.useState(null);
  const classes = useToolbarStyles();

  const handleError = (error) => {
    const fallbackMessage = (
      <FormattedMessage
        id="statusesComponent.error"
        defaultMessage="Sorry, an error occurred while updating the statuses. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        description="Error message displayed when status can't be changed."
      />
    );
    const message = getErrorMessage(error, fallbackMessage);
    setFlashMessage(message, 'error');
  };

  const handleChangeLanguage = (newValue) => {
    setCurrentLanguage(newValue);
  };

  const handleMenuEdit = (status) => {
    setSelectedStatus(status);
  };

  function submitUpdateStatuses({ input, onCompleted, onError }) {
    commitMutation(Store, {
      mutation: graphql`
        mutation StatusesComponentUpdateTeamMutation($input: UpdateTeamInput!) {
          updateTeam(input: $input) {
            team {
              id
              verification_statuses
            }
          }
        }
      `,
      variables: {
        input,
      },
      onCompleted,
      onError,
    });
  }

  function submitDeleteStatus({ input, onCompleted, onError }) {
    commitMutation(Store, {
      mutation: graphql`
        mutation StatusesComponentDeleteTeamStatusMutation($input: DeleteTeamStatusInput!) {
          deleteTeamStatus(input: $input) {
            team {
              id
              verification_statuses
            }
          }
        }
      `,
      variables: {
        input,
      },
      onCompleted,
      onError,
    });
  }

  const handleDelete = ({ status_id, fallback_status_id }) => {
    const onCompleted = () => {
      setShowDeleteStatusDialogFor(null);
      setFlashMessage((
        <FormattedMessage
          id="statusesComponent.deleted"
          defaultMessage="Status deleted successfully"
          description="Success message displayed when status is deleted."
        />
      ), 'success');
    };
    const onError = (error) => {
      handleError(error);
      setShowDeleteStatusDialogFor(null);
    };
    submitDeleteStatus({
      input: {
        team_id: team.id,
        status_id,
        fallback_status_id,
      },
      onCompleted,
      onError,
    });
  };

  const handleSubmit = (newStatuses, showSuccessMessage) => {
    const onCompleted = () => {
      setAddingNewStatus(false);
      setSelectedStatus(null);
      if (showSuccessMessage === 'saved') {
        setFlashMessage((
          <FormattedMessage
            id="statusesComponent.saved"
            defaultMessage="Statuses saved successfully"
            description="Success message displayed when status is saved."
          />
        ), 'success');
      }
      if (showSuccessMessage === 'created') {
        setFlashMessage((
          <FormattedMessage
            id="statusesComponent.created"
            defaultMessage="Status created successfully"
            description="Success message displayed when status is created."
          />
        ), 'success');
      }
    };
    const onError = (error) => {
      handleError(error);
      setAddingNewStatus(false);
      setSelectedStatus(null);
    };
    submitUpdateStatuses({
      input: {
        id: team.id,
        media_verification_statuses: JSON.stringify(newStatuses),
      },
      onCompleted,
      onError,
    });
  };

  const handleAddOrEditStatus = (status) => {
    const newStatuses = { ...team.verification_statuses };
    const newStatusesArray = [...newStatuses.statuses];

    if (selectedStatus && (status.id === selectedStatus.id)) {
      const index = newStatusesArray.findIndex(s => s.id === status.id);
      newStatusesArray.splice(index, 1, status);
    } else {
      newStatusesArray.push(status);
    }

    newStatuses.statuses = newStatusesArray;
    handleSubmit(newStatuses, (addingNewStatus ? 'created' : null));
  };

  const handleCancelEdit = () => {
    setAddingNewStatus(false);
    setSelectedStatus(null);
  };

  const handleMenuDelete = (status) => {
    setShowDeleteStatusDialogFor(status.id);
  };

  const handleMenuMakeDefault = (status) => {
    const newStatuses = { ...team.verification_statuses };
    const newStatusesArray = [...newStatuses.statuses];

    if (status.id) {
      const index = newStatusesArray.findIndex(s => s.id === status.id);
      newStatusesArray.splice(index, 1);
      newStatusesArray.unshift(status);
      newStatuses.default = status.id;
    }

    newStatuses.statuses = newStatusesArray;
    handleSubmit(newStatuses);
  };

  const handleTranslateStatuses = (newStatusesArray) => {
    const newStatuses = { ...team.verification_statuses };
    newStatuses.statuses = newStatusesArray;
    handleSubmit(newStatuses, 'saved');
  };

  return (
    <Box display="flex" className="status-settings">
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="statusesComponent.title"
              defaultMessage="{languageName} statuses"
              values={{
                languageName: languageName(currentLanguage),
              }}
              description="The idea of this sentence is 'statuses written in language <languageName>'"
            />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4838891-status-settings"
          actionButton={
            <Button className={[classes.button, 'team-statuses__add-button'].join(' ')} color="primary" variant="contained" onClick={() => setAddingNewStatus(true)}>
              <FormattedMessage
                id="statusesComponent.newStatus"
                defaultMessage="New status"
                description="Button label to create a new status."
              />
            </Button>
          }
          extra={
            <LanguageSwitcher
              component="dropdown"
              currentLanguage={currentLanguage}
              languages={languages}
              onChange={handleChangeLanguage}
            />
          }
        />
        <Card>
          <CardContent>
            {
              currentLanguage === defaultLanguage ? (
                <List>
                  { statuses.map(s => (
                    <StatusListItem
                      defaultLanguage={defaultLanguage}
                      isDefault={s.id === defaultStatusId}
                      key={s.id}
                      onDelete={handleMenuDelete}
                      onEdit={handleMenuEdit}
                      onMakeDefault={handleMenuMakeDefault}
                      preventDelete={statuses.length === 1}
                      status={s}
                    />
                  ))}
                </List>
              ) : (
                <React.Fragment>
                  <StyledBlurb>
                    <FormattedMessage
                      id="statusesComponent.blurbSecondary"
                      defaultMessage="Translate statuses in secondary languages in order to display them in local languages in your fact checking reports."
                      description="Message displayed on status translation page."
                    />
                  </StyledBlurb>
                  <TranslateStatuses
                    currentLanguage={currentLanguage}
                    defaultLanguage={defaultLanguage}
                    key={currentLanguage}
                    onSubmit={handleTranslateStatuses}
                    statuses={statuses}
                  />
                </React.Fragment>
              )
            }
          </CardContent>
        </Card>
      </ContentColumn>
      <EditStatusDialog
        team={team}
        defaultLanguage={defaultLanguage}
        defaultValue={selectedStatus}
        key={selectedStatus || 'edit-status-dialog'}
        onCancel={handleCancelEdit}
        onSubmit={handleAddOrEditStatus}
        open={addingNewStatus || Boolean(selectedStatus)}
      />
      { showDeleteStatusDialogFor ?
        <DeleteStatusDialog
          open
          defaultValue={showDeleteStatusDialogFor}
          key={showDeleteStatusDialogFor || 'delete-status-dialog'}
          onCancel={() => setShowDeleteStatusDialogFor(null)}
          onProceed={handleDelete}
          statuses={statuses}
        /> : null }
    </Box>
  );
};

StatusesComponent.propTypes = {
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(StatusesComponent);
