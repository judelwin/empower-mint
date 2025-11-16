import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../ui/Button.js';

interface WealthSimulatorProps {
  onExplain?: (params: {
    initialAmount: number;
    monthlyContribution: number;
    annualReturn: number;
    years: number;
  }) => Promise<string>;
  loading?: boolean;
}

export default function WealthSimulator({ onExplain, loading = false }: WealthSimulatorProps) {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(30);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [explaining, setExplaining] = useState(false);

  // Calculate wealth over time
  const dataPoints = useMemo(() => {
    const data: Array<{ year: number; value: number; contributions: number }> = [];
    let currentValue = initialAmount;
    const monthlyRate = annualReturn / 100 / 12;
    let totalContributions = initialAmount;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        // Compound for 12 months in this year
        for (let month = 0; month < 12; month++) {
          currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
          totalContributions += monthlyContribution;
        }
      }

      data.push({
        year,
        value: Math.round(currentValue),
        contributions: totalContributions,
      });
    }

    return data;
  }, [initialAmount, monthlyContribution, annualReturn, years]);

  const finalValue = dataPoints[dataPoints.length - 1]?.value || 0;
  const totalContributions = dataPoints[dataPoints.length - 1]?.contributions || 0;
  const gains = finalValue - totalContributions;

  const handleExplain = async () => {
    if (!onExplain) return;

    setExplaining(true);
    setAiExplanation('');
    try {
      const explanation = await onExplain({
        initialAmount,
        monthlyContribution,
        annualReturn,
        years,
      });
      setAiExplanation(explanation);
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
      setAiExplanation('Failed to generate explanation. Please try again.');
    } finally {
      setExplaining(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Wealth Simulator</h1>
        <p className="text-gray-600">
          See how compound interest works over time. Adjust the sliders to explore different scenarios.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Amount: {formatCurrency(initialAmount)}
          </label>
          <input
            type="range"
            min="0"
            max="100000"
            step="100"
            value={initialAmount}
            onChange={(e) => setInitialAmount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$100,000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Contribution: {formatCurrency(monthlyContribution)}
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>$2,000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Return: {annualReturn.toFixed(1)}%
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>15%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period: {years} years
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 year</span>
            <span>50 years</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Final Value</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(finalValue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Contributions</div>
          <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Investment Gains</div>
          <div className="text-2xl font-bold text-primary-600">{formatCurrency(gains)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Wealth Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dataPoints}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0284c7"
              strokeWidth={3}
              name="Total Value"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="contributions"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Contributions"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Explanation */}
      {onExplain && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Explanation</h2>
            <Button onClick={handleExplain} disabled={explaining || loading}>
              {explaining ? 'Generating...' : 'Get AI Explanation'}
            </Button>
          </div>
          {aiExplanation && (
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p>{aiExplanation}</p>
            </div>
          )}
          {!aiExplanation && !explaining && (
            <p className="text-gray-500 text-sm">
              Click "Get AI Explanation" to receive a personalized explanation of this simulation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

