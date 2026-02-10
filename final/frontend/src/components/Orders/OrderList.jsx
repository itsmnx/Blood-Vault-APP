import React, { useState } from 'react';
import { AlertCircle, TrendingUp, Package } from 'lucide-react';
import OrderForm from './OrderForm';
import * as api from '../../services/api';

export default function OrderList({ orders, recipients, inventory, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  // ✅ Create new order
  const handleCreate = async (data) => {
    try {
      await api.createOrder(token, data);
      onRefresh();
      setShowForm(false);
      alert('✅ Order created and units reserved!');
    } catch (error) {
      alert('❌ ' + (error.message || 'Failed to create order.'));
    }
  };

  // ✅ Fulfill single order
  const handleFulfill = async (orderId) => {
    if (!window.confirm('Are you sure you want to fulfill this order?')) return;
    try {
      await api.fulfillOrder(token, orderId);
      onRefresh();
      alert('✅ Order fulfilled successfully!');
    } catch (error) {
      alert('❌ ' + (error.message || 'Failed to fulfill order.'));
    }
  };

  // ✅ Auto-fulfill orders via ML
  const handleAutoFulfill = async () => {
    if (
      !window.confirm(
        'Auto-fulfill will process pending orders based on recipient priority. Continue?'
      )
    )
      return;

    try {
      const result = await api.autoFulfillOrders(token);
      alert(
        `✅ Auto-fulfill complete!\n\nFulfilled: ${result.fulfilled} orders\nSkipped: ${result.skipped} orders`
      );
      onRefresh();
    } catch (error) {
      alert('❌ ' + (error.message || 'Auto-fulfill failed.'));
    }
  };

  // ✅ Filter orders
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'fulfilled') return o.status === 'fulfilled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ➕ Create Order */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          Create New Order
        </button>
      )}

      {/* 🧾 Order Creation Form */}
      {showForm && (
        <OrderForm
          recipients={recipients}
          inventory={inventory}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* 🤖 Auto-Fulfill Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🤖 AI-Powered Auto-Fulfill
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Automatically fulfill pending orders based on ML priority ranking.
            </p>
          </div>
          <button
            onClick={handleAutoFulfill}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Auto-Fulfill Orders
          </button>
        </div>
      </div>

      {/* 📦 Orders Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Filters */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-gray-800">Blood Orders</h2>
          <div className="flex gap-3 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending Only</option>
              <option value="fulfilled">Fulfilled Only</option>
            </select>

            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              {orders.filter((o) => o.status === 'pending').length} Pending
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {orders.filter((o) => o.status === 'fulfilled').length} Fulfilled
            </span>
          </div>
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders
              .sort((a, b) => {
                if (a.status !== b.status)
                  return a.status === 'pending' ? -1 : 1;
                return (
                  (b.recipientId?.predictedPriority || 0) -
                  (a.recipientId?.predictedPriority || 0)
                );
              })
              .map((order) => (
                <div
                  key={order._id}
                  className={`p-4 border-2 rounded-lg hover:shadow-md transition ${
                    order.status === 'pending'
                      ? 'border-yellow-200 bg-yellow-50'
                      : order.status === 'fulfilled'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-lg text-gray-800">
                          {order.recipientId?.fullName || 'Unknown Recipient'}
                        </p>

                        {/* Priority Badge */}
                        {order.recipientId?.predictedPriority && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              order.recipientId.predictedPriority >= 80
                                ? 'bg-red-500 text-white'
                                : order.recipientId.predictedPriority >= 60
                                ? 'bg-orange-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }`}
                          >
                            Priority: {order.recipientId.predictedPriority}%
                          </span>
                        )}

                        {/* Fulfilled Badge */}
                        {order.status === 'fulfilled' && (
                          <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                            ✓ Fulfilled
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {order.bloodType} • {order.component} •{' '}
                        {order.unitsRequested} units
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.fulfilledAt && (
                        <p className="text-xs text-green-700 mt-1 font-semibold">
                          Fulfilled: {new Date(
                            order.fulfilledAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Fulfill Button */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleFulfill(order._id)}
                        className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Fulfill Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
