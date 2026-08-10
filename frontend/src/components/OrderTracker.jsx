import {
  Check,
  ClipboardCheck,
  PackageCheck,
  Truck,
  House,
  X,
} from 'lucide-react';
import './OrderTracker.css';

const STEPS = [
  { key: 'pending', label: 'Order placed', icon: ClipboardCheck },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: PackageCheck },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: House },
];

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

export default function OrderTracker({ status, statusHistory = [] }) {
  if (status === 'cancelled') {
    const cancelledEntry = [...statusHistory]
      .reverse()
      .find((entry) => entry.status === 'cancelled');

    return (
      <div className="order-tracker-cancelled">
        <div className="order-tracker-cancelled__icon">
          <X size={22} />
        </div>
        <div>
          <strong>Order cancelled</strong>
          <p>
            {cancelledEntry?.changedAt
              ? formatDate(cancelledEntry.changedAt)
              : 'This order is no longer active.'}
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <div className="order-tracker">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const completed = index <= currentIndex;
        const historyEntry = statusHistory.find(
          (entry) => entry.status === step.key
        );

        return (
          <div
            className={`order-tracker__step ${
              completed ? 'order-tracker__step--completed' : ''
            }`}
            key={step.key}
          >
            <div className="order-tracker__line" />
            <div className="order-tracker__circle">
              <Icon size={18} />
            </div>
            <div className="order-tracker__text">
              <strong>{step.label}</strong>
              <span>
                {historyEntry?.changedAt
                  ? formatDate(historyEntry.changedAt)
                  : 'Waiting'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
