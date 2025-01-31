/* eslint-disable @calm/react-intl/missing-attribute */
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import TeamBot from './TeamBot';
import CreateTeamBotInstallationMutation from '../../relay/mutations/CreateTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../relay/mutations/UpdateTeamBotInstallationMutation';
import DeleteTeamBotInstallationMutation from '../../relay/mutations/DeleteTeamBotInstallationMutation';
import { botName } from '../../helpers';

class TeamBots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: null,
      settings: {},
      message: null,
      messageBotId: null,
      saving: false,
    };
  }

  componentWillMount() {
    const settings = {};
    this.props.root.team_bots_approved.edges.forEach((bot) => {
      const installation = this.getInstallation(bot.node.id);
      if (installation) {
        const value = installation.json_settings || '{}';
        settings[installation.id] = JSON.parse(value);
      }
    });
    this.setState({ settings });
  }

  getInstallation(botId) {
    const installation = this.props.root.current_team.team_bot_installations.edges.find(i => i.node.bot_user.id === botId);
    if (installation) {
      return installation.node;
    }
    return null;
  }

  handleToggle(installation, bot, team) {
    const handleDone = () => { this.setState({ saving: false }); };
    this.setState({ saving: bot.id });
    const callbacks = { onFailure: handleDone, onSuccess: handleDone };
    if (installation) {
      const deleteBot = { id: installation.id, teamId: team.id };
      Relay.Store.commitUpdate(new DeleteTeamBotInstallationMutation(deleteBot), callbacks);
    } else {
      Relay.Store.commitUpdate(new CreateTeamBotInstallationMutation({ bot, team }), callbacks);
    }
  }

  handleSettingsUpdated(installation, data) {
    const settings = Object.assign({}, this.state.settings);
    settings[installation.id] = data;
    this.setState({ settings, message: null, messageBotId: null });
  }

  handleSubmitSettings(installation) {
    const settings = JSON.stringify(this.state.settings[installation.id]);
    const messageBotId = installation.team_bot.dbid;
    const onSuccess = () => {
      this.setState({
        messageBotId,
        message: <FormattedMessage id="teamBots.success" defaultMessage="Settings updated!" />,
      });
    };
    const onFailure = () => {
      this.setState({
        messageBotId,
        message: <FormattedMessage id="teamBots.fail" defaultMessage="Error! Please try again." />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamBotInstallationMutation({
        id: installation.id,
        json_settings: settings,
      }),
      { onSuccess, onFailure },
    );
  }

  handleToggleSettings(botId) {
    const expanded = (this.state.expanded === botId) ? null : botId;
    this.setState({ expanded, message: null, messageBotId: null });
  }

  render() {
    const { root } = this.props;
    const team = root.current_team;

    return (
      <Box className="team-bots">
        { root.team_bots_approved.edges.map((teamBot) => {
          const bot = teamBot.node;
          const installation = this.getInstallation(bot.id);

          if (bot.default || bot.name === 'Smooch') {
            return null;
          }

          const botExpanded = installation && this.state.expanded === bot.dbid;
          return (
            <Box clone mb={5} key={bot.dbid}>
              <Card key={`bot-${bot.dbid}`}>
                <CardHeader
                  title={botName(bot)}
                  action={
                    <IconButton
                      disabled={!installation}
                      onClick={this.handleToggleSettings.bind(this, bot.dbid)}
                      className="settingsIcon"
                    >
                      <SettingsIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body1">
                      {bot.description}
                    </Typography>
                    <Switch
                      className={`team-bots__${bot.identifier}-${installation ? 'installed' : 'uninstalled'}`}
                      checked={Boolean(installation)}
                      onClick={this.handleToggle.bind(this, installation, bot, team)}
                      disabled={this.state.saving === bot.id}
                    />
                  </Box>
                </CardContent>
                <Collapse in={botExpanded} timeout="auto">
                  <CardContent>
                    { bot.installation?.json_settings ?
                      <React.Fragment>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <h3><FormattedMessage id="teamBots.settings" defaultMessage="Settings" /></h3>
                          <div>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={this.handleSubmitSettings.bind(this, installation)}
                            >
                              <FormattedMessage
                                id="teamBots.save"
                                defaultMessage="Save"
                              />
                            </Button>
                            { this.state.message && this.state.messageBotId === bot.dbid ?
                              <Box component="small" my={0} mx={1}>
                                {this.state.message}
                              </Box> : null }
                          </div>
                        </Box>
                        { botExpanded ?
                          <TeamBot
                            bot={bot}
                            value={this.state.settings[installation.id] || JSON.parse(installation.json_settings || '{}')}
                            onChange={this.handleSettingsUpdated.bind(this, installation)}
                          /> : null
                        }
                      </React.Fragment> :
                      <FormattedMessage
                        id="teamBots.noSettings"
                        defaultMessage="There are no settings for this bot."
                      />
                    }
                  </CardContent>
                </Collapse>
              </Card>
            </Box>
          );
        })}
      </Box>
    );
  }
}

export default TeamBots;
