// Daily Digest Email Template for YourToyotaPicks
// React Email component for daily vehicle match notifications

import * as React from 'react';
import type { Vehicle } from '../types';

interface DailyDigestEmailProps {
  vehicles: Vehicle[];
  totalCount: number;
}

export function DailyDigestEmail({ vehicles, totalCount }: DailyDigestEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage) + ' mi';
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'High Priority';
    if (score >= 60) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        backgroundColor: '#f3f4f6',
        margin: 0,
        padding: 0,
      }}>
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            padding: '32px 24px',
            textAlign: 'center' as const,
          }}>
            <h1 style={{
              color: '#ffffff',
              margin: '0 0 8px 0',
              fontSize: '28px',
              fontWeight: '700',
            }}>
              Daily Vehicle Digest
            </h1>
            <p style={{
              color: '#dbeafe',
              margin: 0,
              fontSize: '16px',
            }}>
              {totalCount} new vehicle match{totalCount !== 1 ? 'es' : ''} found today
            </p>
          </div>

          {/* Main Content */}
          <div style={{ padding: '24px' }}>
            {/* Intro Text */}
            <p style={{
              fontSize: '16px',
              color: '#4b5563',
              marginTop: 0,
              marginBottom: '24px',
            }}>
              We found {totalCount} new vehicle{totalCount !== 1 ? 's' : ''} matching your criteria today.
              Here {totalCount === 1 ? 'is' : 'are'} the top {Math.min(vehicles.length, 5)} sorted by priority score:
            </p>

            {/* Vehicle Cards */}
            {vehicles.map((vehicle, index) => {
              const imageUrl = vehicle.images_url?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
              const year = vehicle.year;
              const make = vehicle.make;
              const model = vehicle.model;
              const title = `${year} ${make} ${model}`;

              return (
                <div key={vehicle.id} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: index < vehicles.length - 1 ? '20px' : '0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}>
                  {/* Vehicle Image */}
                  <img
                    src={imageUrl}
                    alt={title}
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover' as const,
                      display: 'block',
                    }}
                  />

                  {/* Vehicle Info */}
                  <div style={{ padding: '20px' }}>
                    {/* Priority Badge */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: getPriorityColor(vehicle.priority_score),
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {getPriorityLabel(vehicle.priority_score)} ({vehicle.priority_score})
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      margin: '0 0 12px 0',
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#111827',
                    }}>
                      {title}
                    </h2>

                    {/* Key Details Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '4px',
                        }}>
                          Price
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#2563eb',
                        }}>
                          {formatCurrency(vehicle.price)}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '4px',
                        }}>
                          Mileage
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827',
                        }}>
                          {formatMileage(vehicle.mileage)}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      marginBottom: '4px',
                    }}>
                      <strong>Location:</strong> {vehicle.current_location} ({vehicle.distance_miles} mi away)
                    </div>
                    {vehicle.dealer_name && (
                      <div style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        marginBottom: '4px',
                      }}>
                        <strong>Dealer:</strong> {vehicle.dealer_name}
                      </div>
                    )}
                    <div style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      marginBottom: '16px',
                    }}>
                      <strong>Owners:</strong> {vehicle.owner_count} | <strong>Accidents:</strong> {vehicle.accident_count}
                      {vehicle.mileage_rating && (
                        <> | <strong>Mileage Rating:</strong> {vehicle.mileage_rating}</>
                      )}
                    </div>

                    {/* View Details Button */}
                    <a
                      href={vehicle.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'center' as const,
                      }}
                    >
                      View Full Details
                    </a>
                  </div>
                </div>
              );
            })}

            {/* View More Section */}
            {totalCount > vehicles.length && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                textAlign: 'center' as const,
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {totalCount - vehicles.length} more vehicle{totalCount - vehicles.length !== 1 ? 's' : ''} available in your dashboard
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '24px',
            backgroundColor: '#f9fafb',
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center' as const,
            }}>
              This is your daily digest from YourToyotaPicks
            </p>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#9ca3af',
              textAlign: 'center' as const,
            }}>
              To adjust your notification preferences, please update your configuration settings.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

export default DailyDigestEmail;
