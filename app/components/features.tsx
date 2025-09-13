"use client";

import React from "react";
import { Playfair_Display } from "@next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Features() {
  const { scrollYProgress } = useScroll();

  // Parallax effect for image (slight 3D floating feel)
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const rotateImage = useTransform(scrollYProgress, [0, 1], ["0deg", "8deg"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  // Parallax for text (slide upward while fading in)
  const yText = useTransform(scrollYProgress, [0, 1], ["50%", "-10%"]);
  const opacityText = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  return (
    <section className="w-full flex flex-col sticky top-0 z-[702] items-center justify-center px-8 py-32 bg-white">
      {/* Title */}
      <h2
        className={`${playfair.className} text-4xl md:text-5xl font-semibold mb-12 text-center`}
      >
        How Prospero Empowers Communities
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        {/* Left Side - Parallax Illustration */}
        <motion.div
          style={{
            y: yImage,
            rotate: rotateImage,
            scale: scaleImage,
          }}
          className="md:w-1/2 flex justify-center mb-10 md:mb-0"
        >
          <img
            src="/featureimg.png"
            alt="Prospero illustration"
            className="rounded-xl shadow-2xl w-[90%] md:w-[80%]"
          />
        </motion.div>

        {/* Right Side - Steps with Vertical Parallax */}
        <motion.div
          style={{ y: yText, opacity: opacityText }}
          className="md:w-1/2 space-y-10"
        >
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-start space-x-4"
          >
            <span className="text-3xl font-bold text-green-600">1</span>
            <div>
              <h3 className="text-xl font-semibold">
                Free Schools & Skill Roadmaps
              </h3>
              <p className="text-gray-600 mb-3">
                We provide free education for children and skill guidance for
                adults, helping every learner unlock their true potential.
              </p>
              <button className="px-4 py-2 text-sm rounded-lg bg-green-600 cursor-pointer text-white hover:bg-green-700 transition">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex items-start space-x-4"
          >
            <span className="text-3xl font-bold text-yellow-500">2</span>
            <div>
              <h3 className="text-xl font-semibold">DonorConnect Program</h3>
              <p className="text-gray-600 mb-3">
                Through our donor program, you can contribute funds directly to
                support schools, training, and community growth initiatives.
              </p>
              <button className="px-4 py-2 text-sm rounded-lg bg-yellow-500 cursor-pointer text-white hover:bg-yellow-600 transition">
                Contribute
              </button>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex items-start space-x-4"
          >
            <span className="text-3xl font-bold text-blue-600">3</span>
            <div>
              <h3 className="text-xl font-semibold">
                Local Jobs & Opportunities
              </h3>
              <p className="text-gray-600 mb-3">
                Our platform connects people with local job opportunities,
                creating pathways to stable incomes and brighter futures.
              </p>
              <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition">
                Explore Jobs
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
