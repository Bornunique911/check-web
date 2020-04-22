import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Button from '@material-ui/core/Button';
import CreateMediaDialog from './CreateMediaDialog';
import CreateProjectMediaMutation from '../../relay/mutations/CreateProjectMediaMutation';
import CreateProjectSourceMutation from '../../relay/mutations/CreateProjectSourceMutation';
import CheckContext from '../../CheckContext';
import { stringHelper } from '../../customHelpers';
import { getErrorObjects, getFilters } from '../../helpers';
import CheckError from '../../CheckError';

const messages = defineMessages({
  submitting: {
    id: 'createMedia.submitting',
    defaultMessage: 'Submitting...',
  },
  error: {
    id: 'createMedia.error',
    defaultMessage:
      'Sorry, an error occurred while submitting the item. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class CreateProjectMedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
    };
  }

  fail = (transaction) => {
    let message = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const error = getErrorObjects(transaction);
    if (Array.isArray(error) && error.length > 0) {
      if (error[0].code === CheckError.codes.DUPLICATED) {
        message = null;
        browserHistory.push(error[0].data.url);
      } else {
        message = error[0].message; // eslint-disable-line prefer-destructuring
      }
    }
    this.context.setMessage(message);
  };

  submitSource(value) {
    const context = new CheckContext(this).getContextStore();
    const prefix = `/${context.team.slug}/project/${context.project.dbid}/source/`;

    if (!value) {
      return;
    }

    this.setState({
      message: this.props.intl.formatMessage(messages.submitting),
    });

    const onSuccess = (response) => {
      const rid = response.createProjectSource.project_source.dbid;
      browserHistory.push(prefix + rid);
      this.setState({ message: null });
    };

    Relay.Store.commitUpdate(
      new CreateProjectSourceMutation({
        ...value,
        project: context.project,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  submitMedia(value) {
    const context = new CheckContext(this).getContextStore();
    let prefix = null;
    if (context.project) {
      prefix = `/${context.team.slug}/project/${context.project.dbid}/media/`;
    } else {
      prefix = `/${context.team.slug}/media/`;
    }

    if (!value) {
      return;
    }

    const onSuccess = (response) => {
      if (getFilters() !== '{}') {
        const rid = response.createProjectMedia.project_media.dbid;
        browserHistory.push(prefix + rid);
      }
      this.setState({ message: null });
    };

    this.setState({ dialogOpen: false });

    Relay.Store.commitUpdate(
      new CreateProjectMediaMutation({
        ...value,
        context,
        team: this.props.team,
        search: this.props.search,
        project: context.project,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true, message: null });
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  handleSubmit = (value) => {
    if (value && value.mode === 'source') {
      this.submitSource(value);
    } else {
      this.submitMedia(value);
    }
  };

  render() {
    return (
      <div>
        <Button id="create-media__add-item" onClick={this.handleOpenDialog} color="primary" variant="contained">
          <FormattedMessage id="createMedia.addItem" defaultMessage="Add Item" />
        </Button>
        <CreateMediaDialog
          title={<FormattedMessage id="createMedia.addNewItem" defaultMessage="Add new item" />}
          open={this.state.dialogOpen}
          onDismiss={this.handleCloseDialog}
          message={this.state.message}
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}

CreateProjectMedia.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

CreateProjectMedia.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(CreateProjectMedia);
