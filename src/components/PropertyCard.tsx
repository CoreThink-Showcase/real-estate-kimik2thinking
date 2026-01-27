import type { Property } from '../types/property';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  isSelected?: boolean;
  showDetails?: boolean;
}

export function PropertyCard({ property, onSelect, isSelected, showDetails = true }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className={`property-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(property)}
    >
      <div className="property-image">
        <img src={property.imageUrl} alt={property.address} />
        <div className="property-type-badge">{property.propertyType}</div>
        <div className="property-price">{formatPrice(property.price)}</div>
      </div>
      
      <div className="property-content">
        <h3 className="property-address">{property.address}</h3>
        <p className="property-location">{property.city}, {property.state} {property.zipCode}</p>
        
        <div className="property-stats">
          <div className="stat">
            <span className="stat-value">{property.bedrooms}</span>
            <span className="stat-label">Beds</span>
          </div>
          <div className="stat">
            <span className="stat-value">{property.bathrooms}</span>
            <span className="stat-label">Baths</span>
          </div>
          <div className="stat">
            <span className="stat-value">{property.squareFeet.toLocaleString()}</span>
            <span className="stat-label">Sq Ft</span>
          </div>
          <div className="stat">
            <span className="stat-value">{property.yearBuilt}</span>
            <span className="stat-label">Built</span>
          </div>
        </div>

        {showDetails && (
          <>
            <p className="property-description">{property.description}</p>
            
            <div className="property-features">
              {property.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="feature-tag">{feature}</span>
              ))}
              {property.features.length > 3 && (
                <span className="feature-tag more">+{property.features.length - 3} more</span>
              )}
            </div>

            <div className="property-scores">
              <div className="score">
                <span className="score-label">Neighborhood</span>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ width: `${(property.neighborhoodScore / 10) * 100}%` }}
                  />
                </div>
                <span className="score-value">{property.neighborhoodScore}</span>
              </div>
              <div className="score">
                <span className="score-label">Schools</span>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ width: `${(property.schoolRating / 10) * 100}%` }}
                  />
                </div>
                <span className="score-value">{property.schoolRating}</span>
              </div>
            </div>

            <div className="property-costs">
              <div className="cost-item">
                <span className="cost-label">Monthly Costs:</span>
                <span className="cost-value">
                  Est. ${Math.round((property.price * 0.006) + (property.propertyTax / 12) + (property.hoaFees || 0)).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}