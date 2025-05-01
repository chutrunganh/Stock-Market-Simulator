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
import { getOrderBookData } from '../../../api/orderBook';
import eventEmitter from '../../../services/eventEmitter';

// Memoized row component
const OrderBookTableRow = memo(({ row, columns, getCellTextColor }) => {
  return (
    <TableRow hover role="checkbox" tabIndex={-1}>
      {columns.map((column) => {
        const value = row[column.id];
        return (
          <TableCell
            key={column.id}
            align={column.align}
            style={{
              fontWeight: column.id === 'Symbol' ? 'bold' : 'normal',
              color: getCellTextColor(column.id, value, row.floor, row.ceil, row.ref, row.match_prc, row),
              borderRight: ['Symbol', 'floor', 'bid_vol1', 'match_vol'].includes(column.id) ? '3px solid #000' : '1px solid #ccc',
            }}
          >
            {column.format && typeof value === 'number' ? column.format(value) : value}
          </TableCell>
        );
      })}
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to determine if re-render is needed
  // Only re-render if any price or volume values have changed
  const prevRow = prevProps.row;
  const nextRow = nextProps.row;
  
  if (prevRow.Symbol !== nextRow.Symbol) return false; // Symbol changed, re-render
  
  // Check if any numeric values changed
  const fieldsToCompare = [
    'bid_prc1', 'bid_vol1', 'bid_prc2', 'bid_vol2',
    'ask_prc1', 'ask_vol1', 'ask_prc2', 'ask_vol2',
    'match_prc', 'match_vol'
  ];
  
  return !fieldsToCompare.some(field => prevRow[field] !== nextRow[field]);
});

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

function Tables() {  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBookData, setOrderBookData] = useState([]);
  const [orderBookMap, setOrderBookMap] = useState({}); // For efficient updates 
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to fetch complete order book data
  const fetchOrderBookData = async () => {
    try {
      setLoading(true);
      const data = await getOrderBookData();
      console.log('Received order book data:', data);
      setOrderBookData(data);
      
      // Update the timestamp and the map for efficient updates
      setLastUpdateTime(Date.now());
      
      // Create a map for more efficient updates
      const dataMap = {};
      data.forEach(item => {
        dataMap[item.symbol] = item;
      });
      setOrderBookMap(dataMap);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch order book data:', error);
      setError('Failed to fetch order book data. Please try again later.');
      setLoading(false);
    }
  };
  // Function to fetch only the updates since last fetch
  const fetchOrderBookUpdates = async () => {
    try {
      // Only fetch updates if we have a valid lastUpdateTime
      if (lastUpdateTime === 0) {
        await fetchOrderBookData();
        return;
      }
      
      console.log('Fetching partial updates since', new Date(lastUpdateTime).toISOString());
      const updates = await getOrderBookUpdates(lastUpdateTime);
      
      if (!updates || updates.length === 0) {
        console.log('No updates available');
        return;
      }
      
      // Update the timestamp
      setLastUpdateTime(Date.now());
      
      // Apply updates to our existing data
      const updatedMap = { ...orderBookMap };
      
      updates.forEach(update => {
        updatedMap[update.symbol] = update;
      });
      
      setOrderBookMap(updatedMap);
      
      // Convert map back to array for rendering
      setOrderBookData(Object.values(updatedMap));
      
      console.log(`Applied ${updates.length} updates to order book data`);
    } catch (error) {
      console.error('Failed to fetch order book updates:', error);
      // If updates fail, try to get complete data
      await fetchOrderBookData();
    }
  };
  // Fetch the order book data from the backend on component load
  // and set up event listeners
  useEffect(() => {
    const init = async () => {
      // Initial data fetch
      await fetchOrderBookData();
    };

    // Call init function
    init().catch(console.error);

    // Set up order created event listener
    const unsubscribe = eventEmitter.on('orderCreated', async () => {
      console.log('Order created event received, fetching order book updates');
      await fetchOrderBookUpdates();
    });

    // Clean up event listener on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(10);  };

  // Transform orderBookData into the format expected by the table
  // Use useMemo to only recalculate when orderBookData changes  // Calculate price limits from reference price
  const calculatePriceLimits = (refPrice) => {
    const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;
    return {
      ceil: roundToTwoDecimals(refPrice * 1.07),
      floor: roundToTwoDecimals(refPrice * 0.93)
    };
  };

  const processedRows = React.useMemo(() => {
    if (!Array.isArray(orderBookData) || orderBookData.length === 0) {
      return [];
    }

    return orderBookData.map(stockData => {
      const refPrice = stockData.ref || 0;
      const { ceil, floor } = calculatePriceLimits(refPrice);
      
      return createData(
        stockData.symbol,
        refPrice,
        ceil,
        floor,
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
        <>          <TableContainer sx={{ maxHeight: 1000 }}><Table stickyHeader aria-label="sticky table"><TableHead><TableRow>
                  <TableCell rowSpan={2} style={{ minWidth: '100px', textAlign: 'center', borderRight: '3px solid #000' }}>Symbol</TableCell>
                  <TableCell rowSpan={2} style={{ minWidth: '50px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Ref</TableCell>
                  <TableCell rowSpan={2} style={{ minWidth: '50px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Ceil</TableCell>
                  <TableCell rowSpan={2} style={{ minWidth: '50px', textAlign: 'center', borderRight: '3px solid #000' }}>Floor</TableCell>
                  <TableCell colSpan={4} align="center" style={{ borderRight: '3px solid #000' }}>Bid</TableCell>
                  <TableCell colSpan={2} align="center" style={{ borderRight: '3px solid #000' }}>Match</TableCell>
                  <TableCell colSpan={4} align="center">Ask</TableCell>
                </TableRow><TableRow>
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
                </TableRow>              </TableHead><TableBody sx={{ borderBottom: '1px solid #ccc' }}>
                {processedRows.length > 0 ? (
                  processedRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <OrderBookTableRow
                        key={row.Symbol || index}
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
              </TableBody></Table></TableContainer>
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