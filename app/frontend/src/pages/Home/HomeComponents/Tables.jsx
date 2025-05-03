import React, { useState, useEffect, memo } from 'react';
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

function createData(Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2) {
  return { Symbol, ref, ceil, floor, bid_prc1, bid_vol1, bid_prc2, bid_vol2, match_prc, match_vol, ask_prc1, ask_vol1, ask_prc2, ask_vol2 };
}

// Color constants
const COLORS = {
  DEFAULT: '#000000',
  UP: 'green',
  DOWN: 'red',
  FLOOR: '#006fff',
  CEILING: '#FF00FF',
  REF: '#FFA33E'
};

// Get color based on price comparison
function compareRefAndPrice(ref, price, floor, ceil) {
  if (!price || price === 0) return COLORS.DEFAULT;
  if (price >= ceil) return COLORS.CEILING;
  if (price <= floor) return COLORS.FLOOR;
  return price > ref ? COLORS.UP : COLORS.DOWN;
}

// Get column color based on type and values
function getCellTextColor(columnId, value, floor, ceil, ref, match_prc, row) {
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
}

// Memoized row component for performance
const OrderBookTableRow = memo(({ row, columns, getCellTextColor }) => {
  return (
    <TableRow hover role="checkbox" tabIndex={-1}>
      {columns.map(({ id, align, format }) => {
        const value = row[id];
        const isSymbolColumn = id === 'Symbol';
        const borderRightStyle = ['Symbol', 'floor', 'bid_vol1', 'match_vol'].includes(id)
          ? '3px solid #000'
          : '1px solid #ccc';

        return (
          <TableCell
            key={id}
            align={align}
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

function Tables() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBookData, setOrderBookData] = useState([]);
  const [orderBookMap, setOrderBookMap] = useState({}); // For efficient updates
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
          
          // Create a map for more efficient updates
          const dataMap = {};
          data.forEach(item => {
            dataMap[item.symbol] = item;
          });
          setOrderBookMap(dataMap);
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
            // Update the order book data
            setOrderBookData(eventData.data);
            
            // Also update the map for efficient lookup
            const updatedMap = {};
            eventData.data.forEach(item => {
              updatedMap[item.symbol] = item;
            });
            setOrderBookMap(updatedMap);
            
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
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          {error}
        </div>
      ) : (
        <>
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
                        borderRight: ['bid_vol1', 'match_vol'].includes(column.id) ? '3px solid #000' : '1px solid #ccc',
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody sx={{ borderBottom: '1px solid #ccc' }}>
                {processedRows.length > 0 ? (
                  processedRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <OrderBookTableRow 
                        key={row.Symbol} 
                        row={row} 
                        columns={columns} 
                        getCellTextColor={getCellTextColor} 
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
        </>
      )}
    </Paper>
  );
}

export default Tables;