"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCcw, Maximize, Minimize, X } from 'lucide-react';

interface StoryReaderHeaderProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onGalleryClick: () => void;
  onRestartClick: () => void;
  showRestartButton?: boolean;
  isRTL?: boolean;
}

export const StoryReaderHeader: React.FC<StoryReaderHeaderProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onGalleryClick,
  onRestartClick,
  showRestartButton = true,
  isRTL = false,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - left/right aligned based on direction */}
          <div className={cn(
            "flex items-center",
            isRTL ? "order-3" : "order-1"
          )}>
            <Link href="/" prefetch={true} className="relative">
              <div className="w-[120px] h-[72px]">
                <Image
                  src="/landing-page-images/logo-v2.svg"
                  alt="Choice Story"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Empty center space */}
          <div className="flex-1 order-2" />

          {/* Right: Story Action Icons */}
          <div className={cn(
            "flex items-center gap-2",
            isRTL ? "order-1" : "order-3"
          )}>
            {/* Gallery/Library button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onGalleryClick}
              className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-600 rounded-full shadow-lg transition-colors"
              aria-label="Gallery"
              title="Gallery"
            >
              <Image 
                src="/icons/library.svg" 
                alt="Gallery"
                width={24}
                height={24}
              />
            </motion.button>

            {/* Fullscreen toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFullscreen}
              className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-600 rounded-full shadow-lg transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="h-6 w-6" />
              ) : (
                <Maximize className="h-6 w-6" />
              )}
            </motion.button>

            {/* Restart story button */}
            {showRestartButton && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRestartClick}
                className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-600 rounded-full shadow-lg transition-colors"
                aria-label="Restart story"
                title="Restart story"
              >
                <RotateCcw className="h-6 w-6" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoryReaderHeader;




