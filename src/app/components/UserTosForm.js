/* eslint-disable @calm/react-intl/missing-attribute */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import { units, title1, caption } from '../styles/js/shared';
import { stringHelper } from '../customHelpers';

class UserTosForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const linkStyle = {
      textDecoration: 'underline',
    };

    const tosLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('TOS_URL')}
      >
        <FormattedMessage id="userTos.tosLink" defaultMessage="Terms of Service" />
      </a>
    );

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="userTos.ppLink" defaultMessage="Privacy Policy" />
      </a>
    );

    const { termsLastUpdatedAt } = this.props;

    return (
      <div>
        { !this.props.user.last_accepted_terms_at ?
          <div>
            { this.props.showTitle ?
              <h2 style={{ font: title1 }}>
                <FormattedMessage
                  id="userTos.title"
                  defaultMessage="Terms of Service and Privacy Policy"
                />
              </h2> : null
            }
            { termsLastUpdatedAt ?
              <p style={{ margin: `${units(1)} 0`, font: caption }}>
                <FormattedMessage
                  id="userTos.termsLastUpdatedAt"
                  defaultMessage="Last updated {lastUpdated}"
                  values={{
                    lastUpdated: <FormattedDate value={termsLastUpdatedAt * 1000} day="numeric" month="long" year="numeric" />,
                  }}
                />
              </p> : null
            }
            <Box my={4}>
              <Typography component="div" variant="body2">
                <FormattedMessage
                  id="userTos.disclaimer"
                  defaultMessage="Please review our {tosLink} and our {ppLink} and consent to the following:"
                  values={{
                    tosLink,
                    ppLink,
                  }}
                />
              </Typography>
            </Box>
          </div> :
          <div>
            <h2>
              <FormattedMessage
                id="userTos.titleUpdated"
                defaultMessage="Updated Terms and Privacy Policy"
              />
            </h2>
            <p style={{ margin: `${units(4)} 0` }}>
              <FormattedMessage
                id="userTos.disclaimerUpdate"
                defaultMessage="We've updated our {tosLink} and our {ppLink}. Please review and consent to the following:"
                values={{
                  tosLink,
                  ppLink,
                }}
              />
            </p>
          </div>
        }
        <div style={{ margin: `${units(4)} 0` }}>
          <FormControlLabel
            control={
              <Checkbox
                id="tos__tos-agree"
                onChange={this.props.handleCheckTos}
                checked={this.props.checkedTos}
              />
            }
            label={
              <FormattedMessage
                id="userTos.agreeTos"
                defaultMessage="I agree to the Terms of Service."
              />
            }
          />
        </div>
      </div>
    );
  }
}

UserTosForm.propTypes = {
  checkedTos: PropTypes.bool.isRequired,
  handleCheckTos: PropTypes.func.isRequired,
  showTitle: PropTypes.bool,
  termsLastUpdatedAt: PropTypes.number.isRequired,
  user: PropTypes.shape({
    last_accepted_terms_at: PropTypes.string,
  }).isRequired,
};

UserTosForm.defaultProps = {
  showTitle: false,
};

export default UserTosForm;
