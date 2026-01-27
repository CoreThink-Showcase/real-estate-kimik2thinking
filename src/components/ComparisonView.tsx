import type { Property, PropertyComparison } from '../types/property';
import './ComparisonView.css';

interface ComparisonViewProps {
  comparison: PropertyComparison;
  onClose: () => void;
}

export function ComparisonView({ comparison, onClose }: ComparisonViewProps) {
  const { properties, tradeoffs, recommendation } = comparison;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="comparison-overlay">
      <div className="comparison-modal">
        <div className="comparison-header">
          <h2>Property Comparison</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comparison-content">
          {/* Property Cards Side by Side */}
          <div className="comparison-properties">
            {properties.map((property) => (
              <div key={property.id} className="comparison-property">
                <img src={property.imageUrl} alt={property.address} />
                <h3>{property.address}</h3>
                <p className="property-city">{property.city}, {property.state}</p>
                <div className="comparison-price">{formatPrice(property.price)}</div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="comparison-table">
            <div className="comparison-row header">
              <div className="comparison-label">Feature</div>
              {properties.map((p) => (
                <div key={p.id} className="comparison-value">{p.address.split(' ')[0]}...</div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Price</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'price', p.id, 'min')}`}>
                  {formatPrice(p.price)}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Bedrooms</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'bedrooms', p.id, 'max')}`}>
                  {p.bedrooms}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Bathrooms</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'bathrooms', p.id, 'max')}`}>
                  {p.bathrooms}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Square Feet</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'squareFeet', p.id, 'max')}`}>
                  {p.squareFeet.toLocaleString()}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Price/SqFt</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'pricePerSqFt', p.id, 'min')}`}>
                  {formatCurrency(p.price / p.squareFeet)}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Year Built</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'yearBuilt', p.id, 'max')}`}>
                  {p.yearBuilt}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Commute Time</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'commuteTime', p.id, 'min')}`}>
                  {p.commuteTime} min
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">School Rating</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'schoolRating', p.id, 'max')}`}>
                  {p.schoolRating}/10
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Neighborhood</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'neighborhoodScore', p.id, 'max')}`}>
                  {p.neighborhoodScore}/10
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Annual Tax</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'propertyTax', p.id, 'min')}`}>
                  {formatCurrency(p.propertyTax)}
                </div>
              ))}
            </div>

            <div className="comparison-row">
              <div className="comparison-label">HOA Fees</div>
              {properties.map((p) => (
                <div key={p.id} className={`comparison-value ${getBestValue(properties, 'hoaFees', p.id, 'min')}`}>
                  {p.hoaFees ? formatCurrency(p.hoaFees) + '/mo' : 'None'}
                </div>
              ))}
            </div>
          </div>

          {/* Tradeoff Analysis */}
          <div className="tradeoff-section">
            <h3>Tradeoff Analysis</h3>
            <div className="tradeoff-list">
              {tradeoffs.map((tradeoff, index) => (
                <div key={index} className="tradeoff-item">
                  <div className="tradeoff-category">{tradeoff.category}</div>
                  <div className="tradeoff-winner">
                    <span className="winner-badge">Winner</span>
                    {tradeoff.winner}
                  </div>
                  <p className="tradeoff-explanation">{tradeoff.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="recommendation-section">
            <h3>AI Recommendation</h3>
            <div className="recommendation-box">
              <div className="recommendation-icon">💡</div>
              <p>{recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBestValue(
  properties: Property[],
  key: keyof Property | 'pricePerSqFt',
  currentId: string,
  mode: 'min' | 'max'
): string {
  let values: number[];
  
  if (key === 'pricePerSqFt') {
    values = properties.map((p) => p.price / p.squareFeet);
  } else if (key === 'hoaFees') {
    values = properties.map((p) => p.hoaFees || 0);
  } else {
    values = properties.map((p) => p[key as keyof Property] as number);
  }

  const bestValue = mode === 'min' ? Math.min(...values) : Math.max(...values);
  const currentProperty = properties.find((p) => p.id === currentId)!;
  
  let currentValue: number;
  if (key === 'pricePerSqFt') {
    currentValue = currentProperty.price / currentProperty.squareFeet;
  } else if (key === 'hoaFees') {
    currentValue = currentProperty.hoaFees || 0;
  } else {
    currentValue = currentProperty[key as keyof Property] as number;
  }

  return currentValue === bestValue ? 'best' : '';
}