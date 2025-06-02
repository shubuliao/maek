import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  TrashIcon, 
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useFundState, useUpdateNav } from '../../hooks/useFundData';
import { 
  formatCurrency, 
  formatNumber,
  formatPercentage, 
  parseUserInput,
  bnToNumber, 
  formatDate,
  formatNAV
} from '../../utils/formatting';
import { AssetValuation } from '../../types';

// Form validation schema
const navUpdateSchema = z.object({
  assetValuations: z.array(z.object({
    assetId: z.string().min(32, 'Invalid asset ID'),
    currentValue: z.string().min(1, 'Value is required'),
  })).min(1, 'At least one asset valuation is required'),
  netDailyPnl: z.string().refine(
    (val) => parseUserInput(val) !== null,
    'Invalid P&L amount'
  ),
  notes: z.string().optional(),
});

type NavUpdateFormData = z.infer<typeof navUpdateSchema>;

const NavUpdatePanel: React.FC = () => {
  const { data: fundState, isLoading: fundLoading } = useFundState();
  const updateNavMutation = useUpdateNav();
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<NavUpdateFormData>({
    resolver: zodResolver(navUpdateSchema),
    defaultValues: {
      assetValuations: [{ assetId: '', currentValue: '' }],
      netDailyPnl: '0',
      notes: '',
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assetValuations',
  });

  const watchedValues = watch();

  // Calculate new NAV preview
  const navPreview = useMemo(() => {
    if (!fundState || !watchedValues.assetValuations?.length || !watchedValues.netDailyPnl) {
      return null;
    }

    try {
      const totalAssetValue = watchedValues.assetValuations.reduce((sum, asset) => {
        const value = parseUserInput(asset.currentValue);
        return sum + (value || 0);
      }, 0);

      const netPnl = parseUserInput(watchedValues.netDailyPnl) || 0;
      const currentTotalAssets = bnToNumber(fundState.totalAssets, 8);
      const totalShares = bnToNumber(fundState.totalShares, 8);
      
      const newTotalAssets = totalAssetValue + netPnl;
      const newNavPerShare = totalShares > 0 ? newTotalAssets / totalShares : 1.0;
      const currentNavPerShare = bnToNumber(fundState.navPerShare, 8);
      
      const change = ((newNavPerShare - currentNavPerShare) / currentNavPerShare) * 100;

      return {
        currentNav: currentNavPerShare,
        newNav: newNavPerShare,
        change,
        totalAssets: newTotalAssets,
        currentTotalAssets,
        isValid: newNavPerShare > 0 && Math.abs(change) < 5, // 5% max change safety check
      };
    } catch (error) {
      return null;
    }
  }, [fundState, watchedValues]);

  const onSubmit = async (data: NavUpdateFormData) => {
    if (!navPreview?.isValid) {
      toast.error('NAV calculation appears invalid. Please review your inputs.');
      return;
    }

    try {
      const assetValuations: AssetValuation[] = data.assetValuations.map(asset => ({
        assetId: new PublicKey(asset.assetId),
        currentValue: new BN(Math.floor((parseUserInput(asset.currentValue) || 0) * 100_000_000)),
      }));

      const netDailyPnl = parseUserInput(data.netDailyPnl) || 0;

      await updateNavMutation.mutateAsync({
        newAssetValuations: assetValuations,
        netDailyPnl,
      });

      toast.success('NAV updated successfully!');
      setShowPreview(false);
    } catch (error: any) {
      toast.error(`Failed to update NAV: ${error.message}`);
    }
  };

  if (fundLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Fund State */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Fund State</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Current NAV</h3>
            <p className="text-2xl font-bold text-gray-900">
              {fundState ? formatNAV(bnToNumber(fundState.navPerShare, 8)) : '--'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated {fundState ? new Date(bnToNumber(fundState.lastNavUpdate, 0) * 1000).toLocaleString() : '--'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Assets</h3>
            <p className="text-2xl font-bold text-gray-900">
              {fundState ? formatCurrency(bnToNumber(fundState.totalAssets, 8)) : '--'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {fundState ? formatNumber(fundState.totalDepositors) : '--'} depositors
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Shares</h3>
            <p className="text-2xl font-bold text-gray-900">
              {fundState ? formatNumber(bnToNumber(fundState.totalShares, 8)) : '--'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Outstanding fund tokens</p>
          </div>
        </div>
      </div>

      {/* NAV Update Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Update NAV</h2>
          <div className="flex items-center space-x-2">
            <CalculatorIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Daily valuation update</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Asset Valuations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Asset Valuations</h3>
              <button
                type="button"
                onClick={() => append({ assetId: '', currentValue: '' })}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm">Add Asset</span>
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset ID (Public Key)
                    </label>
                    <input
                      {...register(`assetValuations.${index}.assetId` as const)}
                      type="text"
                      placeholder="Asset public key..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.assetValuations?.[index]?.assetId && (
                      <p className="text-sm text-danger-600 mt-1">
                        {errors.assetValuations[index]?.assetId?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Value (USD)
                      </label>
                      <input
                        {...register(`assetValuations.${index}.currentValue` as const)}
                        type="text"
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.assetValuations?.[index]?.currentValue && (
                        <p className="text-sm text-danger-600 mt-1">
                          {errors.assetValuations[index]?.currentValue?.message}
                        </p>
                      )}
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-6 p-2 text-danger-600 hover:text-danger-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Net Daily P&L */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Net Daily P&L (USD)
            </label>
            <input
              {...register('netDailyPnl')}
              type="text"
              placeholder="0.00 (positive for profit, negative for loss)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.netDailyPnl && (
              <p className="text-sm text-danger-600 mt-1">{errors.netDailyPnl.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Enter positive values for gains, negative for losses
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Add any notes about this NAV update..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* NAV Preview */}
          {navPreview && (
            <div className={`border rounded-lg p-4 ${
              navPreview.isValid ? 'border-success-200 bg-success-50' : 'border-warning-200 bg-warning-50'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                {navPreview.isValid ? (
                  <CheckCircleIcon className="h-5 w-5 text-success-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
                )}
                <h4 className="text-sm font-medium">NAV Calculation Preview</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current NAV:</span>
                  <div className="font-medium">{formatNAV(navPreview.currentNav)}</div>
                </div>
                <div>
                  <span className="text-gray-600">New NAV:</span>
                  <div className="font-medium">{formatNAV(navPreview.newNav)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Change:</span>
                  <div className={`font-medium ${
                    navPreview.change > 0 ? 'text-success-600' : navPreview.change < 0 ? 'text-danger-600' : 'text-gray-600'
                  }`}>
                    {navPreview.change > 0 ? '+' : ''}{formatPercentage(navPreview.change)}
                  </div>
                </div>
              </div>

              {!navPreview.isValid && (
                <div className="mt-3 text-sm text-warning-700">
                  ⚠️ NAV change exceeds 5% safety threshold. Please review your inputs.
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              type="submit"
              disabled={!isValid || !navPreview?.isValid || updateNavMutation.isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {updateNavMutation.isLoading ? 'Updating...' : 'Update NAV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NavUpdatePanel; 