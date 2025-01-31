/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SmoochBotComponent from './SmoochBotComponent';

const SmoochBot = ({ currentUser }) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SmoochBotQuery($teamSlug: String!) {
          root {
            current_team {
              id
              dbid
              slug
              name
              get_language
              get_languages
              permissions
              smooch_bot: team_bot_installation(bot_identifier: "smooch") {
                id
                json_settings
                smooch_enabled_integrations(force: true)
                smooch_newsletter_information
                team_bot: bot_user {
                  id
                  dbid
                  avatar
                  name
                  identifier
                  default
                  settings_as_json_schema(team_slug: $teamSlug)
                  settings_ui_schema
                  description: get_description
                }
              }
            }
            team_bots_approved(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  name
                }
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={({ props }) => {
        if (props) {
          const smoochBotDbid = props.root.team_bots_approved.edges.find(bot => bot.node.name === 'Smooch').node.dbid;
          return (<SmoochBotComponent team={props.root.current_team} currentUser={currentUser} smoochBotDbid={smoochBotDbid} />);
        }
        return null;
      }}
    />
  );
};

SmoochBot.propTypes = {
  currentUser: PropTypes.object.isRequired, // FIXME: List the fields needed
};

export default SmoochBot;
