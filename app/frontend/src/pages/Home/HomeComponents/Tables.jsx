import React, { useState, useEffect } from 'react';
import './Tables.css';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow,
  CircularProgress 
} from '@mui/material';
import { getOrderBookData, createOrderBookStream } from '../../../api/orderBook';

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
  
// Helper function to create data objects
function createData(Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2) {
  return { Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2 };
}

// Helper function to determine cell text color based on price changes
const getCellTextColor = (value, refValue) => {
  if (!value || !refValue) return {};
  if (value > refValue) {
    return { color: '#27ae60' }; // Green for prices above reference
  } else if (value < refValue) {
    return { color: '#e74c3c' }; // Red for prices below reference
  }
  return {}; // Default color for unchanged prices
};

// Component to render individual table rows
const OrderBookTableRow = ({ row, columns, getCellTextColor }) => {
  return (
    <TableRow hover role="checkbox" tabIndex={-1}>
      {columns.map((column) => {
        const value = row[column.id];
        const textColorStyle = column.id.includes('prc') || column.id === 'match_prc'
          ? getCellTextColor(value, row.ref)
          : {};

        return (
          <TableCell 
            key={column.id} 
            align={column.align}
            style={{
              ...textColorStyle,
              borderRight: ['Symbol', 'floor', 'bid_vol2', 'match_vol'].includes(column.id) ? '2px solid #000' : '1px solid #ccc',
            }}
          >
            {column.format && typeof value === 'number' ? column.format(value) : value}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

function Tables() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBookData, setOrderBookData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Initial data load
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const data = await getOrderBookData();
        console.log('Initial order book data:', data);
        if (data && Array.isArray(data)) {
          setOrderBookData(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading initial order book data:', error);
        setError('Failed to load order book data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Set up SSE connection
    const eventSource = createOrderBookStream();
    
    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        console.log('SSE update received:', eventData);
        
        if (eventData.type === 'initial' || eventData.type === 'update') {
          if (eventData.data && Array.isArray(eventData.data)) {
            setOrderBookData(eventData.data);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setError('Connection to server lost. Please refresh the page.');
    };
    
    // Clean up on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Transform orderBookData into the format expected by the table
  const processedRows = React.useMemo(() => {
    if (!Array.isArray(orderBookData) || orderBookData.length === 0) {
      return [];
    }

    return orderBookData.map((stockData, index) => {
      const refPrice = stockData.ref || 0;
      const ceilPrice = Math.round(refPrice * 1.07 * 100) / 100;
      const floorPrice = Math.round(refPrice * 0.93 * 100) / 100;

      return createData(
        stockData.symbol,
        refPrice,
        ceilPrice,
        floorPrice,
        stockData.bid_prc1 || 0,
        stockData.bid_vol1 || 0,
        stockData.bid_prc2 || 0,
        stockData.bid_vol2 || 0,
        stockData.match_prc || 0,
        stockData.match_vol || 0,
        stockData.ask_prc1 || 0,
        stockData.ask_vol1 || 0,
        stockData.ask_prc2 || 0,
        stockData.ask_vol2 || 0
      );
    });
  }, [orderBookData]);

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
            {processedRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <OrderBookTableRow key={row.Symbol} row={row} columns={columns} getCellTextColor={getCellTextColor} />
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]} 
        component="div"
        count={processedRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default Tables;