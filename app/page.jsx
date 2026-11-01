'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';
import { Loader } from '../components/Loader';
import { HoverImage } from '../components/HoverImage';
import { VideoBackground } from '../components/VideoBackground';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export default function HomePage() {
  const { products, navCalls } = useStore();

  const tees = products.filter(p => p.category === 'T-Shirts');
  const jerseysAndBottoms = products.filter(p => p.category === 'Jerseys' || p.category === 'Bottoms');
  const headwear = products.filter(p => p.category === 'Headwear');
  const accessories = products.filter(p => p.category === 'Accessories');

  const rows = [
    tees,
    jerseysAndBottoms,
    headwear,
    accessories
  ].filter(r => r.length > 0);

  return (
    <div className="mainContainer home">
      <Loader />
      <div className="mainContainerHome">
        <section className="homePage heroPage">
          <div className="hmpghrpgContainer">
            {/* Ambient Background Video featuring LARO SPORTS Brand Video */}
            <div className="hmpghrpgVidBG">
              <VideoBackground
                src="/brand/video brand2.mp4"
                poster="/brand/background stash.jpg"
              />
            </div>

            {/* Merch Grid with Vignette Shadows */}
            <div className="hmpghrpgAllMerch">
              <div className="hmpghrpgamcTopShadow" />
              <div className="hmpghrpgamcBottomShadow" />
              <div className="hmpghrpgamContainer">
                {rows.map((rowProducts, rowIndex) => (
                  <div key={rowIndex} className="hmpghrpgamcCategory">
                    {rowProducts.map((item, itemIndex) => {
                      const primary = item.images[0] || '/brand/basiclogo_nobg.png';
                      const secondary = item.images[1] || null;
                      const isOutOfStock = item.variants?.every(v => !v.availableForSale);

                      return (
                        <Link
                          key={item.id || itemIndex}
                          className="hmpghrpgamc"
                          href={`/Collections/${item.handle}`}
                          onClick={() => navCalls.handlePageClick('Collections')}
                        >
                          <HoverImage
                            primary={primary}
                            secondary={secondary}
                            alt={item.title}
                          />
                          <div className="hmpghrpgamcTitle">
                            <div className="hmpghrpgamcStocks">
                              <p className="stock in-stock">
                                {isOutOfStock ? 'Out of stock' : 'Few stocks left'}
                              </p>
                            </div>
                            <h6>{item.title}</h6>
                            <p>Php. {formatPhp(item.price)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
