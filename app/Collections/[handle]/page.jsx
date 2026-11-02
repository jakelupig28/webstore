'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '../../../context/StoreContext';
import { Loader } from '../../../components/Loader';
import { HoverImage } from '../../../components/HoverImage';
import { VideoBackground } from '../../../components/VideoBackground';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export default function ProductDetailPage() {
  const params = useParams();
  const handle = params?.handle;
  const { products, cartCalls } = useStore();

  const product = products.find(
    p => p.handle === handle || p.numericId === handle || p.id === handle
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants?.[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) {
    return (
      <div className="mainContainer merch">
        <div className="mainContainerMerch" style={{ textAlign: 'center', paddingTop: '100px', color: '#fff' }}>
          <h4>Product not found</h4>
          <Link href="/Collections" style={{ color: '#aaa', textDecoration: 'underline', marginTop: '20px', display: 'inline-block' }}>
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant =
    product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];

  const isTshirt = product.category === 'T-Shirts';
  const isJersey = product.category === 'Jerseys';
  const isBottom = product.category === 'Bottoms';

  const recommendations = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const fallbackRecommendations = recommendations.length < 4
    ? [...recommendations, ...products.filter(p => p.id !== product.id).slice(0, 4 - recommendations.length)]
    : recommendations;

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    setIsAdding(true);
    try {
      await cartCalls.addToCart(selectedVariant.id, quantity, product);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const isAvailable = selectedVariant ? selectedVariant.availableForSale : true;

  return (
    <div className="mainContainer merch">
      <Loader />
      <div className="mainContainerMerch">
        <section className="merchPage landingPage">
          <div className="mrchpglndpgContainer">
            {/* Ambient Video Background */}
            <div className="mrchpglndpgVidBG">
              <VideoBackground
                src="/brand/video brand2.mp4"
                poster="/brand/background stash.jpg"
              />
            </div>

            <div className="mrchpglndpgcContents">
              {/* Left Column: Product Details & Size Chart */}
              <div className="mrchpglndpgcc left">
                <Link
                  href="/Collections"
                  className="productBackArrow"
                  aria-label="Back to Collections"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(255, 255, 255, 0.75)',
                    textDecoration: 'none',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: 'fit-content'
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Collections</span>
                </Link>
                <div className="mrchpglndpgccHeader">
                  <h4>{product.title}</h4>
                  <h6>{product.tags?.[0] || 'LARO SPORTS™'}</h6>
                  <div
                    className="mrchpglndpgcchDescription"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                </div>

                {/* Sizing Chart for T-Shirts */}
                {isTshirt && (
                  <div className="mrchpglndpgccSizeChart">
                    <table>
                      <thead>
                        <tr>
                          <th><h6>Size</h6></th>
                          <th><h6>Width (in)</h6></th>
                          <th><h6>Length (in)</h6></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td><p>S</p></td><td><p>21</p></td><td><p>27</p></td></tr>
                        <tr><td><p>M</p></td><td><p>22</p></td><td><p>28</p></td></tr>
                        <tr><td><p>L</p></td><td><p>23</p></td><td><p>29</p></td></tr>
                        <tr><td><p>XL</p></td><td><p>24</p></td><td><p>30</p></td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sizing Chart for Jerseys */}
                {isJersey && (
                  <div className="mrchpglndpgccSizeChart">
                    <table>
                      <thead>
                        <tr>
                          <th><h6>Size</h6></th>
                          <th><h6>Chest (in)</h6></th>
                          <th><h6>Length (in)</h6></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td><p>M</p></td><td><p>23</p></td><td><p>29</p></td></tr>
                        <tr><td><p>L</p></td><td><p>24</p></td><td><p>30</p></td></tr>
                        <tr><td><p>XL</p></td><td><p>25</p></td><td><p>31</p></td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sizing Chart for Bottoms */}
                {isBottom && (
                  <div className="mrchpglndpgccSizeChart">
                    <table>
                      <thead>
                        <tr>
                          <th><h6>Size</h6></th>
                          <th><h6>Waist (in)</h6></th>
                          <th><h6>Outseam (in)</h6></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td><p>S</p></td><td><p>28-30</p></td><td><p>38</p></td></tr>
                        <tr><td><p>M</p></td><td><p>30-32</p></td><td><p>40</p></td></tr>
                        <tr><td><p>L</p></td><td><p>32-34</p></td><td><p>41</p></td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Center Column: High-Res Product Photos Gallery */}
              <div className="mrchpglndpgcImgs">
                {product.images?.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`${product.title} view ${idx + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>

              {/* Right Column: Pricing, Sizes, Quantity, and Cart Action */}
              <div className="mrchpglndpgcc right">
                <div className="mrchpglndpgccInfo">
                  <h4 style={{ color: '#fff', marginBottom: '1.5vw', fontWeight: 700 }}>
                    Php. {formatPhp(selectedVariant ? selectedVariant.price : product.price)}
                  </h4>

                  {/* Size Selector */}
                  {product.variants?.length > 1 && (
                    <div className="mrchpglndpgcciSizes">
                      <h6>SELECT SIZE</h6>
                      <div className="sizeGrid">
                        {product.variants.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            disabled={!v.availableForSale}
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`${selectedVariant?.id === v.id ? 'active' : ''} ${
                              !v.availableForSale ? 'outOfStock' : ''
                            }`}
                          >
                            {v.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Control */}
                  <div className="mrchpglndpgcciQuantity">
                    <h6>QUANTITY</h6>
                    <div className="qtyControl">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <p>{quantity}</p>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add To Cart CTA Button */}
                  <div className="mrchpglndpgcciAddToCart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
                    <button
                      type="button"
                      disabled={!isAvailable || isAdding}
                      onClick={handleAddToCart}
                      style={
                        addedToast
                          ? {
                              background: '#1aa838',
                              color: '#fff',
                              fontWeight: 700,
                              letterSpacing: '1.5px',
                              transition: 'all 0.3s ease'
                            }
                          : undefined
                      }
                    >
                      {addedToast
                        ? '✓ ADDED TO CART'
                        : isAdding
                        ? 'ADDING...'
                        : !isAvailable
                        ? 'OUT OF STOCK'
                        : 'ADD TO CART'}
                    </button>
                    {addedToast && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '8px 14px',
                          background: 'rgba(0,0,0,0.85)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ color: '#00ff66', fontSize: '12px', fontWeight: 700 }}>✓</span>
                        <span style={{ color: '#fff', fontSize: '11px', letterSpacing: '0.8px' }}>Item added to your cart</span>
                        <Link
                          href="/Cart"
                          style={{
                            color: '#00ff66',
                            fontSize: '11px',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            marginLeft: '4px'
                          }}
                        >
                          View Cart
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Recommendations */}
                <div className="mrchpglndpgccRecommendation">
                  <h6>YOU MAY ALSO LIKE</h6>
                  <div className="mrchpglndpgccItems">
                    {fallbackRecommendations.map(rec => (
                      <Link
                        key={rec.id}
                        href={`/Collections/${rec.handle}`}
                        className="recItem"
                        style={{ display: 'block', marginBottom: '15px' }}
                      >
                        <HoverImage
                          primary={rec.images?.[0] || '/brand/basiclogo.jpg'}
                          secondary={rec.images?.[1] || rec.images?.[0] || '/brand/basiclogo.jpg'}
                          alt={rec.title}
                        />
                        <p style={{ color: '#fff', fontSize: '12px', marginTop: '4px' }}>
                          {rec.title}
                        </p>
                        <p style={{ color: '#aaa', fontSize: '11px' }}>
                          Php. {formatPhp(rec.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
