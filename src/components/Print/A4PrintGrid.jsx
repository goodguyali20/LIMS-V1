import React from 'react';
import styled from 'styled-components';

const A4Page = styled.div`
  background: white;
  width: 210mm;
  height: 297mm;
  display: block;
  margin: 0 auto;
  page-break-after: always; /* Ensure each grid is on a new page */
  box-sizing: border-box;
  padding: 5mm; /* Small padding so cut lines aren't at the very edge */

  @media print {
    margin: 0;
    padding: 0;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  width: 100%;
  height: 100%;
  gap: 0;
`;

const A4PrintGrid = React.forwardRef(({ slips }, ref) => {
  // We can eventually have more than 12 slips, this logic will handle it
  const pageCount = Math.ceil(slips.length / 12);

  return (
    <div ref={ref}>
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <A4Page key={pageIndex}>
          <GridContainer>
            {slips.slice(pageIndex * 12, (pageIndex + 1) * 12).map((slip, slipIndex) => (
              <React.Fragment key={slipIndex}>{slip}</React.Fragment>
            ))}
          </GridContainer>
        </A4Page>
      ))}
    </div>
  );
});

export default A4PrintGrid;