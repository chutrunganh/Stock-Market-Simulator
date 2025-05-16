import React, { useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import './PortfolioPieChart.css';

// Industry colors mapping
const INDUSTRY_COLORS = {
    'Technology': '#4285f4',      // Google Blue
    'Financials': '#34a853',     // Google Green
    'Real Estate': '#fbbc05',    // Google Yellow
    'Energy': '#ea4335',         // Google Red
    'Consumer Discretionary': '#9467bd', // Purple
    'Automotive': '#ff7043',     // Deep Orange
    'Semiconductors': '#00acc1', // Cyan
    'Other': '#7f7f7f'          // Gray
};

const PortfolioPieChart = ({ 
    holdings, 
    totalValue, 
    chartView, 
    onChartViewChange, 
    highlightedSlice, 
    onSliceClick 
}) => {
    useEffect(() => {
        console.log('Current holdings:', holdings);
        console.log('Total value:', totalValue);
    }, [holdings, totalValue]);
    // Function to group holdings by industry
    const getIndustryData = () => {
        console.log('Processing holdings for pie chart:', holdings);
        
        // First, log all unique industries
        const uniqueIndustries = [...new Set(holdings.map(h => h.industry))];
        console.log('Unique industries found:', uniqueIndustries);

        const industryGroups = holdings.reduce((groups, holding) => {
            const industry = holding.industry || 'Other';
            if (!groups[industry]) {
                groups[industry] = 0;
            }
            // Convert string to number and ensure it's a valid number
            const value = parseFloat(holding.holding_value) || 0;
            groups[industry] = (groups[industry] || 0) + value;
            console.log(`Adding ${holding.symbol} (${industry}): ${value} to total: ${groups[industry]}`);
            return groups;
        }, {});

        console.log('Industry groups before processing:', industryGroups);

        const sortedData = Object.entries(industryGroups)
            .filter(([_, value]) => value > 0) // Only include industries with positive values
            .sort((a, b) => b[1] - a[1]) // Sort by value in descending order
            .map(([industry, value], idx) => {
                const percentage = ((value / totalValue) * 100).toFixed(1);
                console.log(`Creating pie slice for ${industry}: ${value} (${percentage}%)`);
                return {
                    id: idx,
                    value: value,
                    label: `${industry} (${percentage}%)`,
                    color: INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Other
                };
            });

        console.log('Final sorted industry data:', sortedData);
        return sortedData;
    };

    // Get chart data based on current view
    const getChartData = () => {
        if (holdings.length === 0) {
            return [{ id: 1, value: 1, label: 'No Holdings', arcLabel: '' }];
        }

        if (chartView === 'symbol') {
            return holdings
                .sort((a, b) => b.holding_value - a.holding_value)
                .map((holding, idx) => ({
                    id: holding.holding_id || idx,
                    value: holding.holding_value,
                    label: holding.symbol,
                    color: INDUSTRY_COLORS[holding.industry] || INDUSTRY_COLORS.Other
                }));
        } else {
            return getIndustryData();
        }
    };

    const chartData = getChartData();
    console.log('Final chart data:', chartData);

    return (
        <div className="portfolio-pie-chart">
            <div className='chart-header'>
                <Typography variant='h5'>Portfolio Allocation</Typography>
                <ToggleButtonGroup
                    value={chartView}
                    exclusive
                    onChange={(e, newView) => newView && onChartViewChange(newView)}
                    size="small"
                >
                    <ToggleButton value="symbol">
                        Symbol
                    </ToggleButton>
                    <ToggleButton value="industry">
                        Industry
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <PieChart
                series={[
                    {
                        arcLabel: (item) => `${((item.value / totalValue) * 100).toFixed(1)}%`,
                        arcLabelMinAngle: 45,
                        innerRadius: 70,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        startAngle: -90,
                        endAngle: 270,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { innerRadius: 70, additionalRadius: -30, color: 'gray' },
                        data: chartData,
                    }
                ]}
                slotProps={{
                    legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                        padding: 0,
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                        markGap: 5,
                        itemGap: 15,
                        labelStyle: {
                            fontSize: 12,
                        },
                    }
                }}
                width={500}
                height={400}
                margin={{ top: 20, bottom: 100, left: 20, right: 20 }}
                tooltip={{ trigger: 'item' }}
                onItemClick={(_, item) => onSliceClick(item.dataIndex)}
                highlighted={highlightedSlice}
            />
        </div>
    );
};

export default PortfolioPieChart; 