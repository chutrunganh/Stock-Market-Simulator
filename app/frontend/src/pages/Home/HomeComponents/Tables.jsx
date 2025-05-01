import React from 'react';
import './Tables.css';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
const columns = [
    { id: 'Symbol', label: 'Symbol', minWidth: 100 },
    { id: 'ref', label: 'Ref', minWidth: 50, align: 'center', format: (value) => value.toFixed(2) },
    { id: 'ceil', label: 'Ceil', minWidth: 50, align: 'center', format: (value) => value.toFixed(2) },
    { id: 'floor', label: 'Floor', minWidth: 50, align: 'center', format: (value) => value.toFixed(2) },
    {
      id: 'bid_prc1',
      label: 'Prc\u00a01',
      minWidth: 50,
      align: 'center',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'bid_vol1',
      label: 'Vol\u00a01',
      minWidth: 70,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'bid_prc2',
      label: 'Prc\u00a02',
      minWidth: 50,
      align: 'center',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'bid_vol2',
      label: 'Vol\u00a02',
      minWidth: 70,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'match_prc',
      label: 'Price',
      minWidth: 50,
      align: 'center',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'match_vol',
      label: 'Vol',
      minWidth: 70,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'ask_prc1',
      label: 'Prc\u00a01',
      minWidth: 50,
      align: 'center',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'ask_vol1',
      label: 'Vol\u00a01',
      minWidth: 70,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'ask_prc2',
      label: 'Prc\u00a02',
      minWidth: 50,
      align: 'center',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'ask_vol2',
      label: 'Vol\u00a02',
      minWidth: 70,
      align: 'center',
      format: (value) => value.toLocaleString('en-US'),
    },
];
  
function createData(Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2) {
    
  return { Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2 };
}
  
const rows = [
  createData('AAPL', 1, 2, 3, 150, 200, 155, 250, 152, 300, 158, 350, 160, 400),
  createData('GOOGL', 2, 3, 4, 250, 300, 255, 350, 252, 400, 258, 450, 260, 500),
  createData('MSFT', 3, 4, 5, 350, 400, 355, 450, 352, 500, 358, 550, 360, 600),
  createData('AMZN', 4, 5, 6, 450, 500, 455, 550, 452, 600, 458, 650, 460, 700),
  createData('TSLA', 5, 6, 7, 550, 600, 555, 650, 552, 700, 558, 750, 560, 800),
  createData('FB', 6, 7, 8, 650, 700, 655, 750, 652, 800, 658, 850, 660, 900),
  createData('NFLX', 7, 8, 9, 750, 800, 755, 850, 752, 900, 758, 950, 760, 1000),
  createData('NVDA', 8, 9, 10, 850, 900, 855, 950, 852, 1000, 858, 1050, 860, 1100),
  createData('INTC', 9, 10, 11, 950, 1000, 955, 1050, 952, 1100, 958, 1150, 960, 1200),
  createData('AMD', 10, 11, 12, 1050, 1100, 1055, 1150, 1052, 1200, 1058, 1250, 1060, 1300),
  createData('CSCO', 11, 12, 13, 1150, 1200, 1155, 1250, 1152, 1300, 1158, 1350, 1160, 1400),
  createData('ORCL', 12, 13, 14, 1250, 1300, 1255, 1350, 1252, 1400, 1258, 1450, 1260, 1500),
  createData('IBM', 13, 14, 15, 1350, 1400, 1355, 1450, 1352, 1500, 1358, 1550, 1360, 1600),
  createData('TSM', 14, 15, 16, 1450, 1500, 1455, 1550, 1452, 1600, 1458, 1650, 1460, 1700),
  createData('QCOM', 15, 16, 17, 1550, 1600, 1555, 1650, 1552, 1700, 1558, 1750, 1560, 1800),
  createData('TXN', 16, 17, 18, 1650, 1700, 1655, 1750, 1652, 1800, 1658, 1850, 1660, 1900),
  createData('AVGO', 17, 18, 19, 1750, 1800, 1755, 1850, 1752, 1900, 1758, 1950, 1760, 2000),
  createData('AMAT', 18, 19, 20, 1850, 1900, 1855, 1950, 1852, 2000, 1858, 2050, 1860, 2100),
  createData('LRCX', 19, 20, 21, 1950, 2000, 1955, 2050, 1952, 2100, 1958, 2150, 1960, 2200),
  createData('MU', 20, 21, 22, 2050, 2100, 2055, 2150, 2052, 2200, 2058, 2250, 2060, 2300),
  createData('ADBE', 21, 22, 23, 2150, 2200, 2155, 2250, 2152, 2300, 2158, 2350, 2160, 2400),
  createData('CRM', 22, 23, 24, 2250, 2300, 2255, 2350, 2252, 2400, 2258, 2450, 2260, 2500),
  createData('NOW', 23, 24, 25, 2350, 2400, 2355, 2450, 2352, 2500, 2358, 2550, 2360, 2600),
  createData('ZM', 24, 25, 26, 2450, 2500, 2455, 2550, 2452, 2600, 2458, 2650, 2460, 2700),
  createData('SNOW', 25, 26, 27, 2550, 2600, 2555, 2650, 2552, 2700, 2558, 2750, 2560, 2800),
  createData('DOCU', 26, 27, 28, 2650, 2700, 2655, 2750, 2652, 2800, 2658, 2850, 2660, 2900),
  createData('PINS', 27, 28, 29, 2750, 2800, 2755, 2850, 2752, 2900, 2758, 2950, 2760, 3000),
  createData('TWTR', 28, 29, 30, 2850, 2900, 2855, 2950, 2852, 3000, 2858, 3050, 2860, 3100),
  createData('SQ', 29, 30, 31, 2950, 3000, 2955, 3050, 2952, 3100, 2958, 3150, 2960, 3200),
  createData('UBER', 30, 31, 32, 3050, 3100, 3055, 3150, 3052, 3200, 3058, 3250, 3060, 3300),
  createData('LYFT', 31, 32, 33, 3150, 3200, 3155, 3250, 3152, 3300, 3158, 3350, 3160, 3400),
  ,
];

function datacheck(value, ref) {
  
}

// Added a function to compare data between 'ref' and 'price' and return a color
function compareRefAndPrice(ref, price, floor, ceil) {
  if (price > ref && price < ceil) {
    return 'green';
  } else if (ref > price && price > floor) {
    return 'red';
  } else if (price <= floor) {
    return '#006fff'; // Blue
  } else if (price >= ceil) {
    return '#FF00FF'; // Pink
  }
  return 'inherit';
}

// Updated to set color for each cell based on its value
function getCellTextColor(columnId, value, floor, ceil, ref) {
  switch (columnId) {
    case 'Symbol':
      return '#2200FF';
    case 'ref':
      return '#FFA33E'; // Orange
    case 'ceil':
      return '#FF00FF'; // Pink
    case 'floor':
      return '#006fff'; // Blue
    case 'bid_prc1':   
      return compareRefAndPrice(ref, value, floor, ceil);
    case 'bid_prc2':
      return compareRefAndPrice(ref, value, floor, ceil);
    case 'ask_prc1':
      return compareRefAndPrice(ref, value, floor, ceil);
    case 'ask_prc2':
      return compareRefAndPrice(ref, value, floor, ceil); 
    case 'match_prc':
      return compareRefAndPrice(ref, value, floor, ceil);
    default:
      return 'inherit';
  }
}

function Tables() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(10);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 1000 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} style={{ minWidth: '100px', textAlign: 'center', borderRight: '3px solid #000' }}>Symbol</TableCell>
              <TableCell rowSpan={2} style={{ minWidth: '50px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Ref</TableCell>
              <TableCell rowSpan={2} style={{ minWidth: '50px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Ceil</TableCell>
              <TableCell rowSpan={2} style={{ minWidth: '50px', textAlign: 'center', borderRight: '3px solid #000' }}>Floor</TableCell>
              <TableCell colSpan={4} align="center" style={{ borderRight: '3px solid #000' }}>Bid</TableCell>
              <TableCell colSpan={2} align="center" style={{ borderRight: '3px solid #000' }}>Match</TableCell>
              <TableCell colSpan={4} align="center">Ask</TableCell>
            </TableRow>
            <TableRow>
              {columns.slice(4).map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{
                    minWidth: column.minWidth,
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    borderRight: ['bid_vol2', 'match_vol'].includes(column.id) ? '3px solid #000' : '1px solid #ccc',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ borderBottom: '1px solid #ccc' }}>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{
                            fontWeight: column.id === 'Symbol' ? 'bold' : 'normal',
                            color: ['bid_vol1', 'match_vol', 'bid_vol2', 'ask_vol1', 'ask_vol2'].includes(column.id)
                              ? getCellTextColor(column.id.replace('_vol', '_prc'), row[column.id.replace('_vol', '_prc')], row.floor, row.ceil, row.ref)
                              : getCellTextColor(column.id, value, row.floor, row.ceil, row.ref),
                            borderRight: ['Symbol', 'floor', 'bid_vol2', 'match_vol'].includes(column.id) ? '3px solid #000' : '1px solid #ccc',
                          }}
                        >
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]} 
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default Tables;