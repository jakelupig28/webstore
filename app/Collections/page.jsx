'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { Loader } from '../../components/Loader';
import { HoverImage } from '../../components/HoverImage';
import { VideoBackground } from '../../components/VideoBackground';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tees', label: 'T-Shirts' },
  { id: 'jerseys', label: 'Jerseys' },
  { id: 'bottoms', label: 'Bottoms & Sweats' },
  { id: 'headwear', label: 'Headwear & Caps' },
  { id: 'accessories', label: 'Accessories & Stash' },
  { id: 'painstain', label: 'PAIN STAIN 2025' }
];

export default function CollectionsPage() {
  const { products, cartCalls } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    setIsMobile(window.innerWidth <= 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalQty = cartCalls.cart?.totalQuantity || 0;

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;

    switch (selectedCategory) {
      case 'tees':
        return product.category === 'T-Shirts';
      case 'jerseys':
        return product.category === 'Jerseys';
      case 'bottoms':
        return product.category === 'Bottoms';
      case 'headwear':
        return product.category === 'Headwear';
      case 'accessories':
        return product.category === 'Accessories';
      case 'painstain':
        return product.tags?.includes('PAIN STAIN 2025');
      default:
        return true;
    }
  });

  return (
    <div className="mainContainer collections">
      <Loader />
      <div className="mainContainerCollections">
        <section className="collectionsPage collection">
          <div className="cllctnpgcContainer">
            {/* Dynamic Collection Video Background */}
            <div className="cllctnpgccVidBG">
              <VideoBackground
                src="/brand/video brand2.mp4"
                poster="/brand/background stash.jpg"
              />
            </div>

            {/* Collection Contents */}
            <div className="cllctnpgccContents">
              {/* Category Nav / Sidebar */}
              <div className="cllctnpgcccCategories">
                <h6>COLLECTIONS</h6>
                <p>
                  You have {totalQty || '0'} item{totalQty === 1 ? '' : 's'} in your Cart
                </p>

                {/* Desktop Category Navigation */}
                {!isMobile ? (
                  <div className="cllctnpgccccNavigations">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={selectedCategory === cat.id ? 'active' : ''}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Mobile Select Dropdown */
                  <div className="cllctnpgccccNavigations">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="collectionSelect"
                      style={{
                        backgroundColor: '#121215',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.25)',
                        padding: '8px 36px 8px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        width: '100%',
                        marginTop: '10px'
                      }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="cllctnpgcccCollections">
                <div className="cllctnpgccccCategory">
                  {filteredProducts.length === 0 ? (
                    <div className="cllctnpgcccccEmpty">
                      <p>No products available in this drop.</p>
                    </div>
                  ) : (
                    filteredProducts.map((item, index) => {
                      const primary = item.images[0] || '/brand/basiclogo_nobg.png';
                      const secondary = item.images[1] || null;
                      const isOutOfStock = item.variants?.every(v => !v.availableForSale);

                      return (
                        <Link
                          key={item.id || index}
                          className="cllctnpgcccccc"
                          href={`/Collections/${item.handle}`}
                        >
                          <HoverImage
                            primary={primary}
                            secondary={secondary}
                            alt={item.title}
                          />
                          <div className="cllctnpgccccccTitle">
                            <div className="cllctnpgccccccStocks">
                              <p className="stock in-stock">
                                {isOutOfStock ? 'Out of stock' : 'Few stocks left'}
                              </p>
                            </div>
                            <h6>{item.title}</h6>
                            <p>Php. {formatPhp(item.price)}</p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
