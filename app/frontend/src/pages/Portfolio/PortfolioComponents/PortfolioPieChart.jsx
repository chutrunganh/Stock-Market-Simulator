import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import './PortfolioPieChart.css';

const PortfolioPieChart = ({ 
    holdings, 
    totalValue, 
    chartView, 
    onChartViewChange, 
    highlightedSlice, 
    onSliceClick 
}) => {
    // Function to group holdings by industry
    const getIndustryData = () => {
        const industryGroups = holdings.reduce((groups, holding) => {
            const industry = holding.industry || 'Other';
            if (!groups[industry]) {
                groups[industry] = 0;
            }
            groups[industry] += holding.holding_value;
            return groups;
        }, {});

        return Object.entries(industryGroups).map(([industry, value], idx) => ({
            id: idx,
            value: value,
            label: industry,
        }));
    };

    // Get chart data based on current view
    const getChartData = () => {
        if (holdings.length === 0) {
            return [{ id: 1, value: 1, label: 'No Holdings', arcLabel: '' }];
        }

        if (chartView === 'symbol') {
            return holdings.map((holding, idx) => ({
                id: holding.holding_id || idx,
                value: holding.holding_value,
                label: holding.symbol,
            }));
        } else {
            return getIndustryData();
        }
    };

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
                        data: getChartData(),
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