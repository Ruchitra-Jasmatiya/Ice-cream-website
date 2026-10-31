import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext.jsx';


export default function FreshNFreezeShop() {
  const { products: storeProducts, categories: storeCategories, addToCart } = useStore();
  const [currentPage, setCurrentPage] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [showIngredients, setShowIngredients] = useState(null);
  const [priceFilter, setPriceFilter] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');
  const [sortBy, setSortBy] = useState('best-selling');
  const [visibleSections, setVisibleSections] = useState({});

  const sectionRefs = useRef({});
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [currentPage]);
  // Products & categories now come from the backend (/admin). Edit them there.
  const categories = storeCategories;
  const products = storeProducts;

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage('collection');
    setPriceFilter('all');
    setVegFilter('all');
    setSortBy('best-selling');
    setVisibleSections({});
  };
  const handleBackToShop = () => {
    setCurrentPage('shop');
    setSelectedCategory(null);
    setVisibleSections({});
  };
  const getFilteredProducts = () => {
    let filtered = currentPage === 'collection'
       ? products.filter(p => p.category === selectedCategory.name)
      : products;
    if (priceFilter === 'under-300') {
      filtered = filtered.filter(p => p.price < 300);
    } else if (priceFilter === 'above-300') {
      filtered = filtered.filter(p => p.price >= 300);
    }
    if (vegFilter === 'veg') {
      filtered = filtered.filter(p => p.vegetarian);
    }
    if (sortBy === 'low-high') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  };
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd0 50%, #fce4ec 100%)',
      padding: '50px 20px',
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif"
    },
    classificationSection: {
      background: 'linear-gradient(135deg, #f48fb1 0%, #ec407a 100%)',
      borderRadius: '20px',
      padding: '70px 40px',
      marginBottom: '80px',
      boxShadow: '0 20px 60px rgba(244, 143, 177, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    sectionTitle: {
      fontSize: '46px',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '15px',
      color: 'white',
      letterSpacing: '-1px',
      textShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    },
    sectionSubtitle: {
      fontSize: '18px',
      fontWeight: '400',
      textAlign: 'center',
      marginBottom: '60px',
      color: 'rgba(255, 255, 255, 0.95)',
      letterSpacing: '0.5px'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '35px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    categoryCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '0',
      cursor: 'pointer',
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 10px 30px rgba(244, 143, 177, 0.2)',
      overflow: 'hidden',
      opacity: 0
    },
    categoryImageWrapper: {
      width: '100%',
      height: '220px',
      overflow: 'hidden',
      position: 'relative'
    },
    categoryImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    categoryOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.9) 0%, rgba(236, 64, 122, 0.9) 100%)',
      opacity: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.4s ease'
    },
    exploreText: {
      color: 'white',
      fontSize: '18px',
      fontWeight: '700',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    categoryName: {
      fontSize: '17px',
      fontWeight: '700',
      color: '#333',
      textAlign: 'center',
      margin: '0',
      padding: '20px 15px',
      letterSpacing: '0.3px'
    },
    productsSection: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    productsSectionTitle: {
      fontSize: '42px',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '15px',
      background: 'linear-gradient(135deg, #ec407a 0%, #f48fb1 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-1px'
    },
    productsSectionSubtitle: {
      fontSize: '18px',
      fontWeight: '400',
      textAlign: 'center',
      marginBottom: '60px',
      color: '#666',
      letterSpacing: '0.5px'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '30px',
      padding: '20px 0'
    },
    productCard: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      opacity: 0
    },
    productImageWrapper: {
      width: '100%',
      height: '260px',
      overflow: 'hidden',
      position: 'relative',
      background: '#f5f5f5'
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    quickViewOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out'
    },
    quickViewText: {
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    productInfo: {
      padding: '20px'
    },
    productName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: '12px',
      letterSpacing: '-0.3px'
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    productPrice: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#ec407a',
      margin: 0
    },
    ingredientsBtn: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#10b981',
      background: '#d1fae5',
      padding: '6px 12px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    ingredientsPopup: {
      background: '#f9fafb',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '15px',
      border: '1px solid #e5e7eb',
      animation: 'fadeIn 0.3s ease-out'
    },
    ingredientsList: {
      margin: 0,
      paddingLeft: '20px',
      fontSize: '13px',
      color: '#555'
    },
    ingredientItem: {
      marginBottom: '6px'
    },
    addToCartBtn: {
      width: '100%',
      padding: '13px',
      background: 'linear-gradient(135deg, #ec407a 0%, #f48fb1 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 4px 15px rgba(244, 143, 177, 0.3)',
      letterSpacing: '0.5px'
    },
    collectionBanner: {
      padding: '80px 40px',
      borderRadius: '16px',
      marginBottom: '50px',
      textAlign: 'center',
      boxShadow: '0 15px 50px rgba(244, 143, 177, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    bannerContent: {
      position: 'relative',
      zIndex: 2
    },
    bannerTitle: {
      fontSize: '48px',
      fontWeight: '800',
      color: 'white',
      marginBottom: '12px',
      letterSpacing: '-1px',
      textShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
    },
    bannerSubtitle: {
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.95)',
      margin: 0,
      fontWeight: '400',
      letterSpacing: '0.5px'
    },
    controlsSection: {
      maxWidth: '1400px',
      margin: '0 auto 50px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '25px',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    backButton: {
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #f48fb1 0%, #ec407a 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(244, 143, 177, 0.3)',
      letterSpacing: '0.5px'
    },
    filtersWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      alignItems: 'center'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
      letterSpacing: '0.3px'
    },
    filterSelect: {
      padding: '11px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'white',
      color: '#333',
      outline: 'none'
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
      `}</style>
      {currentPage === 'shop' ? (
        <>
          <div
            ref={(el) => (sectionRefs.current['classification'] = el)}
            data-section="classification"
            style={{
              ...styles.classificationSection,
              opacity: visibleSections['classification'] ? 1 : 0,
              animation: visibleSections['classification'] ? 'fadeInDown 0.8s ease-out' : 'none'
            }}
          >
            <h2 style={styles.sectionTitle}>Shop By Classification</h2>
            <p style={styles.sectionSubtitle}>Discover Your Perfect Flavor Journey</p>
            <div style={styles.categoriesGrid}>
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className={visibleSections['classification'] ? `animate-in stagger-${idx + 1}` : ''}
                  style={{
                    ...styles.categoryCard,
                    opacity: visibleSections['classification'] ? 1 : 0
                  }}
                  onClick={() => handleCategoryClick(cat)}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('.cat-img');
                    const overlay = e.currentTarget.querySelector('.cat-overlay');
                    if (img) img.style.transform = 'scale(1.1)';
                    if (overlay) overlay.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(244, 143, 177, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('.cat-img');
                    const overlay = e.currentTarget.querySelector('.cat-overlay');
                    if (img) img.style.transform = 'scale(1)';
                    if (overlay) overlay.style.opacity = '0';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(244, 143, 177, 0.2)';
                  }}
                >
                  <div style={styles.categoryImageWrapper}>
                    <img src={cat.image} alt={cat.name} style={styles.categoryImage} className="cat-img" />
                    <div style={styles.categoryOverlay} className="cat-overlay">
                      <span style={styles.exploreText}>Explore →</span>
                    </div>
                  </div>
                  <h3 style={styles.categoryName}>{cat.name}</h3>
                </div>
              ))}
            </div>
          </div>
          <div
            ref={(el) => (sectionRefs.current['products'] = el)}
            data-section="products"
            style={styles.productsSection}
          >
            <h2 style={{
              ...styles.productsSectionTitle,
              opacity: visibleSections['products'] ? 1 : 0,
              animation: visibleSections['products'] ? 'fadeInUp 0.8s ease-out' : 'none'
            }}>Our Premium Collection</h2>
            <p style={{
              ...styles.productsSectionSubtitle,
              opacity: visibleSections['products'] ? 1 : 0,
              animation: visibleSections['products'] ? 'fadeInUp 0.9s ease-out' : 'none'
            }}>Handcrafted with Love, Served with Passion</p>
            <div style={styles.productsGrid}>
              {products.map((product, idx) => (
                <div
                  key={product.id}
                  className={visibleSections['products'] ? 'animate-in' : ''}
                  style={{
                    ...styles.productCard,
                    opacity: visibleSections['products'] ? 1 : 0,
                    animationDelay: visibleSections['products'] ? `${idx * 0.1}s` : '0s'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredProduct(product.id);
                    e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(244, 143, 177, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    setHoveredProduct(null);
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={styles.productImageWrapper}>
                    <img
                      src={hoveredProduct === product.id ? (product.image2 || product.image1) : product.image1}
                      alt={product.name}
                      style={styles.productImage}
                    />
                    {hoveredProduct === product.id && (
                      <div style={styles.quickViewOverlay}>
                        <span style={styles.quickViewText}>Quick View</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <div style={styles.priceRow}>
                      <p style={styles.productPrice}>₹{product.price}</p>
                      <button
                        style={styles.ingredientsBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowIngredients(showIngredients === product.id ? null : product.id);
                        }}
                      >
                        🌿 Ingredients
                      </button>
                    </div>
                    {showIngredients === product.id && (
                      <div style={styles.ingredientsPopup}>
                        <ul style={styles.ingredientsList}>
                          {product.ingredients.map((ing, i) => (
                            <li key={i} style={styles.ingredientItem}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.inStock === false}
                      style={{ ...styles.addToCartBtn, ...(product.inStock === false ? { opacity: 0.55, cursor: 'not-allowed' } : {}) }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f48fb1 0%, #f06292 100%)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(244, 143, 177, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ec407a 0%, #f48fb1 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 143, 177, 0.3)';
                      }}
                    >
                      {product.inStock === false ? 'Out of stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : currentPage === 'collection' && selectedCategory && (
        <>
          <div
            ref={(el) => (sectionRefs.current['collectionBanner'] = el)}
            data-section="collectionBanner"
            style={{
              ...styles.collectionBanner,
              opacity: visibleSections['collectionBanner'] ? 1 : 0,
              animation: visibleSections['collectionBanner'] ? 'scaleIn 0.8s ease-out' : 'none',
              background: `url(${selectedCategory.image}) center/cover no-repeat`,
              filter: 'brightness(0.8)'
            }}
          >
            <div style={{ ...styles.categoryOverlay, opacity: 1, background: 'linear-gradient(135deg, rgba(236, 64, 122, 0.9) 0%, rgba(244, 143, 177, 0.9) 100%)', borderRadius: '16px' }}></div>
            <div style={styles.bannerContent}>
              <h2 style={styles.bannerTitle}>{selectedCategory.name} Collection</h2>
              <p style={styles.bannerSubtitle}>Browse our exclusive range of {selectedCategory.name.toLowerCase()} ice creams.</p>
            </div>
          </div>

          <div
            ref={(el) => (sectionRefs.current['controlsSection'] = el)}
            data-section="controlsSection"
            style={{
              ...styles.controlsSection,
              opacity: visibleSections['controlsSection'] ? 1 : 0,
              animation: visibleSections['controlsSection'] ? 'fadeInUp 0.8s ease-out' : 'none'
            }}
          >
            <button style={styles.backButton} onClick={handleBackToShop}>← Back to Shop</button>
            <div style={styles.filtersWrapper}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel} htmlFor="price-filter">Price:</label>
                <select
                  id="price-filter"
                  style={styles.filterSelect}
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="all">All Prices</option>
                  <option value="under-300">Under ₹300</option>
                  <option value="above-300">₹300 & Above</option>
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel} htmlFor="veg-filter">Diet:</label>
                <select
                  id="veg-filter"
                  style={styles.filterSelect}
                  value={vegFilter}
                  onChange={(e) => setVegFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="veg">Vegetarian</option>
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel} htmlFor="sort-by">Sort By:</label>
                <select
                  id="sort-by"
                  style={styles.filterSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="best-selling">Best Selling</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div
            ref={(el) => (sectionRefs.current['collectionProducts'] = el)}
            data-section="collectionProducts"
            style={styles.productsSection}
          >
            <div style={styles.productsGrid}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className={visibleSections['collectionProducts'] ? 'animate-in' : ''}
                    style={{
                      ...styles.productCard,
                      opacity: visibleSections['collectionProducts'] ? 1 : 0,
                      animationDelay: visibleSections['collectionProducts'] ? `${idx * 0.1}s` : '0s'
                    }}
                    onMouseEnter={(e) => {
                      setHoveredProduct(product.id);
                      e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 25px 60px rgba(244, 143, 177, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      setHoveredProduct(null);
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div style={styles.productImageWrapper}>
                      <img
                        src={hoveredProduct === product.id ? (product.image2 || product.image1) : product.image1}
                        alt={product.name}
                        style={styles.productImage}
                      />
                      {hoveredProduct === product.id && (
                        <div style={styles.quickViewOverlay}>
                          <span style={styles.quickViewText}>Quick View</span>
                        </div>
                      )}
                    </div>
                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{product.name}</h3>
                      <div style={styles.priceRow}>
                        <p style={styles.productPrice}>₹{product.price}</p>
                        <button
                          style={styles.ingredientsBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowIngredients(showIngredients === product.id ? null : product.id);
                          }}
                        >
                          🌿 Ingredients
                        </button>
                      </div>
                      {showIngredients === product.id && (
                        <div style={styles.ingredientsPopup}>
                          <ul style={styles.ingredientsList}>
                            {product.ingredients.map((ing, i) => (
                              <li key={i} style={styles.ingredientItem}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.inStock === false}
                        style={{ ...styles.addToCartBtn, ...(product.inStock === false ? { opacity: 0.55, cursor: 'not-allowed' } : {}) }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f48fb1 0%, #f06292 100%)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(244, 143, 177, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #ec407a 0%, #f48fb1 100%)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 143, 177, 0.3)';
                        }}
                      >
                        {product.inStock === false ? 'Out of stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '18px', color: '#555' }}>
                  No products found for these filters. Try adjusting your selections!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};