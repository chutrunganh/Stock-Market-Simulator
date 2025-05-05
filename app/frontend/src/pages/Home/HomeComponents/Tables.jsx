import React, { useState, useEffect, memo, useMemo } from 'react';
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

// Color constants
const COLORS = {
  DEFAULT: '#000000',
  UP: 'green',
  DOWN: 'red',
  FLOOR: '#006fff',
  CEILING: '#FF00FF',
  REF: '#FFA33E'
};

// Column factory functions
const createPriceColumn = (id, label) => ({
  id,
  label,
  minWidth: 50,
  align: 'center',
  format: (value) => value.toFixed(2)
});

const createVolumeColumn = (id, label) => ({
  id,
  label,
  minWidth: 70,
  align: 'center',
  format: (value) => value.toLocaleString('en-US')
});

// Column definitions
const columns = [
  { id: 'Symbol', label: 'Symbol', minWidth: 100 },
  createPriceColumn('ref', 'Ref'),
  createPriceColumn('ceil', 'Ceil'),
  createPriceColumn('floor', 'Floor'),
  createPriceColumn('bid_prc2', 'Prc\u00a02'),
  createVolumeColumn('bid_vol2', 'Vol\u00a02'),
  createPriceColumn('bid_prc1', 'Prc\u00a01'),
  createVolumeColumn('bid_vol1', 'Vol\u00a01'),
  createPriceColumn('match_prc', 'Price'),
  createVolumeColumn('match_vol', 'Vol'),
  createPriceColumn('ask_prc1', 'Prc\u00a01'),
  createVolumeColumn('ask_vol1', 'Vol\u00a01'),
  createPriceColumn('ask_prc2', 'Prc\u00a02'),
  createVolumeColumn('ask_vol2', 'Vol\u00a02'),
];

// Helper function to get color based on price comparison
const compareRefAndPrice = (ref, price, floor, ceil) => {
  if (!price || price === 0) return COLORS.DEFAULT;
  if (price >= ceil) return COLORS.CEILING;
  if (price <= floor) return COLORS.FLOOR;
  return price > ref ? COLORS.UP : COLORS.DOWN;
};

// Helper function to determine cell text color based on price changes
const getCellTextColor = (columnId, value, floor, ceil, ref, match_prc, row) => {
  // Static column colors
  const staticColors = {
    Symbol: match_prc === 0 ? COLORS.DEFAULT : match_prc > ref ? COLORS.UP : match_prc < ref ? COLORS.DOWN : COLORS.DEFAULT,
    ref: COLORS.REF,
    ceil: COLORS.CEILING,
    floor: COLORS.FLOOR
  };
  
  if (staticColors[columnId]) return staticColors[columnId];

  // Price and volume columns
  const priceMap = {
    'bid_prc1': row.bid_prc1, 'bid_vol1': row.bid_prc1,
    'bid_prc2': row.bid_prc2, 'bid_vol2': row.bid_prc2,
    'ask_prc1': row.ask_prc1, 'ask_vol1': row.ask_prc1,
    'ask_prc2': row.ask_prc2, 'ask_vol2': row.ask_prc2,
    'match_prc': row.match_prc, 'match_vol': row.match_prc
  };

  return priceMap[columnId] ? compareRefAndPrice(ref, priceMap[columnId], floor, ceil) : 'inherit';
};

// Helper function to create data objects from API response
const createData = (Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2) => {
  return { Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2 };
};

// Memoized row component for performance
const OrderBookTableRow = memo(({ row, columns }) => {
  return (
    <TableRow hover tabIndex={-1}>
      {columns.map(({ id, align, format }) => {        const value = row[id];
        const isSymbolColumn = id === 'Symbol';
        const isPriceCell = id.includes('prc') || id === 'match_prc' || id === 'ref' || id === 'ceil' || id === 'floor';
        const isVolumeCell = id.includes('vol');
        const isMatchPrice = id === 'match_prc';
        const isRefPrice = id === 'ref';
        const borderRightStyle = ['Symbol', 'floor', 'bid_vol1', 'match_vol'].includes(id)
          ? '3px solid #000'
          : '1px solid #ccc';

        return (
          <TableCell
            key={id}
            align={align}
            data-price-cell={isPriceCell ? "true" : "false"}
            data-volume-cell={isVolumeCell ? "true" : "false"}
            data-match-price={isMatchPrice ? "true" : "false"}
            data-ref-price={isRefPrice ? "true" : "false"}
            style={{
              fontWeight: isSymbolColumn ? 'bold' : 'normal',
              color: getCellTextColor(id, value, row.floor, row.ceil, row.ref, row.match_prc, row),
              borderRight: borderRightStyle,
            }}
          >
            {format && typeof value === 'number' ? format(value) : value}
          </TableCell>
        );
      })}
    </TableRow>
  );
}, (prevProps, nextProps) => {
  const { row: prevRow } = prevProps;
  const { row: nextRow } = nextProps;

  if (prevRow.Symbol !== nextRow.Symbol) return false;

  const fieldsToCompare = [
    'bid_prc1', 'bid_vol1', 'bid_prc2', 'bid_vol2',
    'ask_prc1', 'ask_vol1', 'ask_prc2', 'ask_vol2',
    'match_prc', 'match_vol'
  ];

  return !fieldsToCompare.some(field => prevRow[field] !== nextRow[field]);
});

// Table header component
const OrderBookTableHeader = () => (
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
            borderRight: ['bid_vol1', 'match_vol'].includes(column.id) ? '3px solid #000' : '1px solid #ccc',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

function Tables() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBookData, setOrderBookData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    // Handle SSE connection and initial data loading
  useEffect(() => {
    let eventSource = null;
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout = null;
    
    // Load initial data
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const data = await getOrderBookData();
        if (data && Array.isArray(data)) {
          setOrderBookData(data);
          setError(null); // Clear any previous errors
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading order book data:', error);
        setError('Failed to load order book data. Please try again later.');
        setLoading(false);
      }
    };
    
    // Initialize SSE connection
    const initSSEConnection = () => {
      // Make sure to close any existing connection
      if (eventSource) {
        eventSource.close();
      }
      
      // Create new connection
      eventSource = createOrderBookStream();
      
      eventSource.onopen = () => {
        console.log('SSE connection established');
        retryCount = 0; // Reset retry count on successful connection
        setError(null); // Clear any previous errors
      };
      
      eventSource.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          
          if ((type === 'initial' || type === 'update') && Array.isArray(data)) {
            setOrderBookData(data);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error processing SSE message:', error);
        }
      };
      
      eventSource.onerror = (e) => {
        console.error('SSE connection error:', e);
        eventSource.close();
        
        // Only retry a limited number of times
        if (retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 2000 * retryCount; // Exponential backoff
          console.log(`Retrying SSE connection in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
          
          // Try to load data via REST API while SSE is down
          loadInitialData();
          
          // Wait and retry SSE connection
          retryTimeout = setTimeout(initSSEConnection, retryDelay);
        } else {
          // After max retries, just keep the REST data and show error
          setError('Real-time updates unavailable. Data may not be current.');
        }
      };
    };
    
    // Start everything
    loadInitialData();
    initSSEConnection();
    
    // Clean up SSE connection when component unmounts
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Transform orderBookData into the format expected by the table
  const processedRows = useMemo(() => {
    if (!Array.isArray(orderBookData) || orderBookData.length === 0) {
      return [];
    }

    return orderBookData.map(stockData => {
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

  // Display loading state or error
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress />
        </div>
      </Paper>
    );
  }
  // Function to reset the component state and force a refresh
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to run again
    window.location.reload();
  };

  if (error) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
          <button 
            onClick={handleRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry Connection
          </button>
        </div>
      </Paper>
    );
  }

  // Calculate paginated rows
  const paginatedRows = processedRows.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 1000 }}>
        <Table stickyHeader aria-label="order book table">
          <OrderBookTableHeader />
          <TableBody sx={{ borderBottom: '1px solid #ccc' }}>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <OrderBookTableRow 
                  key={row.Symbol} 
                  row={row} 
                  columns={columns} 
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                  No order book data available
                </TableCell>
              </TableRow>
            )}
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