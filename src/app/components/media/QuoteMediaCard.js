import React from 'react';
import PropTypes from 'prop-types';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import ParsedText from '../ParsedText';
import { breakWordStyles } from '../../styles/js/shared';

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  text-align: start;
`;

/* eslint jsx-a11y/click-events-have-key-events: 0 */
const QuoteMediaCard = ({ quote, languageCode }) => (
  <div>
    <StyledQuoteText dir={rtlDetect.isRtlLang(languageCode) ? 'rtl' : 'ltr'} lang={languageCode}>
      <ParsedText text={quote} />
    </StyledQuoteText>
  </div>
);
QuoteMediaCard.propTypes = {
  quote: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
};

export default QuoteMediaCard;
