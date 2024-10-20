import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './InteractiveFilter.css'; // Dodaj plik CSS dla styli

const InteractiveFilter = () => {
  const [filters, setFilters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertyValues, setPropertyValues] = useState({});
  const [operators, setOperators] = useState({});
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [showSelectedFilters, setShowSelectedFilters] = useState(false);
  const [countdown, setCountdown] = useState({}); // Stan dla odliczania
  const [isSliderActive, setIsSliderActive] = useState({}); // Stan dla aktywności suwaka
  const [sliderValues, setSliderValues] = useState({}); // Stan dla wartości suwaka
  const [editingFilter, setEditingFilter] = useState(null); // Stan dla edytowanego filtra
  const [isLoading, setIsLoading] = useState(false); // Stan dla informacji o ładowaniu

  const timeoutRef = useRef(null); // Ref do przechowywania ID timeoutu

  const fetchPropertyValues = (propertyName) => {
    if (!propertyValues[propertyName]) {
      setIsLoading(true); // Ustaw stan ładowania na true
      axios.get('/api/property-values', { params: { property_name: propertyName } })
        .then((response) => {
          // Calculate min and max values for slider
          const values = response.data.map(item => parseFloat(item.property_value));
          const min = Math.min(...values);
          const max = Math.max(...values);

          setPropertyValues((prevValues) => ({
            ...prevValues,
            [propertyName]: {
              values: response.data,
              min: min,
              max: max,
            },
          }));
          setIsLoading(false); // Ustaw stan ładowania na false po zakończeniu żądania
        })
        .catch((error) => {
          console.error('Error fetching property values:', error);
          setIsLoading(false); // Ustaw stan ładowania na false w przypadku błędu
        });
    }
  };

  useEffect(() => {
    axios.get('/api/properties')
      .then((response) => {
        const sortedProperties = response.data.sort((a, b) => b.priority - a.priority);
        setAvailableProperties(sortedProperties.map(property => ({ ...property, isSelected: false })));
        setVisibleProperties(sortedProperties.slice(0, 3));
        sortedProperties.slice(0, 3).forEach(property => {
          fetchPropertyValues(property.property_name);
        });
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
      });
  }, []);

  useEffect(() => {
    visibleProperties.forEach(property => {
      fetchPropertyValues(property.property_name);
    });
  }, [visibleProperties, fetchPropertyValues]);

  const handleOperatorChange = (property, operator) => {
    setOperators((prevOperators) => ({
      ...prevOperators,
      [property]: operator,
    }));

    // Resetuj timeout, gdy operator się zmienia
    resetCountdown(property);
  };

  const handleFilterChange = (property, value) => {
    const operator = operators[property] || 'equal';

    // Sprawdź, czy filtr dla tej właściwości już istnieje
    const existingFilterIndex = filters.findIndex((filter) => filter.property === property);

    if (existingFilterIndex !== -1) {
      // Zaktualizuj istniejący filtr
      const updatedFilters = [...filters];
      updatedFilters[existingFilterIndex] = { property, value, operator };
      setFilters(updatedFilters);
    } else {
      // Dodaj nowy filtr
      setFilters([...filters, { property, value, operator }]);
    }

    setAvailableProperties(prevProperties =>
      prevProperties.map(p =>
        p.property_name === property ? { ...p, isSelected: true } : p
      )
    );

    // Ustaw stan ładowania
    setIsLoading(true);

    axios
      .get('/api/filter', { params: { filters: JSON.stringify(filters) } })
      .then((response) => {
        setMaterials(response.data.filteredMaterials);
        setSuggestions(response.data.suggestions);
        setIsLoading(false); // Zresetuj stan ładowania po zakończeniu
      })
      .catch((error) => {
        console.error('Error fetching filtered materials:', error);
        setIsLoading(false); // Zresetuj stan ładowania w przypadku błędu
      });

    // Resetuj timeout i ukryj właściwość po 5 sekundach, pokazując nową
    resetCountdown(property);
  };

  const handleSliderChange = (property, event) => {
    const value = parseFloat(event.target.value);
    handleFilterChange(property, value);

    // Ustaw stan sliderValue dla danej właściwości
    setSliderValues((prevValues) => ({
      ...prevValues,
      [property]: value,
    }));
  };

  const handleEditFilter = (filter) => {
    setEditingFilter(filter);
  };

  const handleSaveEditedFilter = () => {
    // Zaktualizuj filtry
    const updatedFilters = filters.map(f => 
      f.property === editingFilter.property ? editingFilter : f
    );
    setFilters(updatedFilters);

    // Wyślij zaktualizowane filtry do backendu
    axios
      .get('/api/filter', { params: { filters: JSON.stringify(updatedFilters) } })
      .then((response) => {
        setMaterials(response.data.filteredMaterials);
        setSuggestions(response.data.suggestions);
      })
      .catch((error) => {
        console.error('Error fetching filtered materials:', error);
      });

    setEditingFilter(null);
  };

  const handleDeleteFilter = (index) => {
    const newFilters = [...filters];
    const removedFilter = newFilters.splice(index, 1)[0];
    setFilters(newFilters);

    setAvailableProperties(prevProperties =>
      prevProperties.map(p =>
        p.property_name === removedFilter.property ? { ...p, isSelected: false } : p
      )
    );

    axios
      .get('/api/filter', { params: { filters: JSON.stringify(newFilters) } })
      .then((response) => {
        setMaterials(response.data.filteredMaterials);
        setSuggestions(response.data.suggestions);
      })
      .catch((error) => {
        console.error('Error fetching filtered materials:', error);
      });
  };

  const showNextProperty = () => {
    // Znajdź indeks pierwszej widocznej właściwości
    const currentPropertyIndex = availableProperties.findIndex(p => p.property_name === visibleProperties[0].property_name);

    // Pobierz następne 3 właściwości, które nie są zaznaczone
    const nextProperties = availableProperties
      .slice(currentPropertyIndex + 1) // Pomijamy aktualnie widoczne właściwości
      .filter(prop => !prop.isSelected)
      .slice(0, 3);

    setVisibleProperties(nextProperties);
  };

  const skipProperty = () => {
    setAvailableProperties(prevProps => {
      const [current, ...rest] = prevProps.filter(p => !p.isSelected);
      return [...rest, current];
    });

    showNextProperty();
  };

  // Funkcja do resetowania odliczania
  const resetCountdown = (property) => {
    clearTimeout(timeoutRef.current);
    setCountdown((prevCountdown) => ({
      ...prevCountdown,
      [property]: 5, // Ustaw odliczanie na 5 sekund
    }));

    timeoutRef.current = setTimeout(() => {
      setVisibleProperties(prevVisible => {
        const updatedVisible = prevVisible.filter(p => p.property_name !== property);
        const nextPropertyIndex = availableProperties.findIndex(p => !p.isSelected && !updatedVisible.includes(p));
        if (nextPropertyIndex !== -1) {
          updatedVisible.push(availableProperties[nextPropertyIndex]);
          setAvailableProperties(prevAvailable => {
            const updatedAvailable = [...prevAvailable];
            updatedAvailable[nextPropertyIndex].isSelected = true;
            return updatedAvailable;
          });
        }
        return updatedVisible;
      });
      setCountdown((prevCountdown) => ({
        ...prevCountdown,
        [property]: 0, // Zresetuj odliczanie
      }));
    }, 5000);
  };

  // useEffect do odliczania
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisibleProperties(prevVisible => {
        return prevVisible.map(property => {
          if (countdown[property.property_name] > 0 && !isSliderActive[property.property_name]) {
            return {
              ...property,
              countdown: countdown[property.property_name] - 1,
            };
          }
          return property;
        });
      });
      setCountdown((prevCountdown) => {
        return Object.fromEntries(
          Object.entries(prevCountdown).map(([property, time]) => [
            property,
            time > 0 && !isSliderActive[property] ? time - 1 : time,
          ])
        );
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown, isSliderActive, fetchPropertyValues]);

  return (
    <div className="interactive-filter">
      <h3>Select properties to filter materials:</h3>

      <div className="property-list">
        {visibleProperties.map((property) => (
          <div key={property.property_name} className="property-item">
            <h4>
              {property.property_name}
              {countdown[property.property_name] > 0 && (
                <span
                  className="countdown"
                  style={{
                    width: `${(countdown[property.property_name] / 5) * 100}%`,
                    backgroundColor: `hsl(${120 * (countdown[property.property_name] / 5)}, 100%, 50%)`, // Zmień kolor w zależności od odliczania
                  }}
                >
                  {countdown[property.property_name]}
                </span>
              )}
            </h4>

            <div>
              <button
                onClick={() => handleOperatorChange(property.property_name, 'lessThanOrEqual')}
                style={{ backgroundColor: operators[property.property_name] === 'lessThanOrEqual' ? 'lightblue' : '' }}
              >
                ≤ 
              </button>
              <button
                onClick={() => handleOperatorChange(property.property_name, 'equal')}
                style={{ backgroundColor: operators[property.property_name] === 'equal' ? 'lightblue' : '' }}
              >
                =
              </button>
              <button
                onClick={() => handleOperatorChange(property.property_name, 'greaterThanOrEqual')}
                style={{ backgroundColor: operators[property.property_name] === 'greaterThanOrEqual' ? 'lightblue' : '' }}
              >
                ≥
              </button>
            </div>

            {propertyValues[property.property_name] ? (
              <div>
                {propertyValues[property.property_name].values.length > 10 ? (
                  <div className="slider-container">
                    <input
                      type="range"
                      min={propertyValues[property.property_name].min}
                      max={propertyValues[property.property_name].max}
                      step={0.01}
                      onChange={(e) => handleSliderChange(property.property_name, e)}
                      onMouseDown={() => setIsSliderActive((prev) => ({ ...prev, [property.property_name]: true }))}
                      onMouseUp={() => setIsSliderActive((prev) => ({ ...prev, [property.property_name]: false }))}
                      onMouseLeave={() => setIsSliderActive((prev) => ({ ...prev, [property.property_name]: false }))}
                    />
                    <span className="slider-value">{sliderValues[property.property_name]}</span> {/* Wyświetl wartość suwaka */}
                  </div>
                ) : (
                  propertyValues[property.property_name].values.map((value, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange(property.property_name, value.property_value)}
                      disabled={filters.some(f => f.property === property.property_name && f.value === value.property_value)} // Wyłącz przycisk, jeśli filtr już istnieje
                    >
                      {value.property_value}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <p>Loading values...</p>
            )}
            <button onClick={skipProperty}>Skip</button> 
          </div>
        ))}
      </div>

      <button onClick={() => setShowSelectedFilters(!showSelectedFilters)}>
        {showSelectedFilters ? 'Hide' : 'Show'} Selected Filters
      </button>

      {showSelectedFilters && (
        <div>
          <h3>Selected Filters:</h3>
          <ul>
            {filters.map((filter, index) => (
              <li key={index}>
                {filter.property}: {filter.value} ({filter.operator})
                <button onClick={() => handleEditFilter(filter)}>Edit</button>
                <button onClick={() => handleDeleteFilter(index)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3>Filtered Materials: {isLoading && <span className="loading">Updating...</span>}</h3>
      <ul>
        {materials.map((material) => (
          <li key={material.id}>
            {material.name} - {material.category_name} - {material.type_name} 
            {/* Dodaj więcej informacji o materiale */}
          </li>
        ))}
      </ul>

      {/* Sekcja dla sugestii */}
      {suggestions.length > 0 && (
        <div>
          <h3>Suggestions:</h3>
          <ul>
            {suggestions.map((material) => (
              <li key={material.id}>
                {material.name} - {material.category_name} - {material.type_name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popup do edycji filtra */}
      {editingFilter && (
        <div className="edit-filter-popup">
          <h3>Edit Filter: {editingFilter.property}</h3>
          <div>
            <label htmlFor="operator">Operator:</label>
            <select 
              id="operator" 
              value={editingFilter.operator} 
              onChange={(e) => setEditingFilter({ ...editingFilter, operator: e.target.value })}
            >
              <option value="lessThanOrEqual">≤</option>
              <option value="equal">=</option>
              <option value="greaterThanOrEqual">≥</option>
            </select>
          </div>
          <div>
            <label htmlFor="value">Value:</label>
            <input 
              type="text" 
              id="value" 
              value={editingFilter.value} 
              onChange={(e) => setEditingFilter({ ...editingFilter, value: e.target.value })}
            />
          </div>
          <button onClick={handleSaveEditedFilter}>Save</button>
          <button onClick={() => setEditingFilter(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default InteractiveFilter;
