"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import PharmakoPersonTwoPCAndComputerPNG from "../../../public/PharmakoPersonTwoPcAndPhone-PNG.png";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export function PharmiWorkspace() {
  const router = useRouter();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <button
        className="relative z-10 flex mt-4 ml-4 items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-6 h-6 mr-2" />
      </button>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" />

      {/* Floating orbs - ambient */}
      <motion.div
        className="absolute w-75 h-75 rounded-full opacity-20"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-50 h-50 rounded-full opacity-15"
        animate={{
          y: [0, 10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Pharmi character - centered with breathing/floating */}
      <motion.div
        className="flex flex-col justify-center items-end h-full"
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          {/* Laptop base */}

          <Image
            src={PharmakoPersonTwoPCAndComputerPNG}
            alt="Pharmi"
            width={900}
            height={900}
            className="max-w-[900px] w-[90%] h-auto object-contain"
            loading="eager"
          />
        </div>
      </motion.div>

      {/* Bottom gradient */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
    </div>
  );
}
